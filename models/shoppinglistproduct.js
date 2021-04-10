const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('ShoppingListProduct', {
    needed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, { timestamps: false });