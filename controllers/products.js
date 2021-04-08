const Product = require("../models/product");


//when someone wants to create a product
module.exports.createProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a create product request");
    console.log(req.body);
    console.log("**********************************");
    //get user info
    const { name, description, barcode, producttype } = req.body;
    try {
        const newProduct = await Product.create({
            name, description, barcode, producttype
        });
        res.status(200).send();
    } catch (e) {
        console.log("Error: ", e);
    }
};

//when someone wants to check a specific product detail
//the product is closely linked with the list it is a part of
//ex a product selected in the context of a pantry list will show different info
// (continuation of last line) if selected when in the shop context
module.exports.getProduct = async (req, res) => {
    console.log("**********************************");
    console.log("There was a request to check product detail.");
    console.log(req.body);
    console.log("**********************************");

};

module.exports.deleteProduct = async (req, res) => {

};

module.exports.updateProduct = async (req, res) => {

};