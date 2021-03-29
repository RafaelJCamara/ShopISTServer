const List = require("../models/list");
const { default: ShortUniqueId } = require('short-unique-id');
const options = {
    length: 7,
    shuffle: false
};
const uid = new ShortUniqueId(options);

module.exports.createList = async (req, res) => {
    console.log("******************");
    console.log("Request for list creation");
    console.log(req.body);
    console.log("******************");
    const listUuid = uid();
    //create list
    const newList = new List({
        name: req.body.name,
        product: [],
        uuid: listUuid
    });
    await newList.save();
    const info = { listId: listUuid };
    res.status(200).send(JSON.stringify(info));
};

module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("This was a list request.");
    console.log("This was the list ID", listId);
    console.log("************");

    //retrieve the list from the database
    const foundList = await List.find({
        uuid: listId
    });

    const sendList = {
        uuid: foundList[0].uuid,
        name: foundList[0].name,
        products: foundList[0].products
    }

    res.status(200).send(JSON.stringify(sendList));
};

module.exports.deleteList = async (req, res) => {

};

module.exports.updateList = async (req, res) => {

};