import { Router } from 'express';
import { getRooms, createRoom, getMessages } from '../controllers/roomController.js';
import { protect } from '../middleware/auth.js';
import { validate, roomRules } from '../middleware/validate.js';

const router = Router();
router.use(protect);
router.get('/', getRooms);
router.post('/', roomRules, validate, createRoom);
router.get('/:roomId/messages', getMessages);

export default router;
