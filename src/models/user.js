import bcrypt from 'bcrypt';

const getUserModel = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  User.findByLogin = async function (login) {
    return await User.findOne({ where: { username: login } });
  };

  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  return User;
};

export default getUserModel;
