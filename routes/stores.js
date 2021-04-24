const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store");

//create a store
router.post("/", storeController.createStore);

//updates a product price at store
router.post("/updateProduct", storeController.updateProductAtStore);

module.exports = router;