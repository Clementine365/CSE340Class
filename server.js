/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config();
const session = require("express-session");
const pool = require('./database/');
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const flash = require("connect-flash");
const bodyParser = require("body-parser");
const app = express();

// Routes and Controllers
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities");
const errorRoute = require("./routes/errorRoute");

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public"));

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.messages = () => req.flash();
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use("/error", errorRoute);
app.use(staticRoutes);
app.use("/account", accountRoute);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);

/* ***********************
 * 404 Not Found Middleware
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: 'Sorry, seems like we lost that page.' });
});

/* ***********************
 * Error Handler Middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  const message = err.status === 404 
    ? err.message 
    : 'Oh no! There was a crash. Maybe try a different route?';

  console.error(`Error at: "${req.originalUrl}": ${err.message}`);

  res.status(err.status || 500).render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || 'localhost';

app.listen(port, () => {
  console.log(`App listening on http://${host}:${port}`);
});
