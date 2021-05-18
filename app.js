const express = require("express");
const app = express();
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const listRouter = require("./routes/lists");
const storeRouter = require("./routes/stores");
const cartRouter = require("./routes/cart");
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
const StoreProducts = require("./models/storeproduct");
const ImageModel = require("./models/images");
const WaitTimeModel = require("./models/waittime");
const WaitingTimeInfoModel = require("./models/waitingtimeinfo");
const UserPantryListModel = require("./models/userpantrylist");
const UserShoppingModel = require("./models/usershopping");
const PantryListAccessGrant = require("./models/pantryaccessgrant");
const ShoppingListAccessGrant = require("./models/shoppingaccessgrant");
const SuggestionModel = require("./models/suggestion");
const ProductRatingModel = require("./models/productrating");
const fs = require('fs');
const https = require('https');

//Relationship associations
/**
 * M-M relationship between User and PantryList
 */
UserModel.belongsToMany(PantryListModel, { through: UserPantryListModel });
PantryListModel.belongsToMany(UserModel, { through: UserPantryListModel });

/**
 * 1-M relationship between User and PantryList (extra access)
 */
UserPantryListModel.hasMany(PantryListAccessGrant, {
    as: "userpantrylist"
});

PantryListAccessGrant.belongsTo(UserPantryListModel, {
    foreignKey: "id",
    as: "pantryUserId"
});


/**
 * M-M relationship between User and ShoppingList
 */
UserModel.belongsToMany(ShoppingListModel, { through: UserShoppingModel });
ShoppingListModel.belongsToMany(UserModel, { through: UserShoppingModel });


/**
 * 1-M relationship between User and ShoppingList (extra access)
 */
UserShoppingModel.hasMany(ShoppingListAccessGrant, {
    as: "usershoplist"
});

ShoppingListAccessGrant.belongsTo(UserShoppingModel, {
    foreignKey: "id",
    as: "shopUserId"
});


/**
 * M-M relationship between PantryList and ShoppingList
 */
ShoppingListModel.belongsToMany(PantryListModel, {
    through: {
        model: PantryToShopping,
        unique: false,
    }
});

PantryListModel.belongsToMany(ShoppingListModel, {
    through: {
        model: PantryToShopping,
        unique: false,
    }
});

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
 * M-M relationship between ShoppingListProduct and Cart
 */
ShoppingListProducts.hasMany(CartModel, {
    foreignKey: "shoppingId",
    as: "carts"
});

CartModel.belongsTo(ShoppingListProducts, {
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
 * 1-M relationship between Store and Shopping list
 */
StoreModel.hasMany(ShoppingListModel, {
    foreignKey: "StoreId",
    as: "shoplists"
});
ShoppingListModel.belongsTo(StoreModel, {
    foreignKey: "StoreId",
    as: "store"
});


/**
 * 1-M relationship between Images and Products
 */
ProductModel.hasMany(ImageModel, {
    foreignKey: "productId",
    as: "images"
});
ImageModel.belongsTo(ProductModel, {
    foreignKey: "productId",
    as: "product"
});


/**
 * 1-M relationship between ratings and Products
 */
 ProductModel.hasMany(ProductRatingModel, {
    foreignKey: "productId",
    as: "productrating"
});
ProductRatingModel.belongsTo(ProductModel, {
    foreignKey: "productId",
    as: "product"
});


/**
 * 1-M relationship between Images and Products
 */
StoreModel.hasMany(WaitTimeModel, {
    foreignKey: "storeId",
    as: "previsions"
});
WaitTimeModel.belongsTo(StoreModel, {
    foreignKey: "storeId",
    as: "store"
});

/**
 * 1-M relationship between Store and WaitingTimeInfo
 */
StoreModel.hasMany(WaitingTimeInfoModel, {
    foreignKey: "storeId",
    as: "waitinginfo"
});
WaitingTimeInfoModel.belongsTo(StoreModel, {
    foreignKey: "storeId",
    as: "store"
});

/**
 * 1-M relationship between Store and WaitingTimeInfo
 */


/**
 * 
 */
SuggestionModel.belongsTo(ProductModel, { as: 'firstProduct', foreignKey: 'productone' });
SuggestionModel.belongsTo(ProductModel, { as: 'secondProduct', foreignKey: 'producttwo' });

//update every model on the database
sequelize.sync({
    logging: false,
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

//cart routes
app.use("/cart", cartRouter);

// const clientAuthMiddleware = () => (req, res, next) => {
//   if (!req.client.authorized) {
//     return res.status(401).send('Invalid client certificate authentication.');
//   }
//   return next();
// };

// app.use(clientAuthMiddleware());

// https.createServer(
// 	{
// 		requestCert: true,
//       		rejectUnauthorized: false,
// 		ca: fs.readFileSync('ssl/ca_bundle.crt'),
// 		cert: fs.readFileSync('ssl/certificate.crt'),
// 		key: fs.readFileSync('ssl/private.key')
// 	},
// 	app
// ).listen(8443);

app.listen("3000", () => {
    console.log("Server started...");
});