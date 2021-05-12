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
    total_rating: {
        type: Sequelize.INTEGER(255),
        default: 0,
        allowNull: false,
    },
    nr_ratings: {
        type: Sequelize.INTEGER(100),
        default: 0,
        allowNull: false,
    },
    counter: {
        type: Sequelize.INTEGER(11),
        defaultValue: 0
    }
});