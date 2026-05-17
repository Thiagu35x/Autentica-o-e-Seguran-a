import { Router } from 'express';
import * as sessionController from '../controllers/session.js';
const router = Router();
router.post('/', sessionController.login);
router.post('/logout', sessionController.logout);
router.post('/refresh', sessionController.refresh);
router.get('/', (req, res) => res.json(req.context.me));
export default router;
