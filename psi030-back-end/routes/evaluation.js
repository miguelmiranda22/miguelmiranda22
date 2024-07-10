const express = require("express");
const router = express.Router();

// Require our controllers.
const evaluation_controller = require("../controllers/evaluationController");
const test_controller = require("../controllers/testController");
const element_controller = require("../controllers/elementController");

/* GET the evaluation of a page */
router.get("/:id", evaluation_controller.evaluation_details);

/* GET the tests of an evaluation */
router.get("/tests/:id", test_controller.tests_list);

/* GET the elements of a test */
router.get("/elements/:id", element_controller.elements_list);

/* POST start a new evaluation for a website */
// URL do website nos params, das paginas a avaliar no body
router.post("/:url", evaluation_controller.evaluate_website);


module.exports = router;
