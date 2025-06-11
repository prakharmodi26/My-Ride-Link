'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vehicle extends Model {
    static associate(models) {
      // Define associations
      Vehicle.belongsTo(models.User, {
        foreignKey: 'driver_id',
        as: 'driver'
      });
      Vehicle.hasMany(models.Ride, {
        foreignKey: 'vehicle_id',
        as: 'rides'
      });
    }
  }

  Vehicle.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'driver_id',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    make: {
      type: DataTypes.STRING,
      allowNull: false
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false
    },
    licensePlate: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'license_plate'
    },
    vehicleType: {
      type: DataTypes.ENUM('sedan', 'suv', 'luxury', 'van'),
      allowNull: false,
      field: 'vehicle_type'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      defaultValue: 'active'
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
    modelName: 'Vehicle',
    tableName: 'vehicles',
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['driver_id']
      },
      {
        fields: ['license_plate'],
        unique: true
      }
    ]
  });

  return Vehicle;
}; 