const Product = require("../models/product");
const { Op } = require("sequelize");
const ImageModel = require("../models/images");
const StoreProductModel = require("../models/storeproduct");
const ShoppingListModel = require("../models/shoppinglist");
const ProductModel = require("../models/product");
const ProductSuggestionsModel = require("../models/suggestion");
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const ProductRatingModel = require("../models/productrating");
const PantryListModel = require("../models/pantrylist");
const PantryListProductModel = require("../models/pantrylistproduct");


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

module.exports.addProductRating = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to rate product.");
    console.log("**********************************");
    console.log(req.body);


    const { productId } = req.params;
    const { productRating } = req.body;



    await ProductRatingModel.create({
        rating: Number(productRating),
        productId
    });

    res.status(200).send();
};

module.exports.getRating = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to get rate product.");
    console.log("**********************************");

    const { productId } = req.params;
    let totalRating = 0;
    let nrRatings = 0;


    const foundProduct = await ProductModel.findOne({
        where: {
            id: productId
        }
    });

    const ratings = await ProductRatingModel.findAll({
        where: {
            productId : foundProduct.id
        }
    })
    
    ratings.forEach(el => {
        nrRatings += Number(el.rating);
        totalRating++;
    });

    rating = nrRatings/totalRating;
    
    console.log(rating);

    const sendInfo = {
        classification: rating
    }

    res.status(200).send(JSON.stringify(sendInfo));

};

module.exports.getRatingHist = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to get rating histogram.");
    console.log("**********************************");

    var class1= 0;
    var class2= 0;
    var class3= 0;
    var class4= 0;
    var class5= 0;

    const { productId } = req.params;


    const foundProduct = await ProductModel.findOne({
        where: {
            id: productId
        }
    });

    const ratings = await ProductRatingModel.findAll({
        where: {
            productId : foundProduct.id
        }
    })

    
    ratings.forEach(el => {

        if (Number(el.rating)>0.0 && el.rating<=1.0){class1++;}

        else if(Number(el.rating)>1.0 && el.rating<=2.0){class2++;}

        else if(Number(el.rating)>2.0 && el.rating<=3.0){class3++;}
        
        else if(Number(el.rating)>3.0 && el.rating<=4.0){class4++;}

        else if(Number(el.rating)>4.0){class5++;}
    });

    const sendInfo = {
        productName: foundProduct.name,
        c1: class1,
        c2: class2,
        c3: class3,
        c4: class4,
        c5: class5
    };
    
    res.status(200).send(JSON.stringify(sendInfo));

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
                    delta: (amountInPairs / maxAmount),
                    pdescription: foundPTwo.description,
                    pid: foundPTwo.id
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
                    delta: (amountInPairs / maxAmount),
                    pdescription: foundPOne.description,
                    pid: foundPOne.id
                });
            }
        }
    }

    let maxValue = -1;
    let maxName = "";
    let maxDescription = "";
    let maxId = "";

    for (let i = 0; i != allSuggested.length; i++) {
        if (allSuggested[i].delta > maxValue) {
            maxName = allSuggested[i].pname;
            maxDescription = allSuggested[i].pdescription;
            maxId = allSuggested[i].pid;
        }
    }

    const foundImage = await ImageModel.findOne({
        where: {
            productId: maxId
        }
    });

    const sendInfo = {
        productName: maxName,
        productDescription: maxDescription,
        productImageUrl: foundImage.url
    }

    res.status(200).send(JSON.stringify(sendInfo));
}

module.exports.addProductSuggested = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to add a product suggested.");
    console.log(req.body);
    console.log("**********************************");

    const { productName, amountToBuy, allShops, pantryListUuid } = req.body;

    const allShopsSplitted = allShops.split(",");

    const foundProduct = await ProductModel.findOne({
        where: {
            name: productName.trim()
        }
    });

    const foundPantryList = await PantryListModel.findOne({
        where: {
            uuid: pantryListUuid.trim()
        }
    });

    await PantryListProductModel.create({
        stock: 0,
        needed: Number(amountToBuy),
        PantryListId: foundPantryList.id,
        ProductId: foundProduct.id
    });

    for (let i = 0; i != allShopsSplitted.length; i++) {
        if (allShopsSplitted[i]) {

            const foundShoppingList = await ShoppingListModel.findOne({
                where: {
                    uuid: allShopsSplitted[i].trim()
                }
            });

            await ShoppingListProductModel.create({
                needed: Number(amountToBuy),
                ShoppingListId: foundShoppingList.id,
                ProductId: foundProduct.id
            });
        }
    }

    res.status(200).send();
}