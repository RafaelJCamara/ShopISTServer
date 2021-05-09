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

//add price to a product (when in a store)
router.post("/:productId/addPrice", productController.addProductPrice);

//remove product (when in pantry)
router.delete("/:productId/remove", productController.deleteProduct);

//update product rate
router.post("/:productId/rateProduct", productController.rateProduct);

module.exports = router;