const express = require("express");
const router = express.Router();

// Require our controllers.
const page_controller = require("../controllers/pageController");
const evaluation_controller = require("../controllers/evaluationController");

/* GET pages listing from a website. */
router.get("/:url", page_controller.page_list);

/* DELETE some pages */
// URL do website no parametro, URLs das pages no body
router.post("/delete/:url", page_controller.pages_delete);


module.exports = router;
