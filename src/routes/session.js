import { Router } from 'express';
import * as sessionController from '../controllers/session.js';

const router = Router();

// Endpoints da Whitelist pública exigidos
router.post('/', sessionController.login);
router.post('/logout', sessionController.logout);
router.post('/refresh', sessionController.refresh);

// Endpoint privado (GET /session exige autenticação)
router.get('/', (req, res) => {
  return res.json(req.context.me);
});

export default router;
