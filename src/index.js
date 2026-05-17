import 'dotenv/config';
import cors from 'cors';
import express from 'express';

import models, { sequelize } from './models/index.js';
import { authMiddleware, protectRoutes } from './middlewares/auth.js';
import sessionRoutes from './routes/session.js';
import userRoutes from './routes/user.js';
import messageRoutes from './routes/message.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.context = { models };
  next();
});

app.use(authMiddleware);
app.use(protectRoutes);

app.use('/session', sessionRoutes);
app.use('/users', userRoutes);
app.use('/messages', messageRoutes);

// Função para gerar os usuários iniciais exigidos no critério 4
const createUsersWithMessages = async () => {
  const user1 = await req.context.models.User.findByLogin('rwieruch');
  if (!user1) {
    await req.context.models.User.create({
      username: 'rwieruch',
      password: '123', // Será criptografada pelo hook beforeCreate
    });
  }

  const user2 = await req.context.models.User.findByLogin('ddavids');
  if (!user2) {
    await req.context.models.User.create({
      username: 'ddavids',
      password: '456',
    });
  }
};

// Sincroniza alterando para true para forçar a criação das tabelas e do seed
sequelize.sync({ force: true }).then(async () => {
  try {
    // Cria os dados iniciais obrigatórios
    await models.User.create({ username: 'rwieruch', password: '123' }).catch(()=>{});
    await models.User.create({ username: 'ddavids', password: '456' }).catch(()=>{});
    console.log('Banco sincronizado e usuários criados!');
  } catch (e) {
    console.log('Usuários já existentes ou erro no seed.');
  }

  app.listen(process.env.PORT || 3000, () =>
    console.log(`Servidor ativo na porta ${process.env.PORT || 3000}`),
  );
}).catch(err => console.log('Erro de banco:', err));

export default app;
