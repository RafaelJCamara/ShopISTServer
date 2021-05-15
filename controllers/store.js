const Store = require("../models/store");
const StoreProductModel = require("../models/storeproduct");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const WaitTimeModel = require("../models/waittime");
const WaitingTimeInfoModel = require("../models/waitingtimeinfo");
const SimpleLinearRegression = require('ml-regression-simple-linear');

/**
 * object structure (inside linearRegressionInfoPerStore array)
 * {
 *  storeId:,
 *  x:[numberItemsInLine],
 *  y:[waitingTimeFor#Products]
 * }     
 * 
 */
// const linearRegressionInfoPerStore = [];


/**
 * UUID settings
 */
const { default: ShortUniqueId } = require('short-unique-id');
const optionsUUID = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(optionsUUID);


//creates a new store
module.exports.createStore = async (req, res) => {
};

//updates a product price at store
module.exports.updateProductAtStore = async (req, res) => {
    console.log("******************");
    console.log("Request for updating a product at a store.");
    console.log(req.body);
    console.log("******************");

    const { productQuantity, productPrice, shoppingListId, productId } = req.body;

    console.log("quantity:" + productQuantity + "\nprice:"+ productPrice + "\nshoppingListId:" + shoppingListId + "\nproductID:" + productId);

    //get shopping list we were 
    const foundShoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListId.trim()
        }
    });

    await StoreProductModel.upsert({
        price: Number(productPrice),
        StoreId: Number(foundShoppingList.StoreId),
        ProductId: Number(productId)
    });

    await ShoppingListProductModel.update({
        inCart: Number(productQuantity)
    }, {
        where: {
            ShoppingListId: Number(foundShoppingList.StoreId),
            ProductId: Number(productId)
        }
    });

    res.status(200).send();
}

module.exports.updateProductPriceAtStore = async (req, res) => {
    console.log("******************");
    console.log("Request for updating a product at a store.");
    console.log(req.body);
    console.log("******************");

    const {productPrice, shoppingListId, productId } = req.body;

    console.log("price:"+ productPrice + "\nshoppingListId:" + shoppingListId + "\nproductID:" + productId);

    //get shopping list we were 
    const foundShoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListId.trim()
        }
    });

    await StoreProductModel.upsert({
        price: Number(productPrice),
        StoreId: Number(foundShoppingList.StoreId),
        ProductId: Number(productId)
    });
    res.status(200).send();
}

//get current estimated waiting time
module.exports.currentWaitingTime = async (req, res) => {
    console.log("******************");
    console.log("Request for knowing waiting time at a specific store.");
    console.log(req.body);
    console.log("******************");

    const { storeId } = req.params;
    const foundWaitingList = await WaitTimeModel.findAll({
        where: {
            storeId: storeId.trim()
        }
    });

    let highestNumberOfItems = -1;
    let cummulativeItemsInLine = 0;

    foundWaitingList.forEach((element) => {
        if (element.dataValues.timeLeaving == null) {
            cummulativeItemsInLine += Number(element.dataValues.numberCartItems);
            highestNumberOfItems = 0;
        }
    });

    let predictedWaitingTime = -1;

    if (highestNumberOfItems == -1) {
        //no one in line
        predictedWaitingTime = 0;
    } else {
        //there are people in line

        const linearRegressionInfoPerStore = await WaitingTimeInfoModel.findAll({
            where: {
                storeId: storeId.trim()
            }
        });

        let xAxis = [];
        let yAxis = [];

        linearRegressionInfoPerStore.forEach(async (element) => {
            xAxis.push(element.dataValues.x);
            yAxis.push(element.dataValues.y);
        });

        const regression = new SimpleLinearRegression(xAxis, yAxis);
        predictedWaitingTime = regression.predict(cummulativeItemsInLine);
    }

    const sendInfo = {
        waitingTime: predictedWaitingTime,
    }

    res.status(200).send(JSON.stringify(sendInfo));
}

//register a user coming to the checkout area (start of the learning model)
module.exports.initCheckoutProcess = async (req, res) => {
    console.log("******************");
    console.log("Request for init checkout process.");
    console.log(req.body);
    console.log("******************");

    const currentDate = new Date();

    const { storeId } = req.params;
    const { numberItemsCart } = req.body;

    //generate uuid
    const checkoutUuid = uid();

    //get registered checkouts for that store
    const allCheckoutRegistered = await WaitTimeModel.findAll({
        where: {
            storeId: storeId.trim()
        }
    });

    let totalNumberOfProducts = Number(numberItemsCart);
    let productsInLine = 0;

    allCheckoutRegistered.forEach(el => {
        productsInLine += el.dataValues.numberCartItems;
    });

    totalNumberOfProducts += productsInLine;

    console.log("#############");
    console.log(`Total number of products in line (including ours): ${totalNumberOfProducts}`);
    console.log("#############");

    //create our registration for the checkout model
    await WaitTimeModel.create({
        uuid: checkoutUuid,
        timeArriving: currentDate,
        numberCartItems: numberItemsCart,
        numberCartItemsInLine: totalNumberOfProducts,
        storeId: storeId.trim()
    });

    const sendInfo = {
        checkoutToken: checkoutUuid
    }

    res.status(200).send(JSON.stringify(sendInfo));
}

//register when eventually checks out (end of the learning model)
module.exports.endCheckoutProcess = async (req, res) => {
    console.log("******************");
    console.log("Request for end checkout process.");
    console.log(req.body);
    console.log("******************");

    const { storeId } = req.params;
    const { checkoutId } = req.body;
    const currentDate = new Date();

    const foundWaitingTime = await WaitTimeModel.findOne({
        where: {
            uuid: checkoutId
        }
    });

    //add total number of waiting time (in minutes) to model
    const arrivalDate = foundWaitingTime.timeArriving;

    const arrivalTimeMinutes = (arrivalDate.getHours() * 60) + arrivalDate.getMinutes() + (arrivalDate.getSeconds() / 60);
    const currentTimeMinutes = (currentDate.getHours() * 60) + currentDate.getMinutes() + (currentDate.getSeconds() / 60);

    await WaitingTimeInfoModel.create({
        x: Number(foundWaitingTime.numberCartItems),
        y: Number(currentTimeMinutes) - Number(arrivalTimeMinutes),
        storeId: storeId.trim()
    });

    await WaitTimeModel.destroy({
        where: {
            uuid: checkoutId
        }
    });

    res.status(200).send();
}