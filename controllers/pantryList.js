const PantryListModel = require("../models/pantrylist");
const ProductModel = require("../models/product");

const { default: ShortUniqueId } = require('short-unique-id');
const options = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(options);

//when the user presses the button to create the list
module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for list creation");
    console.log(req.body);
    console.log("******************");
    const { name } = req.body;
    const listUuid = uid();

    const newList = await PantryListModel.create({
        name,
        uuid: listUuid
    });

    const info = {
        uuid: listUuid
    };

    res.status(200).send(JSON.stringify(info));
};

//when someone enters the list code
//returns the list and all the products associated with it
module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to sync with a list.");
    console.log("This was the list ID", listId);
    console.log("************");

    //get list
    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId
        },
        include: ProductModel
    });

    const sendList = {
        products: [],
    };

    foundList.Products.forEach(product => {
        sendList.products.push({
            name: product.name,
            description: product.description,
            stock: product.dataValues.PantryListProduct.stock
        });
    });

    res.status(200).send(JSON.stringify(sendList));
};

//when someone deletes the list
module.exports.deleteList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to delete a list.");
    console.log("This was the list ID", listId);
    console.log("************");

    //get the corresponding pantry list
    const foundList = await PantryListModel.findOne({
        where: {
            uuid: listId
        }
    });

    //first delete the products associated with that list

    //then delete the list itself

};

//when someone adds or removes a product from the list or changes the list name
module.exports.updateList = async (req, res) => {
    console.log("************");
    console.log("Someone wants to update the list.");
    console.log("************");

    res.status(200).send();
};
