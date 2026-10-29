import mongoose from 'mongoose';
import { ApiError } from './errors.js';
export function text(value, label, max = 200, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max)
    throw new ApiError(400, `${label} ${min}–${max} karakter olmalıdır.`);
  return value.trim();
}
export const username = (v) =>
  text(v, 'Kullanıcı adı', 40, 3).normalize('NFKC').toLocaleLowerCase('tr-TR');
export function password(v) {
  if (typeof v !== 'string' || v.length < 6 || Buffer.byteLength(v, 'utf8') > 72)
    throw new ApiError(400, 'Şifre en az 6 karakter, en fazla 72 bayt olmalıdır.');
  return v;
}
export function choice(v, choices, label) {
  if (!choices.includes(v)) throw new ApiError(400, `${label} geçersiz.`);
  return v;
}
export function id(v) {
  if (typeof v !== 'string' || !mongoose.isObjectIdOrHexString(v))
    throw new ApiError(400, 'Kayıt numarası geçersiz.');
  return v;
}
export const priorities = ['dusuk', 'orta', 'yuksek', 'kritik'];
export const statuses = ['beklemede', 'devam-ediyor', 'tamamlandi'];
