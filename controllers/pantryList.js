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

const NodeGeocoder = require('node-geocoder');
const optionsGeocoder = {
    provider: 'opencage',
    apiKey: 'b86ee0f7cb4844c983b21ab717973b24',
    formatter: "gpx"
};
const geocoder = NodeGeocoder(optionsGeocoder);


//when the user presses the button to create the list
module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for pantry list creation");
    console.log(req.body);
    console.log("******************");
    const { name, address } = req.body;
    const listUuid = uid();

    const newList = await PantryListModel.create({
        name,
        uuid: listUuid,
        address
    });

    const info = {
        listId: listUuid
    };

    res.status(200).send(JSON.stringify(info));
};

//when someone enters the list code
//returns the list and all the products associated with it
module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to sync with a pantry list.");
    console.log("This was the list ID", listId.trim());
    console.log("************");

    //get list
    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
        },
        include: ProductModel
    });

    const sendList = {
        name: foundList.name,
        products: [],
    };

    foundList.Products.forEach(product => {
        sendList.products.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            stock: product.dataValues.PantryListProduct.stock,
            needed: product.dataValues.PantryListProduct.needed
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
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;
    const { productId, needed, shops } = req.body;

    const splittedShops = shops.split(",");

    splittedShops.forEach(async (shop) => {
        //find shopping list with that uuid
        if (shop) {
            const foundShoppingList = await ShoppingListModel.findOne({
                where: {
                    uuid: shop.trim()
                }
            });

            //save pair in database
            await ShoppingListProductModel.create({
                needed: Number(needed.trim()),
                ShoppingListId: Number(foundShoppingList.id),
                ProductId: Number(productId.trim())
            })
        }

    });

    res.status(200).send();
};

//when someone adds a product to the pantry list
module.exports.addProductToPantry = async (req, res) => {
    console.log("******************");
    console.log("Request for adding product to pantry list.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;
    console.log("Lista: ", listId);

    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
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