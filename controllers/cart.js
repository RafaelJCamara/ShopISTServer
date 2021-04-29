const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Store = require("../models/store");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProduct = require("../models/shoppinglistproduct");
const StoreProduct = require("../models/storeproduct");
const sequelize = require("../database/connection");
const PantryListProduct = require("../models/pantrylistproduct");
const PantryToShopping = require("../models/pantrytoshopping");

module.exports.getCart = async(req, res) => {

    const { shoppingId } = req.params;

    const cart = await Cart.findOne({
        where: {
            shoppingId: shoppingId
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
        if(p) {
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

    res.status(200).send(JSON.stringify(cartInfo));

};

module.exports.checkoutCart = async(req, res) => {

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

    shoppingListModel.dataValues.Products.forEach(el => {
        PantryListProduct.update({
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