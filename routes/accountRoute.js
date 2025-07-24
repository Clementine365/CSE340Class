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

// Route to serve the registration view at /account/register
router.get(
  "/register",
  utilities.handleErrors(accountsController.buildRegister)
);

// ✅ Route to handle registration form POST
router.post(
  "/register",
  utilities.handleErrors(accountsController.registerAccount)
);

// Export the router for use in server.js
module.exports = router;
