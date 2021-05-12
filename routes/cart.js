const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");

/*
    Cart routes
*/

//get a cart by the shopping list's code
router.get("/:shoppingId", cartController.getCart);

//checkout a cart
router.post("/checkout/:shoppingId", cartController.checkoutCart);

//create a new cart
router.post("/createCart", cartController.createCart);

module.exports = router;