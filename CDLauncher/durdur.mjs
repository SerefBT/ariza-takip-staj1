import fs from 'node:fs';
import path from 'node:path';
import { MongoClient } from 'mongodb';
const home = process.argv[2];
const configPath = path.join(home, 'demo-ayarlar-yerel.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  try { await fetch('http://127.0.0.1:5001/cd-demo/shutdown', { method: 'POST', headers: { 'x-cd-control': config.controlToken }, signal: AbortSignal.timeout(3000) }); } catch {}
}
const client = new MongoClient('mongodb://127.0.0.1:27031', { serverSelectionTimeoutMS: 2500 });
try { await client.connect(); await client.db('admin').command({ shutdown: 1, timeoutSecs: 5 }); } catch {} finally { await client.close().catch(() => {}); }
