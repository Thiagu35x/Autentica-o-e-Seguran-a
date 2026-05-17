import Sequelize from 'sequelize';
import getUserModel from './user.js';
import getMessageModel from './message.js';
import getRefreshTokenModel from './refreshToken.js';

const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const models = {
  User: getUserModel(sequelize, Sequelize.DataTypes),
  Message: getMessageModel(sequelize, Sequelize.DataTypes),
  RefreshToken: getRefreshTokenModel(sequelize, Sequelize.DataTypes),
};

Object.keys(models).forEach((key) => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});

// Seed nativo executado logo após a sincronização das tabelas
sequelize.addHook('afterBulkSync', async () => {
  try {
    const userCount = await models.User.count();
    if (userCount === 0) {
      await models.User.create({ username: 'rwieruch', password: '123' });
      await models.User.create({ username: 'ddavids', password: '456' });
      console.log('Seed carregado com sucesso!');
    }
  } catch (error) {
    console.log('Erro ao criar dados iniciais:', error);
  }
});

export { sequelize };
export default models;
