const express = require("express");
const router = express.Router();

// Require our controllers.
const website_controller = require("../controllers/websiteController");

/* GET websites listing. */
router.get("/", website_controller.website_list);


module.exports = router;
