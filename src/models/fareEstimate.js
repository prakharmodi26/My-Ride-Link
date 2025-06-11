'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FareEstimate extends Model {
    static associate(models) {
      // Define associations
      FareEstimate.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  FareEstimate.init({
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
    pickupLocation: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false,
      field: 'pickup_location'
    },
    dropoffLocation: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: false,
      field: 'dropoff_location'
    },
    estimatedDistance: {
      type: DataTypes.FLOAT, // in kilometers
      allowNull: false,
      field: 'estimated_distance'
    },
    estimatedDuration: {
      type: DataTypes.INTEGER, // in minutes
      allowNull: false,
      field: 'estimated_duration'
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
      allowNull: false,
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
    modelName: 'FareEstimate',
    tableName: 'fare_estimates',
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

  return FareEstimate;
}; 