import { Router } from 'express';
const router = Router();

router.get('/', async (req, res) => {
  const users = await req.context.models.User.findAll();
  return res.json(users);
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  const user = await req.context.models.User.create({ username, password });
  return res.json(user);
});

export default router;
