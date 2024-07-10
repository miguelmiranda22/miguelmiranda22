const express = require("express");
const router = express.Router();

// Require our controllers.
const website_controller = require("../controllers/websiteController");
const evaluation_controller = require("../controllers/evaluationController");

/* GET website detail. */
router.get("/:url", website_controller.website_detail);

/* POST create a new website */
// URL do novo website no body
router.post("/", website_controller.website_create_post);

/* DELETE a website and all its pages */
// URL no body
router.post("/delete", website_controller.website_delete);


module.exports = router;
