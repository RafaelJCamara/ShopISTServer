const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('ShoppingAccessGrant', {
    id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: Sequelize.STRING(50),
        allowNull: false,
    },
}, { timestamps: false });