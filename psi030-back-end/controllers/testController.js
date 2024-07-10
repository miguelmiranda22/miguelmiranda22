const Evaluation = require("../models/evaluation");
const Test = require("../models/test");

const element_controller = require("../controllers/elementController");

const asyncHandler = require("express-async-handler");

exports.tests_list = asyncHandler(async (req, res, next) => {

  // Get details of evaluation
  const [eval] = await Promise.all([
    Evaluation.findOne({ _id: req.params.id }).populate('tests').exec(),
  ]);
  if (!eval) {
    // No results.
    const err = new Error("Evaluation not found");
    err.status = 404;
    return next(err);
  }

  //Get the tests associated to the evaluation
  const tests = eval.tests;
  if (!tests || tests.length === 0) {
    // No results.
    return res.json("Evaluation has no tests");
  }
  return res.json(tests);
});


exports.test_delete = asyncHandler(async (test_id) => {

  // Find the test by URL
  const [test] = await Promise.all([
    Test.findOne({ _id: test_id }).exec(),
  ]);
  if (test) {
    //Get the tests associated to the evaluation
    const elementos = test.elementos;
    if (elementos) {
      // Delete all the tests associated to the evaluation
      for (const element_id of elementos) {
        await element_controller.element_delete(element_id);
      }
    }

    // Delete the test from the database
    await Test.deleteOne({ _id: test._id });
  }
});