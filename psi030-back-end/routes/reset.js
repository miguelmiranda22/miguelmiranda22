const express = require("express");
const router = express.Router();

// Require our controllers.
const reset_controller = require("../controllers/resetController");

/* DELETE all websites and pages from the database. */
router.delete("/", reset_controller.delete_all);


module.exports = router;
