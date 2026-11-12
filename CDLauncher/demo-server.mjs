import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../backend/models/User.js';
import Fault from '../backend/models/Fault.js';
import { createApp } from '../backend/app.js';
const appRoot = fileURLToPath(new URL('../', import.meta.url));
const home = process.argv[2] || path.join(process.env.LOCALAPPDATA, 'SerafettinStaj', 'ArizaTakipCD');
fs.mkdirSync(home, { recursive: true });
const configPath = path.join(home, 'demo-ayarlar-yerel.json');
if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, JSON.stringify({ jwtSecret: crypto.randomBytes(48).toString('hex'), controlToken: crypto.randomBytes(32).toString('hex') }));
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
process.env.JWT_SECRET = config.jwtSecret;
process.env.NODE_ENV = 'development';
process.env.TRUST_PROXY = '0';
process.env.CORS_ORIGINS = 'https://localhost,http://localhost,capacitor://localhost,http://127.0.0.1:5001,http://localhost:5001';
const accounts = JSON.parse(fs.readFileSync(new URL('./demo-hesaplar.json', import.meta.url), 'utf8'));
await mongoose.connect('mongodb://127.0.0.1:27031/ariza_cd_demo', { serverSelectionTimeoutMS: 20000 });
await User.init(); await Fault.init();
const users = {};
for (const account of accounts) {
  let user = await User.findOne({ username: account.username });
  if (!user) user = await User.create({ username: account.username, password: await bcrypt.hash(account.password, 10), role: account.role, isApproved: true });
  users[account.username] = user;
}
if (!(await Fault.exists({}))) {
  await Fault.create([
    { title: 'ÖRNEK - Toplantı odası yazıcısı', description: 'Tamamen kurmaca eğitim kaydıdır. Yazıcıdan çıktı alınamadığı örnek durum.', location: 'Örnek bina - Kat 1', priority: 'orta', status: 'beklemede', createdBy: users.yonetici._id, assignedTo: users.teknisyen._id },
    { title: 'ÖRNEK - Danışma bilgisayarı', description: 'Tamamen kurmaca eğitim kaydıdır. Bilgisayar açılışının incelendiği örnek durum.', location: 'Örnek bina - Danışma', priority: 'kritik', status: 'devam-ediyor', createdBy: users.yonetici._id, assignedTo: users.teknisyen._id },
    { title: 'ÖRNEK - İkinci görevlinin kaydı', description: 'Rol ayrımını göstermek için ikinci teknisyene atanmış kurmaca arıza.', location: 'Örnek bina - Kat 2', priority: 'orta', status: 'beklemede', createdBy: users.yonetici._id, assignedTo: users.teknisyen2._id },
    { title: 'ÖRNEK - Henüz atanmayan kayıt', description: 'Atanmayan kaydın yalnız yönetici listesinde görünmesini göstermek için hazırlanmıştır.', location: 'Örnek bina - Toplantı salonu', priority: 'orta', status: 'beklemede', createdBy: users.yonetici._id }
  ]);
}
const app = express();
let server;
app.get('/cd-demo/health', (_req, res) => res.json({ success: mongoose.connection.readyState === 1, demo: 'ariza-cd-1', database: 'ariza_cd_demo', port: 5001 }));
app.post('/cd-demo/shutdown', (req, res) => {
  if (req.headers['x-cd-control'] !== config.controlToken) return res.status(403).json({ success: false });
  res.json({ success: true });
  setTimeout(() => close(), 100);
});
app.use(createApp());
server = app.listen(5001, '127.0.0.1', () => console.log('Ariza CD demo hazir: http://127.0.0.1:5001'));
let closing = false;
function close() {
  if (closing) return; closing = true;
  server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  setTimeout(() => process.exit(0), 3000).unref();
}
process.on('SIGTERM', close); process.on('SIGINT', close);
