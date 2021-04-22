const { Sequelize } = require("sequelize");
const sequelize = require("../database/connection");


module.exports = sequelize.define("PantryList", {
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
    uuid: {
        type: Sequelize.STRING(7),
        allowNull: false,
        unique: true,
    },
    address: {
        type: Sequelize.STRING(250)
    }
});