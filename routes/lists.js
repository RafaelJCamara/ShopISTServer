const express = require("express");
const router = express.Router();
const pantryListController = require("../controllers/pantryList");
const generalListController = require("../controllers/generalList");

/* 
    General list operations
*/

//checking out at a store
router.post("/checkout", generalListController.generateShoppingLists);

/*
    Pantry list routes
*/

//get a list by it's code
router.get("/pantry/:listId", pantryListController.getList);

//add product to list
router.put("/pantry/:listId", pantryListController.updateList);

//create a list
router.post("/pantry/", pantryListController.createList);


/*
    Shopping list routes
*/




module.exports = router;