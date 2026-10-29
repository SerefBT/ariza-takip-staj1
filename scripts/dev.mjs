import { spawn } from 'node:child_process';
import { root, setup } from './setup.mjs';
import { ensureMongo, portOpen } from './mongo.mjs';
setup();
let mongo, server, vite;
let stopping = false;
function stop() {
  if (stopping) return;
  stopping = true;
  vite?.kill();
  server?.kill();
  mongo?.kill();
  setTimeout(() => process.exit(process.exitCode || 0), 500).unref();
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
try {
  if (await portOpen(5000))
    throw Error(
      '5000 portu kullanimda. Calisan uygulama icin http://localhost:5000 adresini acin.',
    );
  mongo = await ensureMongo();
  server = spawn(process.execPath, ['backend/server.js'], {
    cwd: root,
    stdio: 'inherit',
    windowsHide: true,
  });
  server.on('exit', stop);
  if (process.argv.includes('--development')) {
    vite = spawn(
      process.execPath,
      ['node_modules/vite/bin/vite.js', '--config', 'frontend/vite.config.js', 'frontend'],
      { cwd: root, stdio: 'inherit', windowsHide: true },
    );
    vite.on('exit', stop);
  }
  console.log(
    'Ariza Takip: http://localhost:5000' + (vite ? ' | gelistirme: http://localhost:5173' : ''),
  );
} catch (e) {
  console.error(e.message);
  stop();
  process.exitCode = 1;
}
