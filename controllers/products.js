const Product = require("../models/product");
const List = require("../models/list");

//when someone wants to create a product
module.exports.createProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a create product request");
    console.log(req.body);
    console.log("**********************************");
    //get user info
    const { name, price, description, listToken } = req.body;
    try {
        const convertedPrice = parseInt(price);
        const newProduct = new Product({ name, convertedPrice, description });
        await newProduct.save();

        //add product to the list
        const foundList = List.find({
            uuid: listToken
        });

        foundList[0].products.push(newProduct);
        await foundList[0].save();

        res.status(200).send();
    } catch (e) {
        console.log("Error: ", e);
    }
};

//when someone wants to check a specific product detail
module.exports.getProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to check product detail.");
    console.log(req.body);
    console.log("**********************************");

    //find product by some parameter
};

module.exports.deleteProduct = async (req, res) => {

};

module.exports.updateProduct = async (req, res) => {

};