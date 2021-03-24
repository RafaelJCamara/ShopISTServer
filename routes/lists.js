const express = require("express");
const router = express.Router();
const listController = require("../controllers/lists");

router.route("/:id")
    .get(listController.getProduct)
    .post(listController.createProduct)
    .put(listController.updateProduct)
    .delete(listController.deleteProduct)
    ;


module.exports = router;