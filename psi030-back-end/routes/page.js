const express = require("express");
const router = express.Router();

// Require our controllers.
const page_controller = require("../controllers/pageController");


/* GET page details */
router.get("/:url", page_controller.page_details);

/* POST create a new page */
router.post("/:url", page_controller.page_create_post);


module.exports = router;