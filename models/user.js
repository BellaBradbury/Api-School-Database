'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}
    User.init({
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      firstName: {
        type: Sequelize.STRING
      },
      lastName: {
        type: Sequelize.INTEGER
      },
      emailAddress: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.INTEGER
      }
    }, { sequelize });
  
    User.associate = (models) => {
        User.hasMany(models.Course, {
          as: 'user',
          foreignKey: {
            fieldName: 'userId',
            allowNull: false,
          },
        });
      };
  
    return User;
  };