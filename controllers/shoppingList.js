const ShoppingListModel = require("../models/shoppinglist");
const ProductModel = require("../models/product");
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const StoreModel = require("../models/store");
const UserModel = require("../models/user");
const UserShoppingListModel = require("../models/usershopping");

/**
 * UUID settings
 */
const { default: ShortUniqueId } = require('short-unique-id');
const optionsUUID = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(optionsUUID);
/**
 * Geocode settings (address to coordinates converter)
 */
const NodeGeocoder = require('node-geocoder');
const optionsGeocoder = {
    provider: 'opencage',
    apiKey: 'b86ee0f7cb4844c983b21ab717973b24',
    formatter: "gpx"
};
const geocoder = NodeGeocoder(optionsGeocoder);

/**
 * Convert XML to JSON
 */
const convert = require("xml-js");


//when the user presses the button to create the list
module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for shopping list creation");
    console.log(req.body);
    console.log("******************");

    const { listName, address, userId } = req.body;
    //result in XML
    const conversion = await geocoder.geocode({
        address
    });
    var conversionToJson = JSON.parse(convert.xml2json(conversion, { compact: false, spaces: 4 }));

    const { lat, lon } = conversionToJson.elements[0].elements[0].attributes;

    const point = { type: 'Point', coordinates: [lat, lon] };

    //create the store associated with the shopping list
    let newStore = await StoreModel.findOne(
        {
            where: {
                name: listName,
                address: address
            }
        }
    );

    if (!newStore) {
        //store does not exists
        //create store
        newStore = await StoreModel.create({
            name: listName,
            location: point,
            address,
        });
    }

    //create the shopping list itself
    const listUuid = uid();
    const newShoppingList = await ShoppingListModel.create({
        name: listName,
        address,
        uuid: listUuid,
        StoreId: newStore.id
    });

    await UserShoppingListModel.create({
        UserId: userId,
        ShoppingListId: newShoppingList.id
    });

    res.status(200).send(JSON.stringify({
        listId: listUuid
    }));
};

//when someone enters the list code
//returns the list and all the products associated with it
module.exports.getList = async (req, res) => {
    console.log("************");
    console.log("Someone wants to sync with a shopping list.");
    console.log(req.params);
    console.log("************");

    const { listId } = req.params;

    const foundList = await ShoppingListModel.findOne({
        where: {
            uuid: listId.trim()
        },
        include: ProductModel
    });


    const shoppingListInfo = {
        name: foundList.name,
        products: [],
    };

    foundList.dataValues.Products.forEach(el => {
        shoppingListInfo.products.push({
            productId: el.id,
            name: el.name,
            description: el.description,
            needed: el.ShoppingListProduct.needed
        });
    });

    res.status(200).send(JSON.stringify(shoppingListInfo));
};

//when someone deletes the pantry list
module.exports.deleteList = async (req, res) => {
    console.log("************");
    console.log("Someone wants to delete a list.");
    console.log("************");
};

//get all shopping lists for a specific user
module.exports.getAllUserShoppingLists = async (req, res) => {
    console.log("******************");
    console.log("Request for all user shopping lists.");
    console.log(req.body);
    console.log("******************");

    const { userId } = req.params;
    console.log(`Searching user id: ${userId}`);

    //get list
    const foundList = await UserModel.findOne({
        where: {
            id: userId.trim()
        },
        include: ShoppingListModel
    });

    const sendList = {
        userList: [],
    };

    foundList.ShoppingLists.forEach(shoppingList => {
        sendList.userList.push(`${shoppingList.dataValues.name} -> ${shoppingList.dataValues.uuid}`);
    });

    res.status(200).send(JSON.stringify(sendList));
}