const getRefreshTokenModel = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('refreshToken', {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  return RefreshToken;
};

export default getRefreshTokenModel;
