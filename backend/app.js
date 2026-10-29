import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import faults from './routes/fault.js';
import { ApiError, errorHandler } from './lib/errors.js';
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          fontSrc: ["'self'"],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"],
        },
      },
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );
  const origins = new Set(
    (
      process.env.CORS_ORIGINS ||
      'http://localhost:5173,http://127.0.0.1:5173,https://localhost,http://localhost,capacitor://localhost'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  app.use('/api', (req, res, next) =>
    cors({
      origin(origin, cb) {
        const ownOrigin = req.protocol + '://' + req.get('host');
        if (!origin || origin === ownOrigin || origins.has(origin)) cb(null, true);
        else cb(new ApiError(403, 'Bu bağlantı kaynağına izin verilmiyor.'));
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })(req, res, next),
  );
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '32kb' }));
  app.use('/api', (req, res, next) => {
    if (
      ['POST', 'PUT'].includes(req.method) &&
      (!req.body || Array.isArray(req.body) || typeof req.body !== 'object')
    )
      return next(new ApiError(400, 'Bilgileri JSON nesnesi olarak gönderin.'));
    next();
  });
  app.get('/api/health', (req, res) =>
    res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({
      success: mongoose.connection.readyState === 1,
      service: 'ariza-takip',
      database: mongoose.connection.readyState === 1 ? 'hazir' : 'baglanti-yok',
    }),
  );
  app.use('/api/auth', auth);
  app.use('/api/faults', faults);
  app.use('/api', (req, res) =>
    res.status(404).json({ success: false, message: 'İşlem adresi bulunamadı.' }),
  );
  app.get('/indir/android', (req, res) => {
    const apk = fileURLToPath(new URL('./downloads/ArizaTakip-1.0.0.apk', import.meta.url));
    if (!fs.existsSync(apk))
      return res.status(503).json({ success: false, message: 'Android paketi henüz hazır değil.' });
    res.download(apk, 'ArizaTakip-1.0.0.apk');
  });
  const dist = fileURLToPath(new URL('../frontend/dist/', import.meta.url));
  if (fs.existsSync(path.join(dist, 'index.html'))) {
    app.use(express.static(dist));
    app.get('/{*path}', (req, res, next) =>
      path.extname(req.path) ? next() : res.sendFile(path.join(dist, 'index.html')),
    );
  }
  app.use((req, res) => res.status(404).json({ success: false, message: 'Sayfa bulunamadı.' }));
  app.use(errorHandler);
  return app;
}
