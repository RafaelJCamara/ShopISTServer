const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('PantryToShopping', {}, { timestamps: false });