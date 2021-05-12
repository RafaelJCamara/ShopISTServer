const { Sequelize } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define("WaitTimeInfo", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    x: Sequelize.INTEGER(11),
    y: Sequelize.DOUBLE(6, 2)
});