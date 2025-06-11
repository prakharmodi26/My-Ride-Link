'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      // Define associations
      UserPreference.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }

  UserPreference.init({
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
    emailNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'email_notifications'
    },
    pushNotifications: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'push_notifications'
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    theme: {
      type: DataTypes.STRING,
      defaultValue: 'light'
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
    modelName: 'UserPreference',
    tableName: 'user_preferences',
    paranoid: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id']
      }
    ]
  });

  return UserPreference;
}; 