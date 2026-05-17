import jwt from 'jsonwebtoken';

// 1. Middleware de Autenticação (Extrai e valida o Token do header)
export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Captura apenas o hash após 'Bearer'

  if (!token) {
    req.context.me = null;
    return next();
  }

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

// 3. Proteção Global de Rotas (Controle de Acesso por Whitelist)
export const protectRoutes = (req, res, next) => {
  const { method, path } = req;

  // Rotas explicitamente públicas (Whitelist)
  if (method === 'POST' && (path === '/session' || path === '/session/refresh' || path === '/users')) {
    return next();
  }

  // Rota GET /session é a única de leitura privada
  if (method === 'GET' && path === '/session') {
    if (!req.context.me) {
      return res.status(401).json({ error: 'Unauthorized. Login necessário.' });
    }
    return next();
  }

  // Todas as demais rotas GET de leitura permanecem públicas
  if (method === 'GET') {
    return next();
  }

  // Bloqueio de Escrita (POST, PUT, DELETE) para usuários não autenticados
  if (!req.context.me) {
    return res.status(401).json({ error: 'Unauthorized. Operação requer autenticação.' });
  }

  return next();
};