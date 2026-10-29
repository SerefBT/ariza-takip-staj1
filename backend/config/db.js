import mongoose from 'mongoose';
export default async function connectDB(uri = process.env.MONGO_URI) {
  if (!uri) throw new Error('MONGO_URI ayarı eksik. Önce kurulum dosyasını çalıştırın.');
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.log('MongoDB bağlantısı hazır.');
}
