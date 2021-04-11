const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('PantryListProduct', {
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    needed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, { timestamps: false });