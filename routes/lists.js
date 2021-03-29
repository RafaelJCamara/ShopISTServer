const express = require("express");
const router = express.Router();
const listController = require("../controllers/lists");

router.get("/:listId", listController.getList);
router.post("/", listController.createList);

module.exports = router;