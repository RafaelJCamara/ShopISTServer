const express = require("express");
const router = express.Router();
const pantryListController = require("../controllers/pantryList");
const generalListController = require("../controllers/generalList");
const shoppingListController = require("../controllers/shoppingList");

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

//get a pantry list by it's code
router.get("/pantry/:listId", pantryListController.getList);

//create a list
router.post("/pantry", pantryListController.createList);

//consume an item from the pantry list
router.post("/pantry/:listId/consume", pantryListController.consumeProducts);

//add product to pantry list
router.post("/pantry/:listId/addProduct", pantryListController.addProductToPantry);

//update pantry list
router.post("/pantry/:listId/update", pantryListController.updatePantry);

/*
    Shopping list routes
*/

//create a shopping list
router.post("/shopping", shoppingListController.createList);

//get a shopping list by it's code
router.get("/shopping/:listId", shoppingListController.getList);

//delete a specific shopping list
router.delete("/shopping/:listId", shoppingListController.deleteList);

module.exports = router;