const { Sequelize } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define("ShoppingList", {
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
    address: {
        type: Sequelize.STRING(250)
    },
    uuid: {
        type: Sequelize.STRING(7),
        allowNull: false,
        unique: true,
    },
});