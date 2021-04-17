const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");


module.exports = sequelize.define("Store", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    location: DataTypes.GEOMETRY('POINT'),
    address: {
        type: Sequelize.STRING(250),
        allowNull: false
    },
});