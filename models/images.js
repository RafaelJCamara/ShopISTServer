const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");


module.exports = sequelize.define("Image", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    url: {
        type: Sequelize.STRING(250),
        allowNull: false
    },

});