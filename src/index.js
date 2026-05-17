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

sequelize.sync({ force: true }).then(() => {
  app.listen(process.env.PORT || 3000, () =>
    console.log(`Servidor ativo`),
  );
}).catch(err => console.log('Erro de banco:', err));

export default app;
