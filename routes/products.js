const express = require("express");
const router = express.Router();
const productController = require("../controllers/products");

router.post("/:productId", productController.getProduct);
router.get("/:productId", productController.createProduct);

module.exports = router;