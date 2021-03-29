const express = require("express");
const router = express.Router();
const listController = require("../controllers/lists");

router.get("/:listId", listController.getList);

module.exports = router;