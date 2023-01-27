'use strict';
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}
  Course.init({
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.TEXT
    },
    estimatedTime: {
        type: Sequelize.STRING
    },
    materialsNeeded: {
    type: Sequelize.STRING
    }
  }, { sequelize });

  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: 'student',
      foreignKey: {
        fieldName: 'userId',
        allowNull: false,
      },
    });
  };

  return Course;
};