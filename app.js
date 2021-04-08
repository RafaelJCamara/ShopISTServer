const express = require("express");
const app = express();
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const listRouter = require("./routes/lists");
const storeRouter = require("./routes/stores");
const mysql = require("mysql");
const sequelize = require("./database/connection");
const { DataTypes } = require("sequelize");
const UserModel = require("./models/user");
const PantryListModel = require("./models/pantrylist");
const ShoppingListModel = require("./models/shoppinglist");
const CartModel = require("./models/cart");
const StoreModel = require("./models/store");
const ProductModel = require("./models/product");


//Relationship associations


//Relationship associations
/**
 * M-M relationship between User and PantryList
 */
UserModel.belongsToMany(PantryListModel, { through: 'UserPantryList' });
PantryListModel.belongsToMany(UserModel, { through: 'UserPantryList' });

/**
 * M-M relationship between User and ShoppingList
 */
UserModel.belongsToMany(ShoppingListModel, { through: 'UserShoppingList' });
ShoppingListModel.belongsToMany(UserModel, { through: 'UserShoppingList' });

/**
 * M-M relationship between PantryList and ShoppingList
 */
UserModel.belongsToMany(PantryListModel, { through: 'PantryToShopping' });
PantryListModel.belongsToMany(UserModel, { through: 'PantryToShopping' });

/**
 * M-M relationship between PantryList and Products
 */

const PantryListProducts = sequelize.define('PantryListProduct', {
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, { timestamps: false });

PantryListModel.belongsToMany(ProductModel, { through: PantryListProducts });
ProductModel.belongsToMany(PantryListModel, { through: PantryListProducts });

/**
 * M-M relationship between ShoppingList and Products
 */

const ShoppingListProducts = sequelize.define('ShoppingListProduct', {
    needed: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, { timestamps: false });

ShoppingListModel.belongsToMany(ProductModel, { through: ShoppingListProducts });
ProductModel.belongsToMany(ShoppingListModel, { through: ShoppingListProducts });

/**
 * M-M relationship between Store and Products
 */

const StoreProducts = sequelize.define('StoreProduct', {
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE(6, 2),
        allowNull: false
    },
}, { timestamps: false });
StoreModel.belongsToMany(ProductModel, { through: StoreProducts });
ProductModel.belongsToMany(StoreModel, { through: StoreProducts });


/**
 * 1-M relationship between ShoppingList and Cart
 */
ShoppingListModel.hasMany(CartModel, {
    foreignKey: "shoppingId",
    as: "carts"
});

CartModel.belongsTo(ShoppingListModel, {
    foreignKey: "shoppingId",
    as: "shoppingList"
});


/**
 * 1-M relationship between Store and Cart
 */
StoreModel.hasMany(CartModel, {
    foreignKey: "storeId",
    as: "carts"
});
CartModel.belongsTo(StoreModel, {
    foreignKey: "storeId",
    as: "store"
});


//update every model on the database
sequelize.sync({
    logging: false
});


//using json
app.use(express.json());


//ROUTES

//user routes
app.use("/user", userRouter);

//product routes
app.use("/product", productRouter);

//user routes
app.use("/list", listRouter);

//store routes
app.use("/store", storeRouter);


app.listen("3000", () => {
    console.log("Server started...");
});