'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("carts", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      total: {
        type: Sequelize.DOUBLE(6, 2),
        defaultValue: 0,
        allowNull: false
      },
      checkoutQueueTime: {
        type: Sequelize.DOUBLE(4, 2),
        allowNull: false
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("carts");
  }
};