const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('UserShopping', {
    id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
}, { timestamps: false });