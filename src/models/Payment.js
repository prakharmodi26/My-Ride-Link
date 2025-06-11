'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      // Define associations
      Payment.belongsTo(models.Ride, {
        foreignKey: 'ride_id',
        as: 'ride'
      });
      Payment.belongsTo(models.User, {
        foreignKey: 'rider_id',
        as: 'rider'
      });
      Payment.belongsTo(models.User, {
        foreignKey: 'driver_id',
        as: 'driver'
      });
    }
  }

  Payment.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rideId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'ride_id',
      references: {
        model: 'Rides',
        key: 'id'
      }
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
      allowNull: false,
      field: 'driver_id',
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD'
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'payment_method'
    },
    paymentProvider: {
      type: DataTypes.ENUM('stripe', 'cash', 'wallet'),
      allowNull: false,
      field: 'payment_provider'
    },
    transactionId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'transaction_id'
    },
    receiptUrl: {
      type: DataTypes.STRING,
      field: 'receipt_url'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    },
    refundAmount: {
      type: DataTypes.DECIMAL(10, 2),
      field: 'refund_amount'
    },
    refundReason: {
      type: DataTypes.STRING,
      field: 'refund_reason'
    },
    refundedAt: {
      type: DataTypes.DATE,
      field: 'refunded_at'
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
    modelName: 'Payment',
    tableName: 'payments',
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['ride_id']
      },
      {
        fields: ['rider_id']
      },
      {
        fields: ['driver_id']
      },
      {
        fields: ['status']
      }
    ]
  });

  return Payment;
}; 