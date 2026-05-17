import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  // Cria os usuários direto aqui caso o banco de dados esteja limpo
  try {
    const userExists = await req.context.models.User.findOne({ where: { username: 'rwieruch' } });
    if (!userExists) {
      await req.context.models.User.create({ username: 'rwieruch', password: '123' });
      await req.context.models.User.create({ username: 'ddavids', password: '456' });
    }
  } catch (err) {
    console.log("Erro ao checar dados iniciais:", err);
  }

  const user = await req.context.models.User.findByLogin(username);

  if (!user || !(await user.validatePassword(password))) {
    return res.status(401).json({ error: 'Credenciais inválidas.' });
  }

  const accessToken = generateAccessToken(user);
  const opaqueToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.REFRESH_TOKEN_EXPIRATION_DAYS || 7));

  await req.context.models.RefreshToken.create({
    token: opaqueToken,
    userId: user.id,
    expiresAt,
  });

  return res.json({ accessToken, refreshToken: opaqueToken });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  const storedToken = await req.context.models.RefreshToken.findOne({ where: { token: refreshToken } });

  if (!storedToken || new Date() > storedToken.expiresAt) {
    if (storedToken) await storedToken.destroy();
    return res.status(401).json({ error: 'Refresh token inválido ou expirado.' });
  }

  const user = await req.context.models.User.findByPk(storedToken.userId);
  const newAccessToken = generateAccessToken(user);
  const newOpaqueToken = crypto.randomBytes(40).toString('hex');
  const originalExpiration = storedToken.expiresAt;

  await storedToken.destroy();

  await req.context.models.RefreshToken.create({
    token: newOpaqueToken,
    userId: user.id,
    expiresAt: originalExpiration,
  });

  return res.json({ accessToken: newAccessToken, refreshToken: newOpaqueToken });
};

export const logout = async (req, res) => {
  const { refreshToken } = req.body;
  await req.context.models.RefreshToken.destroy({ where: { token: refreshToken } });
  return res.status(204).send();
};
