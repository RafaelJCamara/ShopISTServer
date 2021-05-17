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


module.exports.createCart = async (req, res) => {
    console.log("******************");
    console.log("Request for creating a cart.");
    console.log(req.body);
    console.log("******************");

    const { shopId } = req.body;

    const { userId } = req.params;

    const foundShoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shopId.trim()
        }
    });

    //check if the cart already exists
    const foundCart = await Cart.findOne({
        where: {
            shoppingId: foundShoppingList.id
        }
    });

    const foundAllShoppingListProducts = await ShoppingListProduct.findAll({
        where: {
            ShoppingListId: foundShoppingList.id
        }
    });

    let totalInCart = 0;
        let qtyInCart = 0;

    for (let i = 0; i != foundAllShoppingListProducts.length; i++) {
        const foundStoreProduct = await StoreProduct.findOne({
            where: {
                ProductId: foundAllShoppingListProducts[i].ProductId,
                StoreId: foundShoppingList.id,
            }
        });
            qtyInCart += Number(foundAllShoppingListProducts[i].inCart);
        totalInCart += (Number(foundStoreProduct.price) * Number(foundAllShoppingListProducts[i].inCart));
    }

    if (foundCart == null) {
        //cart does not exists
        //create
        await Cart.create({
            name: `${foundShoppingList.name} cart`,
            total: totalInCart,
            quantity: qtyInCart,
            shoppingId: foundShoppingList.id,
            storeId: foundShoppingList.id,
            userId
        });
    } else {
        await Cart.update({
            total: totalInCart
        },
            {
                where: {
                    id: foundCart.id
                }
            }

        );
    }

    res.status(200).send();
}

module.exports.getCart = async (req, res) => {
    const { shoppingId, userId } = req.params;

    console.log("******************");
    console.log("Request for getting a cart.");
    console.log(shoppingId.trim());
    console.log("******************");

    const foundList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingId.trim()
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

    const cart = await Cart.findOne({
        where: {
            shoppingId: foundList.id,
            userId
        },
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
        quantity: cart.quantity,
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
            cartInfo.quantity += el.ShoppingListProduct.inCart;
            cartInfo.total += p.price * el.ShoppingListProduct.inCart;
        }
    });

    // console.log(cartInfo);

    res.status(200).send(JSON.stringify(cartInfo));

};

module.exports.checkoutCart = async (req, res) => {
    console.log("******************");
    console.log("Request for checking out.");
    console.log(req.body);
    console.log(req.body.checkout.cartContents);
    for (let a = 0; a != req.body.checkout.cartContents.length; a++) {
        console.log(req.body.checkout.cartContents[a].contentsBought);
    }
    console.log("******************");

    const { shoppingId, userId } = req.params;

    for (let i = 0; i != req.body.checkout.cartContents.length; i++) {
        const pantryListUuid = req.body.checkout.cartContents[i].pantryUuid;
        const foundPantry = await PantryListModel.findOne({
            where: {
                uuid: pantryListUuid.trim()
            }
        });
        const boughtObjects = req.body.checkout.cartContents[i].contentsBought;
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

            if (foundPantryProduct != null) {
                const currentStock = foundPantryProduct.stock;
                const currentNeeded = foundPantryProduct.needed;

                foundPantryProduct.stock = currentStock + Number(boughtObjects[j].amountBought);
                foundPantryProduct.needed = currentNeeded - Number(boughtObjects[j].amountBought);

                await foundPantryProduct.save();

                //remove products from shopping list
                const foundShopping = await ShoppingListModel.findOne({
                    where: {
                        uuid: shoppingId.trim()
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
                    foundShoppingProduct.needed = currentNeededShop - Number(boughtObjects[j].amountBought);
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

                //delete cart after shopping
                await Cart.destroy({
                    where: {
                        shoppingId: foundShopping.id,
                        userId
                    }
                });

                //remove fully bought products from shopping list
                await ShoppingListProduct.destroy({
                    where: {
                        ShoppingListId: foundShopping.id,
                        inCart: {
                            [Op.eq]: 0,
                        }
                    }
                });
            }

        }
    }

    //remove products from shopping list

    res.status(200).send();

};

// module.exports.checkoutCart = async (req, res) => {
//     console.log("******************");
//     console.log("Request for checking out.");
//     console.log(req.body);
//     console.log("******************");


//     const { shoppingId } = req.params;

//     console.log("Shopping List UUID: " + shoppingId);


//     //remove products from shopping list
//     const foundShopping = await ShoppingListModel.findOne({
//         where: {
//             uuid: shoppingId.trim()
//         }
//     });

//     console.log("Found shoppingList? " + foundShopping != null && foundShopping != undefined);

//     const foundShoppingProducts = await ShoppingListProduct.findAll({
//         where: {
//             ShoppingListId: foundShopping.id,
//             //ProductId: foundProduct.id
//         }
//     });

//     if (foundShoppingProducts != null) {
//         console.log(foundShoppingProducts);
//         for(var i = 0; i < foundShoppingProducts.length; ++i) {
//             const currentNeededShop = foundShoppingProducts[i].needed;
//             foundShoppingProducts[i].needed = currentNeededShop - Number(foundShoppingProducts[i].quantity);
//             foundShoppingProducts[i].inCart = 0;
//             await foundShoppingProducts[i].save();
//         }
//     }


//     res.status(200).send();

// };

module.exports.addProductToCart = async (req, res) => {

    console.log("************");
    console.log("Someone added itens to cart.");
    console.log(req.body);
    console.log("************");

    const { productId, quantity } = req.body;
    const { shoppingId } = req.params;

    try {

        //search product in the database
        const foundProduct = await Product.findOne({
            where: {
                id: productId.trim()
            }
        });

        const listFound = await ShoppingListModel.findOne({
            where: {
                uuid: shoppingId.trim()
            },

            include: [
                {
                    model: Product,
                    through: ShoppingListProduct
                }
            ]
        });



        const shopProductFound = await ShoppingListProduct.findOne({
            where: {
                ShoppingListId: listFound.id,
                ProductId: foundProduct.id,
            },
        });

        console.log("\n################################\nthis is my shop list product:" + shopProductFound.ProductId + " " + shopProductFound.ShoppingListId + " " + shopProductFound.inCart + " " + shopProductFound.needed);
        console.log("\n################################\nthis is my shop list:" + listFound.id);

        await ShoppingListProduct.update(
            {
                inCart: Number(shopProductFound.inCart) + Number(quantity.trim()),
                needed: Number(shopProductFound.needed) - Number(quantity.trim())
            },
            {
                where: {
                    ProductId: shopProductFound.ProductId,
                }
            }
        );
    } catch (error) {
        console.log("There was an error.");
        console.log("Error: ", error);
    }
    res.status(200).send();

}