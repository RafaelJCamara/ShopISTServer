const Store = require("../models/store");
const StoreProductModel = require("../models/storeproduct");
const ShoppingListModel = require("../models/shoppinglist");

//creates a new store
module.exports.createStore = async (req, res) => {
};

//updates a product price at store
module.exports.updateProductAtStore = async (req, res) => {
    console.log("******************");
    console.log("Request for updating a product at a store.");
    console.log(req.body);
    console.log("******************");

    const { productQuantity, productPrice, shoppingListId, productId } = req.body;

    console.log("quantity:" + productQuantity + "\nprice:"+ productPrice + "\nshoppingListId:" + shoppingListId + "\nproductID:" + productId);

    //get shopping list we were 
    const foundShoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListId.trim()
        }
    });

    await StoreProductModel.create({
        price: Number(productPrice),
        StoreId: Number(foundShoppingList.StoreId),
        ProductId: Number(productId)
    });


    res.status(200).send();
}