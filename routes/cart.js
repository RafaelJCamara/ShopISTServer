const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart");

/*
    Cart routes
*/

//get a cart by the shopping list's code
router.get("/:shoppingId/:userId", cartController.getCart);

//checkout a cart
router.post("/checkout/:shoppingId/:userId", cartController.checkoutCart);

//create a new cart
router.post("/createCart/:userId", cartController.createCart);

//add product to cart
router.post("/:shoppingId/addProduct", cartController.addProductToCart);

module.exports = router;