const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountsController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation"); // Validation rules

// Redirect /account to /account/login
router.get("/", (req, res) => {
  res.redirect("/account/login");
});

// Route to serve the login view
router.get(
  "/login",
  utilities.handleErrors(accountsController.buildLogin)
);

// Route to serve the registration view
router.get(
  "/register",
  utilities.handleErrors(accountsController.buildRegister)
);

// Process registration with validation and error handling
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountsController.registerAccount)
);

// Process login with validation and error handling
router.post(
  "/login",
  regValidate.loginRules(),       // Login validation rules
  regValidate.checkLoginData,     // Validation results check
  utilities.handleErrors(accountsController.processLogin)  // Actual login logic
);

module.exports = router;
