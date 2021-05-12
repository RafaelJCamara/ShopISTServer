const { Sequelize } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define("WaitTime", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    uuid: {
        type: Sequelize.STRING(7),
        allowNull: false,
        unique: true,
    },
    timeArriving: Sequelize.DATE,
    timeLeaving: Sequelize.DATE,
    numberCartItems: Sequelize.INTEGER(5),
    numberCartItemsInLine: Sequelize.INTEGER(5),
});