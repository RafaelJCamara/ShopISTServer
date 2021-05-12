const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Store = require("../models/store");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProduct = require("../models/shoppinglistproduct");
const StoreProductModel = require("../models/storeproduct");
const sequelize = require("../database/connection");
const PantryListProduct = require("../models/pantrylistproduct");
const PantryToShopping = require("../models/pantrytoshopping");

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
    console.log("#################################/n this is shoppingid from card:" + cart.shoppingId);

    const foundList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingId.trim()
        },
        include: Product,
        through: ShoppingListProduct
        /*include: [
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
        ]*/
    });

    foundList.dataValues.Products.forEach(el => {
        console.log(el.name);
    });


    const prices = await StoreProductModel.findAll({
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

    const { shoppingId } = req.params;

    const shoppingListModel = await ShoppingListModel.findOne({
        where: {
            id: shoppingId
        },
        include: [
            {
                model: Product,
                through: ShoppingListProduct
            }
        ]
    });

    const pantryList = await PantryToShopping.findOne({
        where: {
            shoppingListId: shoppingId
        }
    });

    shoppingListModel.dataValues.Products.forEach(async (el) => {
        await PantryListProduct.update({
            needed: sequelize.literal('GREATEST(0, needed - ' + el.ShoppingListProduct.inCart + ')'),
            stock: sequelize.literal('stock + ' + el.ShoppingListProduct.inCart)
        }, {
            where: {
                productId: el.id,
                pantryListId: pantryList.dataValues.PantryListId
            },
            individualHooks: true
        });
    });

    await ShoppingListProduct.update({ needed: sequelize.literal('GREATEST(0, needed - inCart)'), inCart: 0 }, {
        where: {
            shoppingListId: shoppingId
        },
        individualHooks: true
    });

    res.status(200).send();

};

module.exports.addProductToCart = async(req, res) => {

    console.log("************");
    console.log("Someone added itens to cart.");
    console.log(req.body);
    console.log("************");

    const { productId, quantity } = req.body;
    const { shoppingId } = req.params;

    try{

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
                ShoppingListId : listFound.id,
                ProductId: foundProduct.id,
            },    
        });

        console.log("\n################################\nthis is my shop list product:" + shopProductFound.ProductId +" "+ shopProductFound.ShoppingListId +" "+ shopProductFound.inCart + " " + shopProductFound.needed );
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