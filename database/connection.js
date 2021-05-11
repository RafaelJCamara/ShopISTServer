const Sequelize = require("sequelize");

const sequelize = new Sequelize("shopist", "root", "", {
    host: "localhost",
    dialect: "mysql",
    operatorAliases: false
});

module.exports = sequelize;
global.sequelize = sequelize;