const Store = require("../models/store");
const StoreProductModel = require("../models/storeproduct");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const WaitTimeModel = require("../models/waittime");

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

    //get shopping list we were 
    const foundShoppingList = await ShoppingListModel.findOne({
        where: {
            uuid: shoppingListId.trim()
        }
    });

    await StoreProductModel.create({
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

//get current estimated waiting time
module.exports.currentWaitingTime = async (req, res) => {




    const sendInfo = {
        waitingTime: 0,
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
    const allCheckoutRegisterd = await WaitTimeModel.findAll({
        where: {
            storeId
        }
    });

    let totalNumberOfProducts = Number(numberItemsCart);

    allCheckoutRegisterd.forEach(el => {
        totalNumberOfProducts += Number(el.dataValues.numberCartItems);
    });

    console.log("#############");
    console.log(`Total number of products in line (including ours): ${totalNumberOfProducts}`);
    console.log("#############");

    //create our registration for the checkout model
    await WaitTimeModel.create({
        uuid: checkoutUuid,
        timeArriving: currentDate,
        numberCartItems: totalNumberOfProducts,
        storeId
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

    await WaitTimeModel.update(
        {
            timeLeaving: currentDate
        },

        {
            where: {
                storeId,
                uuid: checkoutId
            }
        }

    );

    res.status(200).send();
}