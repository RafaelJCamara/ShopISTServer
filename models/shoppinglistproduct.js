const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('ShoppingListProduct', {
    needed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    inCart: {
        type: DataTypes.INTEGER,
        allowNull: false,
        default: 0
    }
}, { timestamps: false });