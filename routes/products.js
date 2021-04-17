const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");

//create product
router.post("/", productController.createProduct);

//retrieve product
router.get("/:productId", productController.getProduct);

//search a product for autocompletion purposes
router.get("/search/:productPartialName", productController.autocompleteProductName);

//add photo to product
router.post("/:productId/addPhoto", productController.addPhoto);

module.exports = router;