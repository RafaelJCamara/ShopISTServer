const express = require("express");
const router = express.Router();
const pantryListController = require("../controllers/pantryList");
const generalListController = require("../controllers/generalList");

/* 
    General list operations
*/

//when someone has a pantry list and tries to generate a shopping
router.post("/generateShoppingLists", generalListController.generateShoppingLists);

//checking out at a store
router.post("/checkout", generalListController.checkout);


/*
    Pantry list routes
*/

//get a list by it's code
router.get("/pantry/:listId", pantryListController.getList);

//create a list
router.post("/pantry", pantryListController.createList);

//consume an item from the pantry list
router.post("/pantry/:listId/consume", pantryListController.consumeProducts);


/*
    Shopping list routes
*/



module.exports = router;