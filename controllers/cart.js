const Product = require("../models/product");
const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const CartModel = require("../models/cart");
const ProductModel = require("../models/product");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProduct = require("../models/shoppinglistproduct");

module.exports.getCart = async(req, res) => {

    const { shoppingId } = req.params;

    const cart = await CartModel.findOne({
        where: {
            shoppingId: shoppingId
        },
    });

    const foundList = await ShoppingListModel.findOne({
        where: {
            id: shoppingId
        },
        include: {
            model: ProductModel,
            through: {
                model: ShoppingListProduct,    
                where: {
                    inCart: {
                        [Op.gt]: 0
                    } 
                }
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
        cartInfo.products.push({
            productId: el.id,
            name: el.name,
            description: el.description,
            inCart: el.ShoppingListProduct.inCart
        });
    });

    res.status(200).send(JSON.stringify(cartInfo));

};