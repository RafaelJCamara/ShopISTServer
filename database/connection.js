const Sequelize = require("sequelize");

const sequelize = new Sequelize("es3fnwb2_shopist", "es3fnwb2_shopist", "5h0p_15T", {
    host: "adetectivestory.com",
    dialect: "mysql",
    operatorAliases: false
});

module.exports = sequelize;
global.sequelize = sequelize;