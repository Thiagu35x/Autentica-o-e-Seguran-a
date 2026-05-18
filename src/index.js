const getRefreshTokenModel = (sequelize, DataTypes) => {
  const RefreshToken = sequelize.define('refreshToken', {
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  RefreshToken.associate = (models) => {
    RefreshToken.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'CASCADE' });
  };

  return RefreshToken;
};

export default getRefreshTokenModel;