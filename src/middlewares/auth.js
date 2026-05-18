import jwt from 'jsonwebtoken';

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await req.context.models.User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }
    req.context.me = user;
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

export const protectRoutes = (req, res, next) => {
  const { method, path } = req;

  // Rotas públicas (whitelist)
  const publicPosts = ['/session/login', '/session/refresh', '/users'];
  if (method === 'POST' && publicPosts.some(p => path === p || path.startsWith(p + '/'))) {
    return next();
  }

  // GET /session exige login
  if (method === 'GET' && path === '/session') {
    if (!req.context.me) {
      return res.status(401).json({ error: 'Unauthorized. Login necessário.' });
    }
    return next();
  }

  // Todos os GETs são públicos
  if (method === 'GET') {
    return next();
  }

  // POST, PUT, DELETE exigem autenticação
  if (!req.context.me) {
    return res.status(401).json({ error: 'Unauthorized. Operação requer autenticação.' });
  }

  return next();
};
