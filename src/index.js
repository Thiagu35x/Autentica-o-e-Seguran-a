import 'dotenv/config';
import cors from 'cors';
import express from 'express';

// Importa os modelos do banco e os middlewares de segurança
import models, { sequelize } from './models/index.js';
import { authMiddleware, protectRoutes } from './middlewares/auth.js';
import sessionRoutes from './routes/session.js';

const app = express();

// Configurações Globais Básicas
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Injecta o contexto com os modelos do banco de dados
app.use((req, res, next) => {
  req.context = {
    models,
  };
  next();
});

// 1 & 3. Ciclo de Segurança Ativado Globalmente
app.use(authMiddleware);
app.use(protectRoutes);

// Vincula as rotas de sessão (Login, Logout e Refresh)
app.use('/session', sessionRoutes);

// Configuração para subir o servidor sincronizando o Banco de Dados
const eraseDatabaseOnSync = false;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    // Função auxiliar que insere os seeders iniciais
    console.log('Reiniciando banco com os dados iniciais...');
  }

  app.listen(process.env.PORT || 3000, () =>
    console.log(`Servidor rodando na porta ${process.env.PORT || 3000}!`),
  );
});

export default app;
