const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Store = require("../models/store");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProduct = require("../models/shoppinglistproduct");
const StoreProduct = require("../models/storeproduct");
const sequelize = require("../database/connection");
const PantryToShopping = require("../models/pantrytoshopping");
const SuggestionModel = require("../models/suggestion");
const ProductModel = require("../models/product");
const PantryListModel = require("../models/pantrylist");
const PantryListProductModel = require("../models/pantrylistproduct");

module.exports.getCart = async (req, res) => {
    const { shoppingId } = req.params;

    console.log("******************");
    console.log("Request for getting a cart.");
    console.log(shoppingId.trim());
    console.log("******************");

    const cart = await Cart.findOne({
        where: {
            shoppingId: shoppingId.trim()
        },
    });

    const foundList = await ShoppingListModel.findOne({
        where: {
            id: shoppingId
        },
        include: [
            {
                model: Product,
                through:
                {
                    model: ShoppingListProduct,
                    where: {
                        inCart: {
                            [Op.gt]: 0
                        }
                    }
                }
            }
        ]
    });

    const prices = await StoreProduct.findAll({
        where: {
            productId: {
                [Op.in]: foundList.Products.map((el) => el.id)
            }
        }
    });

    var cartInfo = {
        name: cart.name,
        checkoutQueueTime: cart.checkoutQueueTime,
        total: cart.total,
        products: []
    };

    foundList.dataValues.Products.forEach(el => {
        let p = prices.find((e) => e.ProductId == el.id);
        if (p) {
            cartInfo.products.push({
                productId: el.id,
                name: el.name,
                description: el.description,
                price: p.price,
                quantity: el.ShoppingListProduct.inCart
            });
            cartInfo.total += p.price * el.ShoppingListProduct.inCart;
        }
    });

    console.log(cartInfo);

    res.status(200).send(JSON.stringify(cartInfo));

};

module.exports.checkoutCart = async (req, res) => {
    console.log("******************");
    console.log("Request for checking out.");
    console.log(req.body);
    console.log("******************");


    const { shoppingId } = req.params;

    for (let i = 0; i != req.body.length; i++) {
        const pantryListUuid = req.body[i].pantryList;
        const foundPantry = await PantryListModel.findOne({
            where: {
                uuid: pantryListUuid
            }
        });
        const boughtObjects = req.body[i].bought;
        //add to number of times a product as been bought (for suggestion purporses)
        for (let j = 0; j != boughtObjects.length; j++) {

            const foundProduct = await ProductModel.findOne({
                where: {
                    name: boughtObjects[j].productName
                }
            });

            //update products at pantry list
            const foundPantryProduct = await PantryListProductModel.findOne({
                where: {
                    PantryListId: foundPantry.id,
                    ProductId: foundProduct.id
                }
            });

            const currentStock = foundPantryProduct.stock;
            const currentNeeded = foundPantryProduct.needed;

            foundPantryProduct.stock = currentStock + Number(boughtObjects[j].quantity);
            foundPantryProduct.needed = currentNeeded - Number(boughtObjects[j].quantity);

            await foundPantryProduct.save();

            //remove products from shopping list
            const foundShopping = await ShoppingListModel.findOne({
                where: {
                    uuid: shoppingId
                }
            });

            const foundShoppingProduct = await ShoppingListProduct.findOne({
                where: {
                    ShoppingListId: foundShopping.id,
                    ProductId: foundProduct.id
                }
            });

            if (foundShoppingProduct != null) {
                const currentNeededShop = foundShoppingProduct.needed;
                foundShoppingProduct.needed = currentNeededShop - Number(boughtObjects[j].quantity);
                foundShoppingProduct.inCart = 0;
                await foundShoppingProduct.save();
            }



            //suggestion purposes (below)
            const previousCounter = foundProduct.counter;
            foundProduct.counter = Number(previousCounter) + 1;
            await foundProduct.save();

            //add all pairs together (for suggestion purposes)
            for (let x = j + 1; x < boughtObjects.length; x++) {
                const secondFoundProduct = await ProductModel.findOne({
                    where: {
                        name: boughtObjects[x].productName
                    }
                });


                const firstSearch = await SuggestionModel.findOne({
                    where: {
                        productone: foundProduct.id,
                        producttwo: secondFoundProduct.id,
                    }
                });

                const secondSearch = await SuggestionModel.findOne({
                    where: {
                        productone: secondFoundProduct.id,
                        producttwo: foundProduct.id,
                    }
                });

                if (firstSearch != null || secondSearch != null) {
                    //already a pair
                    if (firstSearch != null) {
                        //pair in the first order
                        //update pair amount
                        const currentAmount = firstSearch.dataValues.amount;
                        firstSearch.amount = Number(currentAmount) + 1;
                        await firstSearch.save();
                    } else {
                        //pair in the second order
                        //update pair amount
                        const currentAmount = secondSearch.dataValues.amount;
                        secondSearch.amount = Number(currentAmount) + 1;
                        await secondSearch.save();
                    }

                } else {
                    //there is no such pair
                    await SuggestionModel.create({
                        productone: foundProduct.id,
                        producttwo: secondFoundProduct.id,
                        amount: 1
                    });
                }
            }

        }
    }

    //remove products from shopping list

    res.status(200).send();

};