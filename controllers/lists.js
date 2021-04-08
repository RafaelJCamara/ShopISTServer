// const List = require("../models/list");
// const Product = require("../models/product");
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
    const listUuid = uid();
    console.log("List ID created: ", listUuid);
    //create list
    const newList = new List({
        name: req.body.name,
        products: [],
        uuid: listUuid
    });
    await newList.save();
    const info = { listId: listUuid };
    res.status(200).send(JSON.stringify(info));
};

//when someone enters the list code
module.exports.getList = async (req, res) => {
    const { listId } = req.params;
    console.log("************");
    console.log("Someone wants to sync with a list.");
    console.log("This was the list ID", listId);
    console.log("************");
    //retrieve the list from the database
    const foundList = await List.find({
        uuid: listId
    }).populate("products");

    const sendList = {
        uuid: foundList[0].uuid,
        name: foundList[0].name,
        products: foundList[0].products
    }

    res.status(200).send(JSON.stringify(sendList));
};

//when someone deletes the list
module.exports.deleteList = async (req, res) => {

};

//when someone adds or removes a product from the list or changes the list name
module.exports.updateList = async (req, res) => {
    console.log("************");
    console.log("Someone wants to update the list.");
    console.log("************");

    const { listId } = req.params;

    const productName = req.body.name;

    console.log(listId);
    console.log(productName);

    const newProduct = await Product.find({ name: productName });

    const foundList = await List.find({ uuid: listId });
    foundList[0].products.push(newProduct[0]);
    await foundList[0].save();

    res.status(200).send();

};

//when someone finished shopping at a specific store
module.exports.checkout = async (req, res) => {
    console.log("******************");
    console.log("Someone just shopped. Will add products to pantry list");
    console.log(req.body);
    console.log("******************");

    //pantry list ID
    const { listId } = req.params;

    //shopping list ID
    const shoppingListID = req.body.shopListId;

    //shopped products
    const boughtProducts = req.body.products;

    //get corresponding lists
    const shopList = await List.find({
        uuid: shoppingListID
    }).populate("products");

    const pantryList = await List.find({
        uuid: listId
    }).populate("products");

    let toBeDeleted = [];

    //add products to pantry list
    //remove products from shopping list
    boughtProducts.forEach(element => {
        //check if pantry list contains existent product
        if (pantryList[0].products.some(prod => prod.name === element.name)) {
            //product exists
            pantryList[0].products.forEach((product, index) => {
                if (product.name === element.name) {
                    //same object
                    //update quantity stored
                    pantryList[0].products[index].quantityToBuy = Number(product.quantityToBuy) + Number(element.quantityToBuy);
                }
            });

        } else {
            //product does not exists
            //add product to pantry list (product was bought without being planned)
            pantryList[0].products.push(element);
        }

        //check if shopping list contains the product purchased
        if (shopList[0].products.some(prod => prod.name === element.name)) {
            //product exists
            shopList[0].products.forEach((product, index) => {
                if (product.name === element.name) {
                    //same object
                    //subtract quantity stored
                    if (product.quantityToBuy === element.quantityToBuy) {
                        //we bought the expect quantity
                        //delete the product from this list
                        toBeDeleted.push(product);
                    } else {
                        //there is still missing products to be bought
                        shopList[0].products[index].quantityToBuy = Number(product.quantityToBuy) - Number(element.quantityToBuy);
                    }
                }
            });
        }
    });

    //delete from shop list
    let newShopList = shopList[0].products.filter(function (product) {
        return !toBeDeleted.some(prod => prod.name === product.name);
    });

    shopList[0].products = newShopList;

    await pantryList[0].save();
    await shopList[0].save();

    const message = {
        message: "Success!"
    }
    res.status(200).send(JSON.stringify(message));
};
