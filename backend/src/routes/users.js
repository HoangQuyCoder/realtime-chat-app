import { Router } from 'express';
import { getUsers, getOnlineUsersList, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);
router.get('/', getUsers);
router.get('/online', getOnlineUsersList);
router.patch('/profile', updateProfile);

export default router;
