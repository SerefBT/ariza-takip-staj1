import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { username, password } from './validation.js';
export async function bootstrapAdmin() {
  await User.init();
  if (await User.exists({ role: 'admin' })) return;
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD)
    throw new Error('İlk yönetici hesabı için ADMIN_USERNAME ve ADMIN_PASSWORD gerekli.');
  await User.create({
    username: username(process.env.ADMIN_USERNAME),
    password: await bcrypt.hash(password(process.env.ADMIN_PASSWORD), 10),
    role: 'admin',
    isApproved: true,
  });
  console.log('İlk yönetici hesabı oluşturuldu.');
}
