const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('ProductRating', {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    rating: {
        type: DataTypes.DOUBLE(6 , 2),
        allowNull: false
    },
}, { timestamps: false });