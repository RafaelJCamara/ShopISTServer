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

//update product rate
router.post("/:productId/rateProduct", productController.rateProduct);

//get product image
router.get("/:productName/getUrl", productController.getProductUrl);

//get product suggestion
router.get("/:productName/suggestions", productController.getProductSugggestions);

//add product suggestions
router.post("/suggestions/addsuggestedproduct", productController.addProductSuggested);

module.exports = router;