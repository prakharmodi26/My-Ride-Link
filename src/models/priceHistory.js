'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PriceHistory extends Model {
    static associate(models) {
      // Define associations
      PriceHistory.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  PriceHistory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    origin: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    destination: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    baseFare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'base_fare'
    },
    surgeMultiplier: {
      type: DataTypes.FLOAT,
      defaultValue: 1.0,
      field: 'surge_multiplier'
    },
    finalFare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'final_fare'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at'
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at'
    }
  }, {
    sequelize,
    modelName: 'PriceHistory',
    tableName: 'price_history',
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return PriceHistory;
}; 