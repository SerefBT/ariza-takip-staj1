export class ApiError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);
  let status = err.status || 500, message = err.message;
  if (err.code === 11000) { status = 409; message = 'Bu kullanıcı adı zaten kullanılıyor.'; }
  if (err.name === 'ValidationError' || err.name === 'CastError') { status = 400; message = 'Gönderilen bilgileri kontrol edin.'; }
  if (err.type === 'entity.parse.failed') { status = 400; message = 'İstek biçimi geçersiz.'; }
  if (status >= 500) { console.error('İşlem hatası:', err.name); message = 'İşlem tamamlanamadı. Lütfen tekrar deneyin.'; }
  res.status(status).json({ success: false, message });
}
