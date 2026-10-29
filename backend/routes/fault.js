import { Router } from 'express';
import Fault from '../models/Fault.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { ApiError, asyncRoute } from '../lib/errors.js';
import { text, choice, id, priorities, statuses } from '../lib/validation.js';
const router = Router();
router.use(protect);
const populated = (q) => q.populate('assignedTo', 'username').populate('createdBy', 'username');
router.get(
  '/',
  asyncRoute(async (req, res) => {
    const query = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };
    res.json(await populated(Fault.find(query).sort({ createdAt: -1 })));
  }),
);
router.post(
  '/',
  asyncRoute(async (req, res) => {
    const fault = await Fault.create({
      title: text(req.body.title, 'Başlık', 160, 3),
      description: text(req.body.description, 'Açıklama', 4000, 5),
      location: text(req.body.location, 'Konum', 200, 2),
      priority: choice(req.body.priority || 'orta', priorities, 'Öncelik'),
      createdBy: req.user._id,
    });
    res.status(201).json(await populated(Fault.findById(fault._id)));
  }),
);
router.put(
  '/:id',
  asyncRoute(async (req, res) => {
    const faultId = id(req.params.id);
    const fault = await Fault.findById(faultId);
    if (!fault) throw new ApiError(404, 'Arıza kaydı bulunamadı.');
    const allowed =
      req.user.role === 'admin'
        ? ['title', 'description', 'location', 'priority', 'status', 'assignedTo']
        : ['status'];
    if (req.user.role !== 'admin' && fault.assignedTo?.toString() !== req.user.id)
      throw new ApiError(403, 'Yalnızca size atanan arızaları güncelleyebilirsiniz.');
    const keys = Object.keys(req.body);
    if (!keys.length || keys.some((k) => !allowed.includes(k)))
      throw new ApiError(403, 'Bu alanları değiştirme yetkiniz bulunmuyor.');
    if ('title' in req.body) fault.title = text(req.body.title, 'Başlık', 160, 3);
    if ('description' in req.body)
      fault.description = text(req.body.description, 'Açıklama', 4000, 5);
    if ('location' in req.body) fault.location = text(req.body.location, 'Konum', 200, 2);
    if ('priority' in req.body) fault.priority = choice(req.body.priority, priorities, 'Öncelik');
    if ('status' in req.body) fault.status = choice(req.body.status, statuses, 'Durum');
    if ('assignedTo' in req.body) {
      if (req.body.assignedTo === null || req.body.assignedTo === '') fault.assignedTo = null;
      else {
        const technician = await User.findOne({
          _id: id(req.body.assignedTo),
          role: 'teknisyen',
          isApproved: true,
        });
        if (!technician) throw new ApiError(400, 'Onaylı bir teknisyen seçin.');
        fault.assignedTo = technician._id;
      }
    }
    fault.updatedAt = new Date();
    await fault.save();
    res.json(await populated(Fault.findById(fault._id)));
  }),
);
router.delete(
  '/:id',
  authorize('admin'),
  asyncRoute(async (req, res) => {
    const fault = await Fault.findByIdAndDelete(id(req.params.id));
    if (!fault) throw new ApiError(404, 'Arıza kaydı bulunamadı.');
    res.json({ success: true, message: 'Arıza silindi.' });
  }),
);
export default router;
