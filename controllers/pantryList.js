const PantryListModel = require("../models/pantrylist");
const ProductModel = require("../models/product");
const PantryListProductModel = require("../models/pantrylistproduct");
const { default: ShortUniqueId } = require('short-unique-id');
const options = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(options);
const PantryToShoppingModel = require("../models/pantrytoshopping");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProductModel = require("../models/shoppinglistproduct");

//when the user presses the button to create the list
module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for pantry list creation");
    console.log(req.body);
    console.log("******************");
    const { name } = req.body;
    const listUuid = uid();

    const newList = await PantryListModel.create({
        name,
        uuid: listUuid
    });

    const info = {
        uuid: listUuid
    };

    res.status(200).send(JSON.stringify(info));
};

//when someone enters the list code
//returns the list and all the products associated with it
module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to sync with a pantry list.");
    console.log("This was the list ID", listId);
    console.log("************");

    //get list
    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId
        },
        include: ProductModel
    });

    const sendList = {
        name: foundList.name,
        products: [],
    };

    foundList.Products.forEach(product => {
        sendList.products.push({
            name: product.name,
            description: product.description,
            stock: product.dataValues.PantryListProduct.stock
        });
    });

    res.status(200).send(JSON.stringify(sendList));
};

//when someone deletes the pantry list
module.exports.deleteList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to delete a list.");
    console.log("This was the list ID", listId);
    console.log("************");

    try {
        //get the corresponding pantry list
        const foundList = await PantryListModel.findOne({
            where: {
                uuid: listId
            }
        });

        await foundList.destroy();
    } catch (error) {

    }

};

//when a user consumes products from the pantry list
module.exports.consumeProducts = async (req, res) => {
    console.log("************");
    console.log("Someone consumed itens from the list.");
    console.log(req.body);
    console.log("************");

    const productsToConsume = req.body.products;
    const { listId } = req.params;

    productsToConsume.forEach(async (productConsumed) => {
        try {
            //search product in the database
            const foundProduct = await ProductModel.findOne({
                where: {
                    name: productConsumed.name
                }
            });

            const foundList = await PantryListModel.findOne({
                where: {
                    uuid: listId
                }
            });

            //make the update
            const currentProductState = await PantryListProductModel.findOne({
                where: {
                    PantryListId: foundList.id,
                    ProductId: foundProduct.id,
                }
            });

            await PantryListProductModel.update(
                {
                    stock: Number(currentProductState.stock) - Number(productConsumed.quantity),
                    needed: Number(currentProductState.needed) + Number(productConsumed.quantity)
                },
                {
                    where: {
                        PantryListId: foundList.id,
                        ProductId: foundProduct.id,
                    }
                }
            );

            const foundMatches = await PantryToShoppingModel.findAll({
                where: {
                    PantryListId: foundList.id,
                    productId: foundProduct.id,
                }
            });

            foundMatches.forEach(async (el) => {
                await ShoppingListProductModel.update({
                    needed: Number(currentProductState.needed) + Number(productConsumed.quantity)
                },
                    {
                        where: {
                            ShoppingListId: el.ShoppingListId,
                            ProductId: foundProduct.id,
                        }
                    });
            });

        } catch (error) {
            console.log("There was an error.");
            console.log("Error: ", error);
        }

    });

    res.status(200).send();
};


/**
 * when a user updates products related information in the pantry list
 * updates happen when:
 *      (1) Someone updates the amount of products in stock or needed
 *      (2) Someone adds a shopping list for a specific product to be bought
 */
module.exports.updatePantry = async (req, res) => {
    console.log("******************");
    console.log("Request for pantry list update.");
    console.log("******************");

    const { listId } = req.params;
    const { updates } = req.body;

    const foundPantryList = await PantryListModel.findOne({
        where: {
            uuid: listId
        }
    });

    updates.forEach(async (shopList) => {
        const { shopListId, products } = shopList;
        const foundShoppingList = await ShoppingListModel.findOne({
            where: {
                uuid: shopListId
            }
        });

        const foundMatching = await PantryToShoppingModel.findAll({
            where: {
                ShoppingListId: foundShoppingList.id,
                PantryListId: foundPantryList.id,
            }
        });

        if (!foundMatching.length) {
            //list is empty
            //insert stuff
            products.forEach(async (product) => {

                const foundProduct = await ProductModel.findOne({
                    where: {
                        name: product.name
                    }
                });

                await PantryToShoppingModel.create({
                    productId: foundProduct.id,
                    ShoppingListId: foundShoppingList.id,
                    PantryListId: foundPantryList.id,
                });

                await ShoppingListProductModel.create({
                    needed: product.needed,
                    ShoppingListId: foundShoppingList.id,
                    ProductId: foundProduct.id,
                });

            });

        } else {
            //list has stuff in there
            const foundSL = await ShoppingListProductModel.findAll({
                where: {
                    ShoppingListId: foundShoppingList.id
                }
            });

            foundSL.forEach(async (el) => {
                await ShoppingListProductModel.destroy({
                    where: {
                        ShoppingListId: el.ShoppingListId,
                        ProductId: el.ProductId,
                    }
                });
            });

            const foundPTS = await PantryToShoppingModel.findAll({
                ShoppingListId: foundShoppingList.id,
                PantryListId: foundPantryList.id,
            });

            foundPTS.forEach(async (el) => {
                await PantryToShoppingModel.destroy({
                    where: {
                        ShoppingListId: el.ShoppingListId,
                        PantryListId: el.PantryListId,
                    }
                });
            });

            products.forEach(async (product) => {

                const foundProduct = await ProductModel.findOne({
                    where: {
                        name: product.name
                    }
                });

                await PantryToShoppingModel.create({
                    productId: foundProduct.id,
                    ShoppingListId: foundShoppingList.id,
                    PantryListId: foundPantryList.id,
                });

                await ShoppingListProductModel.create({
                    needed: product.needed,
                    ShoppingListId: foundShoppingList.id,
                    ProductId: foundProduct.id,
                });

            });

        }

    });

    res.status(200).send();
};

//when someone adds a product to the pantry list
module.exports.addProductToPantry = async (req, res) => {
    console.log("******************");
    console.log("Request for adding product to pantry list.");
    console.log("******************");

    const { listId } = req.params;

    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId
        }
    });

    const { name, description, barcode, stock, needed } = req.body;

    try {
        //add the product to the database
        const newProduct = await ProductModel.create({
            name, description, barcode,
        });

        //add entry to represent that this product belongs to the specific pantry list
        await PantryListProductModel.create({
            stock: Number(stock),
            needed: Number(needed),
            PantryListId: foundList.id,
            ProductId: newProduct.id,
        });

    } catch (e) {
        console.log("Error: ", e);
    }

    res.status(200).send();
}