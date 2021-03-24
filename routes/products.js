const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");

router.route("/:id")
    .get(productController.getProduct)
    .post(productController.createProduct)
    .put(productController.updateProduct)
    .delete(productController.deleteProduct)
    ;

module.exports = router;