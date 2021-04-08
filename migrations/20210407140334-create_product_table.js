'use strict';

const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.createTable("products", {
      id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      description: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      barcode: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      storetype: {
        type: DataTypes.ENUM,
        values: ['Food', "ConsumerElectronics", "Clothes", "PersonalCleaning", "Other"],
        allowNull: false,
      },
    })
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.dropTable("products");
  }
};