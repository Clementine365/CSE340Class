const utilities = require("../utilities/");
const accountModel = require("../models/account-model");

/* ****************************************
 * Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  const nav = await utilities.getNav();
  const noticeMessages = req.flash("notice") || [];
  const errorMessages = req.flash("error") || [];

  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    noticeMessages,
    errorMessages,
  });
}

/* ****************************************
 * Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
  const nav = await utilities.getNav();
  const noticeMessages = req.flash("notice") || [];

  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
    noticeMessages,
  });
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res) {
  const nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_password } = req.body;

  try {
    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      account_password
    );

    if (regResult) {
      req.flash("notice", `Congratulations, you're registered ${account_firstname}. Please log in.`);
      return res.status(201).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        noticeMessages: req.flash("notice"),
        errorMessages: [],
      });
    } else {
      req.flash("notice", "Sorry, the registration failed.");
      return res.status(501).render("account/register", {
        title: "Register",
        nav,
        errors: null,
        noticeMessages: req.flash("notice"),
      });
    }
  } catch (err) {
    console.error("Registration error:", err);
    req.flash("notice", "An error occurred during registration.");
    return res.redirect("/account/register");
  }
}

/* ****************************************
 * Process Login (Updated Redirect)
 * *************************************** */
async function processLogin(req, res) {
  const nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  try {
    const user = await accountModel.getUserByEmail(account_email);

    if (!user) {
      req.flash("notice", "Invalid login credentials.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        noticeMessages: req.flash("notice"),
        errorMessages: [],
      });
    }

    const passwordMatch = await accountModel.checkPassword(user, account_password);

    if (!passwordMatch) {
      req.flash("notice", "Invalid login credentials.");
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        noticeMessages: req.flash("notice"),
        errorMessages: [],
      });
    }

    // Save account info in session
    req.session.account = {
      account_id: user.account_id,
      account_firstname: user.account_firstname,
      account_lastname: user.account_lastname,
      account_email: user.account_email,
      account_type: user.account_type,
    };

    //  Redirect to success page after login
    return res.redirect("/account/success");

  } catch (error) {
    console.error("Login error:", error);
    req.flash("notice", "An error occurred during login.");
    return res.status(500).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      noticeMessages: req.flash("notice"),
      errorMessages: [],
    });
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  processLogin,
};
