const PantryListModel = require("../models/pantrylist");
const ShoppingListModel = require("../models/shoppinglist");
const ProductModel = require("../models/product");
const { Sequelize, Op } = require("sequelize");
const { default: ShortUniqueId } = require('short-unique-id');
const options = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(options);
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const PantryToShoppingModel = require("../models/pantrytoshopping");
const PantryListProduct = require("../models/pantrylistproduct");

const checkIfPantryListHasContributed = async (pantryListID, shoppingListID) => {
    try {
        const allPantryToShopping = await PantryToShoppingModel.findAll();

        console.log("*******************************");
        console.log("Pantry List to search: ", pantryListID);
        console.log("Shopping Lis to search: ", shoppingListID);
        console.log(allPantryToShopping);
        console.log("*******************************");

        if (allPantryToShopping.length == 0) {
            return false;
        } else {
            allPantryToShopping.forEach(el => {
                if (el.PantryListId == pantryListID && el.ShoppingListId == shoppingListID) {
                    //there is an entry that has already been added
                    return true;
                }
            });
            return false;
        }
    } catch (e) {
        //the records don't exist
        console.log("There was an error...");
        return false;
    }
};

const updateBoughtProductsAmount = (boughtProducts, productName, quantity) => {

}

//when a user clicks tries to generate shopping lists from the selected pantry lists
module.exports.generateShoppingLists = async (req, res) => {
    console.log("******************");
    console.log("Someone is updating the .");
    console.log("******************");
};




//when soneone shops and 
module.exports.checkout = async (req, res) => {
    console.log("******************");
    console.log("Someone just shopped. Will add products to pantry list");
    console.log(req.body);
    console.log("******************");
    res.status(200).send();

    //Id of the list that originated the cart
    //List of the products bought
    let { shoppingListId, boughtProducts } = req.body;

    //find and update the corresponding shopping list
    const shoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListId
        }
    });

    //ID from database
    const shopListID = shoppingList.id;

    //for each bought product from that shopping list
    //update the quantity in the M-M relationship between Shopping List and Product
    boughtProducts.forEach(async (boughtProduct) => {
        //search the product
        const foundProduct = await ProductModel.findOne({
            where: {
                name: boughtProduct.name
            }
        });
        const foundProductId = foundProduct.id;

        const oldEntry = await ShoppingListProductModel.findOne({
            where: {
                ShoppingListId: shopListID,
                ProductId: foundProductId
            }
        });

        const newQuantity = oldEntry.needed - boughtProduct.quantity;

        //if newQuantity > 0 update the object
        //if not delete it
        if (newQuantity) {
            //update
            await ShoppingListProductModel.update(
                {
                    needed: newQuantity
                },
                {
                    where: {
                        ShoppingListId: shopListID,
                        ProductId: foundProductId
                    }
                }
            );
        } else {
            //delete
            await ShoppingListProductModel.destroy({
                where: {
                    ShoppingListId: shopListID,
                    ProductId: foundProductId
                }
            });
        }
    });

    //get the pantry lists (add items from it)
    //the approach is filling the lists                  
    const pantryLists = await PantryToShoppingModel.findAll({
        where: {
            ShoppingListId: shopListID
        }
    });

    pantryLists.forEach(async (pantryList) => {
        const pantryProducts = await PantryListProduct.findAll({
            where: {
                PantryListId: pantryList.PantryListId
            }
        });

        pantryProducts.forEach(async (pantryProd) => {
            const currentProduct = await ProductModel.findOne({
                where: {
                    id: pantryProd.ProductId
                }
            });

            //go to bought products and check what as been bought of each product
            boughtProducts.forEach(async (boughtProd, index) => {
                if (boughtProd.name === currentProduct.name) {
                    //update pantry list product
                    const boughtQuantity = boughtProd.quantity;
                    const neededQuantity = pantryProd.needed;
                    const currentStock = pantryProd.stock;
                    if (Number(neededQuantity) >= Number(boughtQuantity) + Number(currentStock)) {
                        console.log("######################################");
                        console.log("Quantidades máximas não atingidas.");
                        console.log("######################################");
                        //put everything bought to this pantry list
                        await PantryListProduct.update(
                            {
                                stock: Number(currentStock) + Number(boughtQuantity)
                            },
                            {
                                where: {
                                    PantryListId: pantryList.PantryListId,
                                    ProductId: currentProduct.id,
                                }
                            }
                        );
                        //update boughtProduct list
                        boughtProducts[index] = 0;

                    } else {
                        console.log("######################################");
                        console.log("Quantidades máximas atingidas.");
                        console.log("######################################");
                        //just add the amount necessary
                        await PantryListProduct.update(
                            {
                                stock: Number(currentStock) + (Number(neededQuantity) - Number(currentStock))
                            },
                            {
                                where: {
                                    PantryListId: pantryList.PantryListId,
                                    ProductId: currentProduct.id,
                                }
                            }
                        );
                        //update boughtProduct list
                        boughtProducts[index] = boughtQuantity - (neededQuantity - currentStock);
                    }
                }
            });
        });

    });

    res.status(200).send();
};