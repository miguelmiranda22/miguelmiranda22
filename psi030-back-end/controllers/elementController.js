const Test = require("../models/test");
const Element = require("../models/element");

const asyncHandler = require("express-async-handler");


exports.elements_list = asyncHandler(async (req, res, next) => {

  //Get details of test
  const [test] = await Promise.all([
    Test.findOne({ _id: req.params.id }).populate('elementos').exec(),
  ]);
  if (!test) {
    // No results.
    const err = new Error("Test not found");
    err.status = 404;
    return next(err);
  }

  //Get the elements associated to the test
  const elementos = test.elementos;
  if (!elementos || elementos.length === 0) {
    // No results.
    return res.json("Test has no elements");
  }
  return res.json(elementos);
});


exports.element_delete = asyncHandler(async (element_id) => {

  // Find the test by URL
  const [element] = await Promise.all([
    Element.findOne({ _id: element_id }).exec(),
  ]);
  if (element) {
    // Delete the test from the database
    await Element.deleteOne({ _id: element._id });
  }
});