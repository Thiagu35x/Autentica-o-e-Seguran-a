import jwt from 'jsonwebtoken';

// 1. Middleware de Autenticação (Porteiro)
export const authMiddleware = async (req, res, next) => {
  if (!req.context) req.context = {};

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(); // Sem token, passa (o protectRoutes decide se bloqueia)
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Token malformatado.' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await req.context.models.User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado.' });
    }

    req.context.me = user;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};

// 2. Middleware de Proteção Global de Rotas
export const protectRoutes = (req, res, next) => {
  const { method, path } = req;
  const user = req.context?.me;

  // Normaliza a rota tirando a barra do final, se houver
  const normalizedPath = path.replace(/\/$/, '');

  // Whitelist: Rotas POST que são públicas obrigatoriamente
  if (
    method === 'POST' &&
    (normalizedPath === '/session' || 
     normalizedPath === '/session/refresh' || 
     normalizedPath === '/users')
  ) {
    return next();
  }

  // GET /session EXIGE login
  if (method === 'GET' && normalizedPath === '/session') {
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized. Faça login primeiro.' });
    }
    return next();
  }

  // Qualquer outra rota GET é pública
  if (method === 'GET') {
    return next();
  }

  // Bloqueio de Escrita (POST, PUT, DELETE) para qualquer outra rota sem login
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized. Operação restrita a usuários logados.' });
  }

  next();
};