import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rateLimit } from 'express-rate-limit';
import User, { safeUser } from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { ApiError, asyncRoute } from '../lib/errors.js';
import { username, password, choice } from '../lib/validation.js';
const router = Router();
const loginLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, skip: () => process.env.NODE_ENV === 'test', standardHeaders: 'draft-8', legacyHeaders: false, message: { success: false, message: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra yeniden deneyin.' } });
router.post('/login', loginLimit, asyncRoute(async (req, res) => {
  const name = username(req.body.username);
  if (typeof req.body.password !== 'string') throw new ApiError(400, 'Kullanıcı adı ve şifrenizi girin.');
  const user = await User.findOne({ username: name }).select('+password +tokenVersion');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) throw new ApiError(400, 'Kullanıcı adı veya şifre hatalı.');
  if (!user.isApproved) throw new ApiError(403, 'Hesabınız henüz onaylanmamış. Yöneticinizle iletişime geçin.');
  const token = jwt.sign({ id: user._id.toString(), v: user.tokenVersion }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });
  res.json({ success: true, token, user: safeUser(user) });
}));
router.get('/me', protect, (req, res) => res.json({ success: true, user: safeUser(req.user) }));
router.get('/technicians', protect, asyncRoute(async (req, res) => res.json(await User.find({ role: 'teknisyen', isApproved: true }).select('username').sort({ username: 1 }))));
router.post('/admin/users', protect, authorize('admin'), asyncRoute(async (req, res) => {
  const name = username(req.body.username), pass = password(req.body.password);
  if (!/^[\p{L}\p{N}_.-]+$/u.test(name)) throw new ApiError(400, 'Kullanıcı adında harf, rakam, nokta, tire ve alt çizgi kullanılabilir.');
  const role = choice(req.body.role || 'teknisyen', ['admin', 'teknisyen'], 'Rol');
  if (await User.exists({ username: name })) throw new ApiError(409, 'Bu kullanıcı adı zaten kullanılıyor.');
  const user = await User.create({ username: name, password: await bcrypt.hash(pass, 10), role, isApproved: true });
  res.status(201).json({ success: true, message: 'Personel başarıyla eklendi.', user: safeUser(user) });
}));
router.put('/update-password', protect, asyncRoute(async (req, res) => {
  const pass = password(req.body.newPassword);
  if (typeof req.body.currentPassword !== 'string') throw new ApiError(400, 'Mevcut şifrenizi girin.');
  const user = await User.findById(req.user.id).select('+password +tokenVersion');
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) throw new ApiError(400, 'Mevcut şifreniz hatalı.');
  if (req.body.currentPassword === pass) throw new ApiError(400, 'Yeni şifreniz mevcut şifrenizden farklı olmalıdır.');
  user.password = await bcrypt.hash(pass, 10); user.tokenVersion += 1; await user.save();
  res.json({ success: true, message: 'Şifreniz güncellendi. Yeniden giriş yapın.' });
}));
export default router;
