const express = require("express");
const router = express.Router();
const listController = require("../controllers/lists");

//get a list by it's code
router.get("/:listId", listController.getList);

//add product to list
router.put("/:listId", listController.updateList);

//create a list
router.post("/", listController.createList);

//add products to list after finishing the shopping
router.post("/:listId/checkout", listController.checkout);

module.exports = router;