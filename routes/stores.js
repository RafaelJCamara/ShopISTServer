const express = require("express");
const router = express.Router();
const storeController = require("../controllers/store");

//create a store
router.post("/", storeController.createStore);

//updates a product price at store
router.post("/updateProduct", storeController.updateProductAtStore);

//asks for the current estimated waiting time
router.get("/:storeId/currentWaitingTime", storeController.currentWaitingTime);

//register a user coming to the checkout area (start of the learning model)
router.post("/:storeId/initCheckoutProcess", storeController.initCheckoutProcess);

//register when eventually checks out (end of the learning model)
router.post("/:storeId/endCheckoutProcess", storeController.endCheckoutProcess);


module.exports = router;