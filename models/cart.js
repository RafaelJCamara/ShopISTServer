const { Sequelize } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define("Cart", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING(30),
        allowNull: false
    },
    quantity: {
        type: Sequelize.INTEGER(5),
        defaultValue: 0,
        allowNull: false
    },
    total: {
        type: Sequelize.DOUBLE(6, 2),
        defaultValue: 0,
        allowNull: false
    },
    checkoutQueueTime: {
        type: Sequelize.DOUBLE(4, 2),
        allowNull: false
    }
});