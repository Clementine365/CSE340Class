/*******************************************
 * Primary server file for CSE340 Project.
 * Handles configuration, routing, middleware.
 *******************************************/

require("dotenv").config();
const express = require("express");
const path = require("path");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const flash = require("connect-flash");
// Removed body-parser - using built-in middleware
const expressLayouts = require("express-ejs-layouts");
const cookieParser = require("cookie-parser");
const pool = require("./database/");
const app = express();

// Routes and Controllers
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const baseController = require("./controllers/baseController");
const errorRoute = require("./routes/errorRoute");
const utilities = require("./utilities");
const serviceHistoryRoute = require("./routes/serviceHistoryRoute");
/* ***********************
 * Middleware
 *************************/

// Serve static files from /public with absolute path
app.use(express.static(path.join(__dirname, "public")));

// Parse cookies
app.use(cookieParser());
app.use(utilities.checkJWTToken);

// Session configuration (updated)
app.use(
  session({
    store: new pgSession({
      createTableIfMissing: true,
      pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // secure true in prod
      sameSite: true,
    },
  })
);

// Flash messages
app.use(flash());

// Flash messages helper for views (expose as properties, not a function)
app.use((req, res, next) => {
  res.locals.messages = {
    notice: req.flash("notice"),
    error: req.flash("error"),
  };
  next();
});

// Body parser (built-in middleware instead of body-parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log cookies and session (optional, remove in production)
app.use((req, res, next) => {
  console.log("Cookies:", req.cookies);
  console.log("Session:", req.session);
  next();
});

/* ***********************
 * View Engine
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use(utilities.injectNav);
app.use(utilities.injectAccountData);


/* ***********************
 * Routes
 *************************/
app.use("/error", errorRoute);
app.use(staticRoutes);
app.use("/account", accountRoute);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/service-history", serviceHistoryRoute);
/* ***********************
 * 404 Not Found Middleware
 *************************/
app.use((req, res, next) => {
  next({ status: 404, message: "Sorry, seems like we lost that page." });
});


/* ***********************
 * Error Handler Middleware
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";

  console.error(`Error at "${req.originalUrl}": ${err.message}`);

  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500;
const host = process.env.HOST || "localhost";

app.listen(port, () => {
  console.log(`App listening at http://${host}:${port}`);
});
