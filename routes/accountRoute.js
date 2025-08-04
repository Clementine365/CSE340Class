const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountsController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const checkJWT = require("../utilities/check-jwt"); // Validates JWT

// GET - Account management view (protected by JWT and login check)
router.get(
  "/",
  checkJWT,                     // Validates JWT token
  utilities.checkLogin,         // Validates session login
  utilities.handleErrors(accountsController.buildAccountManagement)
);

// GET - Show login page (public)
router.get(
  "/login",
  utilities.handleErrors(accountsController.buildLogin)
);

// GET - Show registration page (public)
router.get(
  "/register",
  utilities.handleErrors(accountsController.buildRegister)
);

// POST - Process registration with validation (public)
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountsController.registerAccount)
);

// POST - Process login with validation (public)
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountsController.accountLogin)
);

module.exports = router;
