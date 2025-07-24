// Require utilities and models
const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  const noticeMessages = req.flash("notice"); // Pull notice messages from flash

  res.render("account/login", {
    title: "Login",
    nav,
    noticeMessages,
  });
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav();
  const noticeMessages = req.flash("notice");

  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    noticeMessages,
  });
}

/* ****************************************
 *  Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    account_password
  );

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      noticeMessages: req.flash("notice"),
    });
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      noticeMessages: req.flash("notice"),
    });
  }
}

// Export controller functions
module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
};
