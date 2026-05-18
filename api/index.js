import app from '../src/index.js';
import { sequelize } from '../src/models/index.js';

sequelize.sync({}).catch(err => console.log('Erro de banco:', err));

export default app;
