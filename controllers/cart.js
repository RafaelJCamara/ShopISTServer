const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Store = require("../models/store");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProduct = require("../models/shoppinglistproduct");
const StoreProduct = require("../models/storeproduct");

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
            [Op.and]: [
                {
                    productId: {
                        [Op.in]: foundList.Products.map((el) => el.id)
                    }
                },
                {
                    storeId: foundList.id
                }
            ]
            
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
        cartInfo.total += prices.find((e) => e.ProductId == el.id).price * el.ShoppingListProduct.inCart;
    });

    res.status(200).send(JSON.stringify(cartInfo));

};