// Required external resources
const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountsController = require("../controllers/accountController");

// Redirect /account to /account/login
router.get("/", (req, res) => {
  res.redirect("/account/login");
});

// Route to serve the login view at /account/login
router.get(
  "/login",
  utilities.handleErrors(accountsController.buildLogin)
);

// Export the router for use in server.js
module.exports = router;
