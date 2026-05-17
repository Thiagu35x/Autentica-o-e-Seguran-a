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

// Sincroniza e cria os dados iniciais obrigatórios usando o escopo global
sequelize.sync({ force: true }).then(async () => {
  try {
    await models.User.create({ username: 'rwieruch', password: '123' }).catch(()=>{});
    await models.User.create({ username: 'ddavids', password: '456' }).catch(()=>{});
    console.log('Banco sincronizado e usuários criados!');
  } catch (e) {
    console.log('Erro ao popular dados iniciais.');
  }

  app.listen(process.env.PORT || 3000, () =>
    console.log(`Servidor ativo na porta ${process.env.PORT || 3000}`),
  );
}).catch(err => console.log('Erro de banco:', err));

export default app;
