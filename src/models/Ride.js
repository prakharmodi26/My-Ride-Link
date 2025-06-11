'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Ride extends Model {
    static associate(models) {
      // Define associations
      Ride.belongsTo(models.User, {
        foreignKey: 'rider_id',
        as: 'rider'
      });
      Ride.belongsTo(models.User, {
        foreignKey: 'driver_id',
        as: 'driver'
      });
      Ride.belongsTo(models.Vehicle, {
        foreignKey: 'vehicle_id',
        as: 'vehicle'
      });
      Ride.hasOne(models.Payment, {
        foreignKey: 'ride_id',
        as: 'payment'
      });
    }
  }

  Ride.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    riderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'rider_id',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    driverId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'driver_id',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    vehicleId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'vehicle_id',
      references: {
        model: 'Vehicles',
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
    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'pickup_address'
    },
    dropoffAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'dropoff_address'
    },
    status: {
      type: DataTypes.ENUM('requested', 'accepted', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'requested'
    },
    fare: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    distance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'completed', 'failed'),
      defaultValue: 'pending',
      field: 'payment_status'
    },
    paymentMethod: {
      type: DataTypes.ENUM('card', 'cash', 'wallet'),
      allowNull: false,
      field: 'payment_method'
    },
    notes: {
      type: DataTypes.TEXT
    },
    cancellationReason: {
      type: DataTypes.STRING,
      field: 'cancellation_reason'
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
    modelName: 'Ride',
    tableName: 'rides',
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['rider_id']
      },
      {
        fields: ['driver_id']
      },
      {
        fields: ['vehicle_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Ride;
}; 