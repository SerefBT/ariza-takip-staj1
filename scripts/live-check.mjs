import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import { chromium } from '@playwright/test';
const config = JSON.parse(fs.readFileSync('.local/production.json'));
const url = 'https://serafettin-ariza-staj1.onrender.com';
const name = 'yayin_kontrol_' + crypto.randomBytes(5).toString('hex'),
  pass = 'Test!' + crypto.randomBytes(14).toString('base64url');
let browser, userId, faultId, token;
const results = [];
async function api(route, { method = 'GET', body, auth = token } = {}) {
  const r = await fetch(url + '/api' + route, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: 'Bearer ' + auth } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(60000),
  });
  const d = await r.json();
  return { status: r.status, data: d };
}
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const c = await browser.newContext({ viewport: { width: 1440, height: 1000 } }),
    p = await c.newPage(),
    errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.goto(url);
  await p.getByRole('heading', { name: 'Çalışma alanınıza giriş yapın' }).waitFor();
  await p.screenshot({ path: 'artifacts/kontrol/07-canli-giris.png', fullPage: true });
  await p.getByLabel('Kullanıcı adı', { exact: true }).fill(config.ADMIN_USERNAME);
  await p.locator('#login-password').fill(config.ADMIN_PASSWORD);
  await p.getByRole('button', { name: 'Giriş Yap', exact: true }).click();
  await p.getByRole('heading', { name: /Arızalara genel bakış/ }).waitFor();
  await p.waitForFunction(() => !document.querySelector('.skeleton-card'));
  token = await p.evaluate(() => localStorage.getItem('ariza_token'));
  assert.ok(token);
  results.push('HTTPS uzerinden yonetici girisi ve arayuz');
  let r = await api('/auth/admin/users', {
    method: 'POST',
    body: { username: name, password: pass, role: 'teknisyen' },
  });
  assert.equal(r.status, 201);
  userId = r.data.user.id;
  r = await api('/faults', {
    method: 'POST',
    body: {
      title: 'Yayin baglanti kontrolu',
      description: 'Yalnizca yayin dogrulamasi icin olusturulan ve test sonunda silinen kayit.',
      location: 'Test',
      priority: 'orta',
    },
  });
  assert.equal(r.status, 201);
  faultId = r.data._id;
  r = await api('/auth/login', {
    method: 'POST',
    auth: '',
    body: { username: name, password: pass },
  });
  assert.equal(r.status, 200);
  const techToken = r.data.token;
  assert.equal((await api('/faults', { auth: techToken })).data.length, 0);
  assert.equal(
    (
      await api('/faults/' + faultId, {
        method: 'PUT',
        auth: techToken,
        body: { assignedTo: userId },
      })
    ).status,
    403,
  );
  assert.equal(
    (await api('/faults/' + faultId, { method: 'PUT', body: { assignedTo: userId } })).status,
    200,
  );
  r = await api('/faults', { auth: techToken });
  assert.equal(r.status, 200);
  assert.equal(r.data.length, 1);
  assert.equal(r.data[0]._id, faultId);
  results.push('Canli MongoDB kaydi, atama ve teknisyen gorunurlugu');
  for (const status of ['devam-ediyor', 'tamamlandi']) {
    r = await api('/faults/' + faultId, { method: 'PUT', auth: techToken, body: { status } });
    assert.equal(r.status, 200);
    assert.equal(r.data.status, status);
  }
  results.push('Canli durum guncelleme ve yetkisiz atamanin reddi');
  r = await api('/faults/' + faultId, { method: 'DELETE' });
  assert.equal(r.status, 200);
  faultId = null;
  await p.reload();
  await p.getByText('Her şey yolunda. Açık arıza yok.', { exact: true }).waitFor();
  await p.screenshot({ path: 'artifacts/kontrol/08-canli-yonetici.png', fullPage: true });
  await p.setViewportSize({ width: 390, height: 844 });
  assert.ok(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await p.screenshot({ path: 'artifacts/kontrol/09-canli-telefon.png', fullPage: true });
  assert.deepEqual(errors, []);
  results.push('Gercek internet ortaminda masaustu ve telefon gorunumu; JS hatasi yok');
} finally {
  await browser?.close();
  await mongoose.connect(config.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  try {
    const db = mongoose.connection.db;
    if (faultId)
      await db
        .collection('faults')
        .deleteOne({ _id: new mongoose.Types.ObjectId(faultId), title: 'Yayin baglanti kontrolu' });
    if (userId)
      await db
        .collection('users')
        .deleteOne({ _id: new mongoose.Types.ObjectId(userId), username: name });
    const testUsers = await db.collection('users').countDocuments({ username: name });
    assert.equal(testUsers, 0);
    console.log('Yalnizca bu denemede olusturulan kayitlar temizlendi.');
  } finally {
    await mongoose.disconnect();
  }
}
const report = {
  passed: true,
  url,
  date: new Date().toISOString(),
  checks: results,
  temporaryTestDataRemoved: true,
};
fs.writeFileSync('artifacts/kontrol/canli-yayin-sonucu.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
