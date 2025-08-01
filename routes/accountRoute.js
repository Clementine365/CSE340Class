const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountsController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const checkLogin = require("../utilities/check-login"); // Middleware to protect success page

// Redirect /account to /account/login
router.get("/", (req, res) => {
  res.redirect("/account/login");
});

// GET - Show login page
router.get(
  "/login",
  utilities.handleErrors(accountsController.buildLogin)
);

// GET - Show registration page
router.get(
  "/register",
  utilities.handleErrors(accountsController.buildRegister)
);

// POST - Process registration with validation
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountsController.registerAccount)
);

// POST - Process login with validation
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountsController.processLogin) // This should redirect on success
);

//  GET - Success page after login
router.get(
  "/success",
  checkLogin, // Middleware ensures only logged-in users can view this
  async (req, res) => {
    const nav = await utilities.getNav();
    res.render("account/success", {
      title: "Success",
      nav,
      message: "You're in!",
    });
  }
);

module.exports = router;
