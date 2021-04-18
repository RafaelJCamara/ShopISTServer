const Product = require("../models/product");
const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const StoreProductModel = require("../models/storeproducts");
const ShoppingListModel = require("../models/shoppinglist");

//when someone wants to create a product
module.exports.createProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a create product request");
    console.log(req.body);
    console.log("**********************************");
    //get user info
    const { name, description, barcode } = req.body;
    try {
        const newProduct = await Product.create({
            name, description, barcode
        });

        //check if photo url exists
        if (req.body.photoUrl !== undefined) {
            //means it has a photo url
            //save it on the database
            await ImageModel.create({
                url: req.body.photoUrl,
                productId: newProduct.id
            });
        }

        const productInfo = {
            productId: newProduct.id
        }

        res.status(200).send(JSON.stringify(productInfo));
    } catch (e) {
        console.log("Error: ", e);
    }
};


//add a photo to a product
module.exports.addPhoto = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to add a photo.");
    console.log("**********************************");

    const { productId } = req.params;
    const { photoUrl } = req.body;

    await ImageModel.create({
        url: photoUrl,
        productId
    });

    res.status(200).send();
};

//when someone wants to check a specific product detail
//the product is closely linked with the list it is a part of
//ex a product selected in the context of a pantry list will show different info
// (continuation of last line) if selected when in the shop context
module.exports.getProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to check product detail.");
    console.log(req.body);
    console.log("**********************************");
};

module.exports.deleteProduct = async (req, res) => {

};

module.exports.updateProduct = async (req, res) => {

};

//when someone is inserting a product (suggest possible names)
module.exports.autocompleteProductName = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request the matching products.");
    console.log(req.body);
    console.log("**********************************");

    const { productPartialName } = req.params;
    const sendProducts = [];

    try {
        const foundProducts = await Product.findAll({
            where: {
                name: {
                    [Op.like]: `%${productPartialName}%`,
                }
            }
        });

        foundProducts.forEach(element => {
            sendProducts.push({
                productId: element.id,
                name: element.name
            });
        });
    } catch (error) {
        //no product was found
        console.log("There was an error!");
        console.log("Error: ", error);
    }

    res.status(200).send(JSON.stringify(sendProducts));
};

//when someone adds a price to a product (when in a specific store)
module.exports.addProductPrice = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to add a product price.");
    console.log("**********************************");

    const { productId } = req.params;
    const { shoppingListUuid, amount, price } = req.body;

    const foundShoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListUuid
        }
    });

    const foundProduct = await StoreProductModel.findOne({
        where: {
            StoreId: foundShoppingList.StoreId,
            ProductId: productId,
        }
    });

    if (!foundProduct) {
        //no price
        await StoreProductModel.create({
            stock: Number(amount),
            price: Number(price),
            StoreId: foundShoppingList.StoreId,
            ProductId: productId,
        });
    } else {

    }

    res.status(200).send();
};