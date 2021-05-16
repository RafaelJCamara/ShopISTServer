const Product = require("../models/product");
const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const StoreProductModel = require("../models/storeproduct");
const ShoppingListModel = require("../models/shoppinglist");
const ProductModel = require("../models/product");
const ProductSuggestionsModel = require("../models/suggestion");

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

module.exports.getProductUrl = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to get a product url.");
    console.log(req.body);
    console.log("**********************************");
    const { productName } = req.params;

    const foundProduct = await ProductModel.findOne({
        where: {
            name: productName.trim()
        }
    });


    const foundProductImage = await ImageModel.findOne({
        where: {
            productId: foundProduct.id
        }
    });

    const sendInfo = {
        imageURL: foundProductImage.url
    }

    res.status(200).send(JSON.stringify(sendInfo));
};

module.exports.deleteProduct = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to delete a product.");
    console.log("This was the product ID", listId);
    console.log("************");
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
                name: element.name,
                description: element.description,
                barcode: element.barcode,
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

module.exports.rateProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to rate a product.");
    console.log("**********************************");
    console.log(req.body);
    console.log(req.params);
    console.log("**********************************");

    const { productId } = req.params;
    const { productRating } = req.body;

    //try{
    const foundProduct = await Product.findOne({
        where: {
            id: productId.trim(),
            //barcode: productBarcode
        }
    });

    await Product.update(
        {
            total_rating: Number(foundProduct.total_rating) + Number(productRating.trim()),
            nr_ratings: Number(foundProduct.nr_ratings) + 1,
        },
        {
            where: {
                id: foundProduct.id,
            }
        }
    );

};
//get product suggestions
module.exports.getProductSugggestions = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to check a product's suggestions.");
    console.log(req.body);
    console.log("**********************************");
    const { productName } = req.params;

    const foundProduct = await ProductModel.findOne({
        where: {
            name: productName
        }
    });

    const foundFirstProduct = await ProductSuggestionsModel.findAll({
        where: {
            productone: foundProduct.id
        }
    });

    const foundSecondProduct = await ProductSuggestionsModel.findAll({
        where: {
            producttwo: foundProduct.id
        }
    });


    let allSuggested = [];

    if (foundFirstProduct.length > 0) {
        for (let i = 0; i != foundFirstProduct.length; i++) {
            const amountInPairs = foundFirstProduct[i].dataValues.amount;
            const productOneId = foundFirstProduct[i].dataValues.productone;
            const foundPOne = await ProductModel.findOne({
                where: {
                    id: productOneId
                }
            });
            const amountPOneBought = foundPOne.counter;
            const productTwoId = foundFirstProduct[i].dataValues.producttwo;
            const foundPTwo = await ProductModel.findOne({
                where: {
                    id: productTwoId
                }
            });
            const amountPTwoBought = foundPTwo.counter;

            const maxAmount = Math.max(Number(amountPOneBought), Number(amountPTwoBought));
            if ((amountInPairs / maxAmount) > 0.5) {
                allSuggested.push({
                    pname: foundPTwo.name,
                    delta: (amountInPairs / maxAmount)
                });
            }
        }
    }

    if (foundSecondProduct.length > 0) {
        for (let i = 0; i != foundSecondProduct.length; i++) {
            const amountInPairs = foundSecondProduct[i].dataValues.amount;
            const productOneId = foundSecondProduct[i].dataValues.productone;
            const foundPOne = await ProductModel.findOne({
                where: {
                    id: productOneId
                }
            });
            const amountPOneBought = foundPOne.counter;
            const productTwoId = foundSecondProduct[i].dataValues.producttwo;
            const foundPTwo = await ProductModel.findOne({
                where: {
                    id: productTwoId
                }
            });
            const amountPTwoBought = foundPTwo.counter;

            const maxAmount = Math.max(Number(amountPOneBought), Number(amountPTwoBought));
            if ((amountInPairs / maxAmount) > 0.5) {
                allSuggested.push({
                    pname: foundPOne.name,
                    delta: (amountInPairs / maxAmount)
                });
            }
        }
    }

    let maxValue = -1;
    let maxName = "";

    for (let i = 0; i != allSuggested.length; i++) {
        if (allSuggested[i].delta > maxValue) {
            maxName = allSuggested[i].pname;
        }
    }

    const sendInfo = {
        name: maxName
    }

    res.status(200).send(JSON.stringify(sendInfo));
}
