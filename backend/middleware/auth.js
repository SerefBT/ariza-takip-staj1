import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError, asyncRoute } from '../lib/errors.js';
export const protect = asyncRoute(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Devam etmek için giriş yapın.');
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new ApiError(401, 'Oturumunuz sona erdi. Yeniden giriş yapın.');
  }
  if (!decoded || typeof decoded.id !== 'string') throw new ApiError(401, 'Oturum geçersiz.');
  const user = await User.findById(decoded.id).select('+tokenVersion');
  if (!user || !user.isApproved || user.tokenVersion !== decoded.v)
    throw new ApiError(401, 'Oturumunuz sona erdi. Yeniden giriş yapın.');
  req.user = user;
  next();
});
export const authorize =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user?.role)
      ? next()
      : next(new ApiError(403, 'Bu işlem için yetkiniz bulunmuyor.'));
