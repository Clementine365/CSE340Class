// Required external resources
const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountsController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation"); // Validation rules

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

// Process the registration data with validation
router.post(
  "/register",
  regValidate.registrationRules(), // Step 1: Apply registration validation rules
  regValidate.checkRegData,        // Step 2: Check validation results
  utilities.handleErrors(accountsController.registerAccount) // Step 3: Call controller
);

// Process the login attempt with validation
router.post(
  "/login",
  regValidate.loginRules(),    // Step 1: Apply login validation rules
  regValidate.checkLoginData,  // Step 2: Check login validation results
  (req, res) => {
    res.status(200).send("login process"); // Step 3: Placeholder
  }
);

// Export the router for use in server.js
module.exports = router;
