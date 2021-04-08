const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");


module.exports = sequelize.define("Product", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING(100),
        allowNull: false
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
    producttype: {
        type: DataTypes.ENUM,
        values: ['Food', "ConsumerElectronics", "Clothes", "PersonalCleaning", "Other"],
        allowNull: false,
    },
});