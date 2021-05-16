const PantryListModel = require("../models/pantrylist");
const ProductModel = require("../models/product");
const PantryListProductModel = require("../models/pantrylistproduct");
const { default: ShortUniqueId } = require('short-unique-id');
const options = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(options);
const PantryToShoppingModel = require("../models/pantrytoshopping");
const ShoppingListModel = require("../models/shoppinglist");
const ShoppingListProductModel = require("../models/shoppinglistproduct");
const ImageModel = require("../models/images");
const UserPantryListModel = require("../models/userpantrylist");
const UserModel = require("../models/user");
const PantryListAccessGrantModel = require("../models/pantryaccessgrant");

const NodeGeocoder = require('node-geocoder');
const optionsGeocoder = {
    provider: 'opencage',
    apiKey: 'b86ee0f7cb4844c983b21ab717973b24',
    formatter: "gpx"
};
const geocoder = NodeGeocoder(optionsGeocoder);


//when the user presses the button to create the list
module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for pantry list creation");
    console.log(req.body);
    console.log("******************");
    const { name, address, userId } = req.body;
    const listUuid = uid();

    const newList = await PantryListModel.create({
        name,
        uuid: listUuid,
        address
    });

    await UserPantryListModel.create({
        UserId: userId,
        PantryListId: newList.id,
    })

    const info = {
        listId: listUuid
    };

    res.status(200).send(JSON.stringify(info));
};

//when someone enters the list code
//returns the list and all the products associated with it
module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to sync with a pantry list.");
    console.log("This was the list ID", listId.trim());
    console.log("************");

    //get list
    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
        },
        include: ProductModel
    });

    const sendList = {
        name: foundList.name,
        products: [],
    };

    foundList.Products.forEach(product => {
        sendList.products.push({
            productId: product.id,
            name: product.name,
            description: product.description,
            stock: product.dataValues.PantryListProduct.stock,
            needed: product.dataValues.PantryListProduct.needed,
            total_rating: product.total_rating,
            nr_ratings: product.nr_ratings,
        });
    });

    res.status(200).send(JSON.stringify(sendList));
};

//when someone deletes the pantry list
module.exports.deleteList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to delete a list.");
    console.log("This was the list ID", listId);
    console.log("************");

    try {
        //get the corresponding pantry list
        const foundList = await PantryListModel.findOne({
            where: {
                uuid: listId
            }
        });

        await foundList.destroy();
    } catch (error) {

    }

};

//when a user consumes products from the pantry list
module.exports.consumeProducts = async (req, res) => {
    console.log("************");
    console.log("Someone consumed itens from the list.");
    console.log(req.body);
    console.log("************");

    const { productId, quantity } = req.body;
    const { listId } = req.params;

    try {
        //search product in the database
        const foundProduct = await ProductModel.findOne({
            where: {
                id: productId.trim()
            }
        });

        const foundList = await PantryListModel.findOne({
            where: {
                uuid: listId.trim()
            }
        });

        //make the update
        const currentProductState = await PantryListProductModel.findOne({
            where: {
                PantryListId: foundList.id,
                ProductId: foundProduct.id,
            }
        });

        await PantryListProductModel.update(
            {
                stock: Number(currentProductState.stock) - Number(quantity.trim()),
                needed: Number(currentProductState.needed) + Number(quantity.trim())
            },
            {
                where: {
                    PantryListId: foundList.id,
                    ProductId: foundProduct.id,
                }
            }
        );

        const foundMatches = await ShoppingListProductModel.findAll({
            where: {
                ProductId: productId.trim(),
            }
        });

        foundMatches.forEach(async (el) => {
            await ShoppingListProductModel.update({
                needed: Number(currentProductState.needed) + Number(quantity.trim())
            },
                {
                    where: {
                        ProductId: productId.trim(),
                    }
                });
        });

    } catch (error) {
        console.log("There was an error.");
        console.log("Error: ", error);
    }

    res.status(200).send();
};


/**
 * when a user updates products related information in the pantry list
 * updates happen when:
 *      (1) Someone updates the amount of products in stock or needed
 *      (2) Someone adds a shopping list for a specific product to be bought
 */
module.exports.updatePantry = async (req, res) => {
    console.log("******************");
    console.log("Request for pantry list update.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;
    const { productId, needed, shops } = req.body;

    console.log("##################");
    console.log(listId);
    console.log(productId);
    console.log(needed);
    console.log(shops);
    console.log("##################");

    const splittedShops = shops.split(",");

    const foundPantryList = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
        }
    });

    for (let i = 0; i != splittedShops.length; i++) {
        if (splittedShops[i]) {
            const foundShoppingList = await ShoppingListModel.findOne({
                where: {
                    uuid: splittedShops[i].trim()
                }
            });

            //check if pair shopping list - product exists
            const foundPair = await ShoppingListProductModel.findOne({
                where: {
                    ShoppingListId: Number(foundShoppingList.id),
                    ProductId: Number(productId.trim())
                }
            });

            //check if pantry to shopping
            const foundPantryToShopping = await PantryToShoppingModel.findOne({
                where: {
                    productId: productId.trim(),
                    ShoppingListId: foundShoppingList.id,
                    PantryListId: foundPantryList.id
                }
            });

            const foundPantryListProd = await PantryListProductModel.findOne({
                where: {
                    ProductId: productId.trim(),
                    PantryListId: foundPantryList.id,
                }
            });

            if (foundPair != null) {
                console.log("Found pair");
                //exists
                //update amount
                if (foundPantryToShopping != null) {
                    foundPair.needed -= foundPantryListProd._previousDataValues.needed;
                    foundPair.needed += Number(needed);
                } else {
                    foundPair.needed += Number(needed);
                }

                await foundPair.save();

            } else {
                console.log("Not found pair");
                //pair does not exists
                //save pair in database
                await ShoppingListProductModel.create({
                    needed: Number(needed),
                    ShoppingListId: Number(foundShoppingList.id),
                    ProductId: Number(productId.trim())
                });
            }


            if (foundPantryToShopping == null) {
                //does not exists
                await PantryToShoppingModel.create({
                    productId: productId.trim(),
                    ShoppingListId: foundShoppingList.id,
                    PantryListId: foundPantryList.id
                });
            }
        }
    }

    res.status(200).send();
};

