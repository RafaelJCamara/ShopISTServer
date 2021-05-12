const { Sequelize } = require("sequelize");
const sequelize = require("../database/connection");


module.exports = sequelize.define("Suggestion", {
    id: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
    },
    productone: {
        type: Sequelize.INTEGER(11),
        allowNull: false
    },
    producttwo: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    },
    amount: {
        type: Sequelize.INTEGER(11),
        allowNull: false,
    }
});