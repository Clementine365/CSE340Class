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

const app = express();

// Serve static files from "public" directory
app.use(express.static("public"));

const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const baseController = require("./controllers/baseController");
const utilities = require("./utilities");
const errorRoute = require("./routes/errorRoute");

/* ***********************
 * Middleware
 *************************/
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



// Enable flash messages
app.use(flash());

// Expose flash messages to views
app.use((req, res, next) => {
  res.locals.messages = () => req.flash();
  next();
});

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // layout file path

/* ***********************
 * Routes
 *************************/

// route for errors
app.use("/error", errorRoute);

// Static page routes
app.use(staticRoutes);

// Home page
app.get("/", utilities.handleErrors(baseController.buildHome));

// Inventory pages
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
    : 'Oh no! There was a crash. you can Maybe try a different route?';

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
