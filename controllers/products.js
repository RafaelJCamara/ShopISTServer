const Product = require("../models/product");
const List = require("../models/list");

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

        res.status(200).send();
    } catch (e) {
        console.log("Error: ", e);
    }
};

module.exports.getProduct = async (req, res) => {

};

module.exports.deleteProduct = async (req, res) => {

};

module.exports.updateProduct = async (req, res) => {

};