const ShoppingListModel = require("../models/shoppinglist");
const ProductModel = require("../models/product");
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const StoreModel = require("../models/store");
const UserModel = require("../models/user");
const UserShoppingListModel = require("../models/usershopping");
const ShoppingListAccessGrantModel = require("../models/shoppingaccessgrant");

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
            needed: el.ShoppingListProduct.needed,
            total_rating: el.total_rating,
            nr_ratings: el.nr_ratings
        });
        console.log(el.name + " " + el.id + " " + "rating log: " + el.ShoppingListProduct.total_rating + " " + el.ShoppingListProduct.nr_ratings)
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
    const foundUser = await UserModel.findOne({
        where: {
            id: userId.trim()
        },
        include: ShoppingListModel
    });

    const sendList = {
        userList: [],
    };

    foundUser.ShoppingLists.forEach(shoppingList => {
        sendList.userList.push(`${shoppingList.dataValues.name} -> ${shoppingList.dataValues.uuid}`);
    });

    //seach for ACLs
    const foundACLs = await ShoppingListAccessGrantModel.findAll({
        where: {
            email: foundUser.email
        },
        include:
        {
            all: true,
            nested: true
        }
    });

    for (let i = 0; i != foundACLs.length; i++) {
        const shopListId = foundACLs[i].shopUserId.dataValues.ShoppingListId;
        const foundSList = await ShoppingListModel.findOne({
            where: {
                id: shopListId
            }
        });
        sendList.userList.push(`${foundSList.name} -> ${foundSList.uuid}`);
    }

    res.status(200).send(JSON.stringify(sendList));
}

//grant access to user for a specific pantry list
module.exports.grantUserAccess = async (req, res) => {
    console.log("******************");
    console.log("Request to grant access to a specific shopping list.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;
    const { userEmail, ownerId } = req.body;

    const foundList = await ShoppingListModel.findOne({
        where: {
            uuid: listId.trim()
        }
    });

    const foundUser = await UserModel.findOne({
        where: {
            id: ownerId.trim()
        }
    });

    console.log("####################");
    console.log("User id: ", foundUser.id);
    console.log("Shopping list id: ", foundList.id);
    console.log("####################");

    const foundMatch = await UserShoppingListModel.findOne({
        where: {
            UserId: foundUser.id,
            ShoppingListId: foundList.id
        }
    });

    await ShoppingListAccessGrantModel.create({
        UserShoppingId: foundMatch.id,
        email: userEmail
    });


    res.status(200).send();
}

//remove access to user for a specific pantry list
module.exports.removeUserAccess = async (req, res) => {
    console.log("******************");
    console.log("Request to remove access to a specific pantry list.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;
    const { userEmail, ownerId } = req.body;

    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
        }
    });

    const foundUser = await UserModel.findOne({
        where: {
            id: ownerId.trim()
        }
    });

    const foundMatch = await UserPantryListModel.findOne({
        where: {
            UserId: foundUser.id,
            PantryListId: foundList.id
        }
    });

    await PantryListAccessGrantModel.destroy({
        where: {
            UserPantryId: foundMatch.id,
            email: userEmail
        }
    });


    res.status(200).send();
}

//get all users that share a list
module.exports.getAllUsers = async (req, res) => {
    console.log("******************");
    console.log("Request to access all users of a specific shopping list.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;

    const sendInfo = {
        users: []
    }

    const foundPantry = await ShoppingListModel.findOne({
        where: {
            uuid: listId.trim()
        }
    });

    const accessGrants = await ShoppingListAccessGrantModel.findAll({
        where: {
            UserShoppingId: foundPantry.id
        }
    });

    for (let i = 0; i != accessGrants.length; i++) {
        const foundUser = await UserModel.findOne({
            where: {
                email: accessGrants[i].email
            }
        });

        if (foundUser != null) {
            sendInfo.users.push(`${foundUser.username} -> ${foundUser.email}`);
        }
    }

    //inser list owner
    const foundOwner = await UserShoppingListModel.findOne({
        where: {
            ShoppingListId: foundPantry.id
        }
    });

    const foundOwnerUser = await UserModel.findOne({
        where: {
            id: foundOwner.UserId
        }
    });

    sendInfo.users.push(`(owner) ${foundOwnerUser.username} -> ${foundOwnerUser.email}`);

    console.log(sendInfo);

    res.status(200).send(JSON.stringify(sendInfo));
}