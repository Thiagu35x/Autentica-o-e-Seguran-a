import { Router } from 'express';
const router = Router();

router.get('/', async (req, res) => {
  const messages = await req.context.models.Message.findAll();
  return res.json(messages);
});

router.post('/', async (req, res) => {
  const { text } = req.body;
  const message = await req.context.models.Message.create({
    text,
    userId: req.context.me.id,
  });
  return res.json(message);
});

export default router;
