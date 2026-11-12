import fs from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';
const home = process.argv[2];
const configPath = path.join(home, 'demo-ayarlar-yerel.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  try { await fetch('http://127.0.0.1:5001/cd-demo/shutdown', { method: 'POST', headers: { 'x-cd-control': config.controlToken }, signal: AbortSignal.timeout(3000) }); } catch {}
}
let connection;
try {
  connection = await mongoose.createConnection('mongodb://127.0.0.1:27031/admin', { serverSelectionTimeoutMS: 2500 }).asPromise();
  await connection.db.admin().command({ shutdown: 1, timeoutSecs: 5 });
} catch {} finally { if (connection) await connection.close().catch(() => {}); }
