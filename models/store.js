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
    location: {
        type: 'Point',
        coordinates: DataTypes.ARRAY(DataTypes.DOUBLE),
        allowNull: false
    },
    address: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    storetype: {
        type: DataTypes.ENUM,
        values: ['Food', "ConsumerElectronics", "Clothes", "PersonalCleaning", "Other"],
        allowNull: false,
    },
});