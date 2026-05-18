import Sequelize from 'sequelize';
import getUserModel from './user.js';
import getMessageModel from './message.js';
import getRefreshTokenModel from './refreshToken.js';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

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

export { sequelize };
export default models;
