const Website = require("../models/website");
const Page = require("../models/page");
const Evaluation = require("../models/evaluation");
const Test = require("../models/test");

const asyncHandler = require("express-async-handler");

//Usado apenas para debug
exports.delete_all = asyncHandler(async (req, res, next) => {
    await Website.deleteMany({});
    await Page.deleteMany({});
    await Evaluation.deleteMany({});
    await Test.deleteMany({});
    res.json({ message: 'Database have been successfully deleted.' });
  });