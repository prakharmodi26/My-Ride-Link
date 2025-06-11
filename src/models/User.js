'use strict';

const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    async validatePassword(password) {
      return bcrypt.compare(password, this.password);
    }

    static associate(models) {
      // Define associations
      User.hasMany(models.Ride, {
        foreignKey: 'rider_id',
        as: 'ridesAsRider'
      });
      User.hasMany(models.Ride, {
        foreignKey: 'driver_id',
        as: 'ridesAsDriver'
      });
      User.hasMany(models.Vehicle, {
        foreignKey: 'driver_id',
        as: 'vehicles'
      });
      User.hasMany(models.Payment, {
        foreignKey: 'rider_id',
        as: 'paymentsAsRider'
      });
      User.hasMany(models.Payment, {
        foreignKey: 'driver_id',
        as: 'paymentsAsDriver'
      });
      User.hasMany(models.Review, {
        foreignKey: 'reviewer_id',
        as: 'reviewsGiven'
      });
      User.hasMany(models.Review, {
        foreignKey: 'reviewee_id',
        as: 'reviewsReceived'
      });
      User.hasMany(models.Notification, {
        foreignKey: 'user_id',
        as: 'notifications'
      });
      User.hasMany(models.Location, {
        foreignKey: 'user_id',
        as: 'locations'
      });
      User.hasOne(models.UserPreference, {
        foreignKey: 'user_id',
        as: 'preferences'
      });
      User.hasMany(models.PriceHistory, {
        foreignKey: 'user_id',
        as: 'priceHistory'
      });
      User.hasMany(models.FareEstimate, {
        foreignKey: 'user_id',
        as: 'fareEstimates'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    role: {
      type: DataTypes.ENUM('rider', 'driver', 'admin'),
      defaultValue: 'rider'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isPhoneVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    lastLoginAt: {
      type: DataTypes.DATE
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    accountLockedUntil: {
      type: DataTypes.DATE
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE
    },
    deviceToken: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Firebase Cloud Messaging device token for push notifications'
    }
  }, {
    sequelize,
    modelName: 'User',
    paranoid: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      }
    }
  });

  return User;
}; 