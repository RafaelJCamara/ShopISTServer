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
const ShoppingListProducts = require("./models/shoppinglistproduct");
const PantryToShopping = require("./models/pantrytoshopping");
const PantryListProducts = require("./models/pantrylistproduct");
const StoreProducts = require("./models/storeproducts");


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
ShoppingListModel.belongsToMany(PantryListModel, { through: PantryToShopping });
PantryListModel.belongsToMany(ShoppingListModel, { through: PantryToShopping });

/**
 * M-M relationship between PantryList and Products
 */

PantryListModel.belongsToMany(ProductModel, { through: PantryListProducts });
ProductModel.belongsToMany(PantryListModel, { through: PantryListProducts });

/**
 * M-M relationship between ShoppingList and Products
 */

ShoppingListModel.belongsToMany(ProductModel, { through: ShoppingListProducts });
ProductModel.belongsToMany(ShoppingListModel, { through: ShoppingListProducts });

/**
 * M-M relationship between Store and Products
 */

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

/**
 * 1-1 relationship between Shopping list and Store
 */
StoreModel.hasOne(ShoppingListModel);
ShoppingListModel.belongsTo(StoreModel);


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