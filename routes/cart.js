const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");

/*
    Cart routes
*/

//get a cart by the shopping list's code
router.get("/:shoppingId", cartController.getCart);

//checkout a cart
router.post("/:shoppingId", cartController.checkoutCart);

module.exports = router;