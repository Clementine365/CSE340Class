/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 ******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config();

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const flash = require("connect-flash")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")

/* ***********************
 * Middleware
 *************************/
// Enable session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}))

// Enable flash messages
app.use(flash())

// Middleware to expose flash messages to all views
app.use((req, res, next) => {
  res.locals.messages = () => req.flash()
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Static Routes
 *************************/
app.use(static)

/* ***********************
 * Application Routes
 *************************/
app.get("/", baseController.buildHome ) 
/*{
  req.flash("info", "Welcome to CSE Motors!") // Optional: just to test messages
  res.render("index", { title: "Home" })
}) */
// Inventory routes
app.use("/inv", inventoryRoute)
/* ***********************
 * Local Server Information
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || 'localhost'

/* ***********************
 * Start Server
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
