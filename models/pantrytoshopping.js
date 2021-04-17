const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('PantryToShopping', {
    productId: {
        type: DataTypes.INTEGER(11),
        allowNull: false
    },
}, { timestamps: false });