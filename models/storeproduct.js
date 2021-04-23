const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../database/connection");

module.exports = sequelize.define('StoreProduct', {
    price: {
        type: DataTypes.DOUBLE(6, 2),
        allowNull: false
    },
}, { timestamps: false });