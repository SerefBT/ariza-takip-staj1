import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, required: true, trim: true, maxlength: 4000 },
  location: { type: String, required: true, trim: true, maxlength: 200 },
  priority: { type: String, enum: ['dusuk', 'orta', 'yuksek', 'kritik'], default: 'orta' },
  status: { type: String, enum: ['beklemede', 'devam-ediyor', 'tamamlandi'], default: 'beklemede' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
schema.index({ status: 1, createdAt: -1 });
export default mongoose.model('Fault', schema);
