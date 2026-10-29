import mongoose from 'mongoose';
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, maxlength: 40 },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'teknisyen'], default: 'teknisyen' },
    isApproved: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 0, select: false },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false },
);
export default mongoose.model('User', userSchema);
export const safeUser = (u) => ({
  id: u._id.toString(),
  _id: u._id.toString(),
  username: u.username,
  role: u.role,
  isApproved: u.isApproved,
});