//when someone adds a product to the pantry list
module.exports.addProductToPantry = async (req, res) => {
    console.log("******************");
    console.log("Request for adding product to pantry list.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;
    console.log("Lista: ", listId);

    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
        }
    });

    const { name, description, barcode, stock, needed, imageUrl } = req.body;

    try {

        const foundProduct = await ProductModel.findOne({
            where: {
                name
            }
        });

        //check if product exists(same name)
        if (foundProduct != null) {
            //exists
            //add entry to represent that this product belongs to the specific pantry list
            await PantryListProductModel.create({
                stock: Number(stock),
                needed: Number(needed),
                PantryListId: foundList.id,
                ProductId: foundProduct.id,
            });

        } else {
            //add the product to the database
            const newProduct = await ProductModel.create({
                name, description, barcode, total_rating: 0, nr_ratings: 0
            });

            //add entry to represent that this product belongs to the specific pantry list
            await PantryListProductModel.create({
                stock: Number(stock),
                needed: Number(needed),
                PantryListId: foundList.id,
                ProductId: newProduct.id,
            });

            //save cloud url information
            await ImageModel.create({
                url: imageUrl,
                productId: newProduct.id
            });
        }

    } catch (e) {
        console.log("Error: ", e);
    }

    res.status(200).send();
}

//get all pantry lists for a specific user
module.exports.getAllUserPantryLists = async (req, res) => {
    console.log("******************");
    console.log("Request for all user pantry lists.");
    console.log(req.body);
    console.log("******************");

    const { userId } = req.params;
    console.log(`Searching user id: ${userId}`);

    //get list
    const foundUser = await UserModel.findOne({
        where: {
            id: userId.trim()
        },
        include: PantryListModel
    });

    const sendList = {
        userList: [],
    };

    foundUser.PantryLists.forEach(pantryList => {
        sendList.userList.push(`${pantryList.dataValues.name} -> ${pantryList.dataValues.uuid}`);
        // console.log(`${pantryList.dataValues.name} -> ${pantryList.dataValues.uuid}`)
    });

    //seach for ACLs
    const foundACLs = await PantryListAccessGrantModel.findAll({
        where: {
            email: foundUser.email
        },
        include:
        {
            all: true,
            nested: true
        }
    });

    // foundACLs.forEach(el => {
    //     const pantryListId = el.pantryUserId.dataValues.PantryListId;
    //     // console.log(el.pantryUserId.dataValues)

    // });

    for (let i = 0; i != foundACLs.length; i++) {
        const pantryListId = foundACLs[i].pantryUserId.dataValues.PantryListId;
        const foundPList = await PantryListModel.findOne({
            where: {
                id: pantryListId
            }
        });
        sendList.userList.push(`${foundPList.name} -> ${foundPList.uuid}`);
    }


    res.status(200).send(JSON.stringify(sendList));
}

//grant access to user for a specific pantry list
module.exports.grantUserAccess = async (req, res) => {
    console.log("******************");
    console.log("Request to grant access to a specific pantry list.");
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

    console.log("####################");
    console.log("User id: ", foundUser.id);
    console.log("Pantry list id: ", foundList.id);
    console.log("####################");

    const foundMatch = await UserPantryListModel.findOne({
        where: {
            UserId: foundUser.id,
            PantryListId: foundList.id
        }
    });

    await PantryListAccessGrantModel.create({
        UserPantryId: foundMatch.id,
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
    console.log("Request to access all users of a specific pantry list.");
    console.log(req.body);
    console.log("******************");

    const { listId } = req.params;

    const sendInfo = {
        users: []
    }

    const foundPantry = await PantryListModel.findOne({
        where: {
            uuid: listId.trim()
        }
    });

    const accessGrants = await PantryListAccessGrantModel.findAll({
        where: {
            UserPantryId: foundPantry.id
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
    const foundOwner = await UserPantryListModel.findOne({
        where: {
            PantryListId: foundPantry.id
        }
    });

    const foundOwnerUser = await UserModel.findOne({
        where: {
            id: foundOwner.UserId
        }
    });

    sendInfo.users.push(`(owner) ${foundOwnerUser.username} -> ${foundOwnerUser.email}`);

    res.status(200).send(JSON.stringify(sendInfo));
}