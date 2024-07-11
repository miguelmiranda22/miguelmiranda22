const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

// Import routes
const resetRouter = require("./routes/reset");
const pageRouter = require("./routes/page");
const pagesRouter = require("./routes/pages");
const websiteRouter = require("./routes/website");
const websitesRouter = require("./routes/websites");
const evaluationRouter = require("./routes/evaluation");

const compression = require("compression");
const helmet = require("helmet");

const app = express();

// Set up cors module
const cors = require('cors');
// Apply cors to all routes
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 10 * 1000, // 10 seconds
  max: 10,
});
// Apply rate limiter to all requests
app.use(limiter);

// Set up mongoose connection
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const dev_db_url =
/*local*/  "mongodb+srv://miguelmotamiranda:tnQexIH27fMKUIBN@cluster0.4jfdqdl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
/*app-server*/  //"mongodb://psi030:psi030@localhost:27017/psi030?retryWrites=true&authSource=psi030";
const mongoDB = process.env.MONGODB_URI || dev_db_url;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

app.use(compression()); // Compress all routes

app.use(express.static(path.join(__dirname, "public")));

// Add catalog routes to middleware chain.
app.use("/reset", resetRouter);
app.use("/page", pageRouter);
app.use("/pages", pagesRouter);
app.use("/website", websiteRouter);
app.use("/websites", websitesRouter);
app.use("/evaluation", evaluationRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
