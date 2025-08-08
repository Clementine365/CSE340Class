const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model"); // For email uniqueness check

/* **********************************
 *  Registration Data Validation Rules
 * ********************************* */
const registrationRules = () => [
  body("account_firstname")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Please provide a first name."),

  body("account_lastname")
    .trim()
    .escape()
    .isLength({ min: 2 })
    .withMessage("Please provide a last name."),

  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required.")
    .custom(async (email) => {
      const emailExists = await accountModel.checkExistingEmail(email);
      if (emailExists) throw new Error("Email exists. Please log in or use a different email.");
    }),

  body("account_password")
    .trim()
    .notEmpty()
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password does not meet requirements."),
];

/* ******************************
 * Check registration data and return errors or continue
 * ***************************** */
const checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      errorMessages: errors.array().map((err) => err.msg),
      noticeMessages: req.flash("notice"),
    });
  }
  next();
};

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
const loginRules = () => [
  body("account_email")
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email is required."),

  body("account_password").trim().notEmpty().withMessage("Password is required."),
];

/* ******************************
 * Check login data and return errors or continue
 * ***************************** */
const checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    return res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
      errorMessages: errors.array().map((err) => err.msg),
      noticeMessages: req.flash("notice"),
    });
  }
  next();
};

/* **********************************
 *  Classification Name Validation Rule
 * ********************************* */
const classificationRules = [
  body("classification_name")
    .trim()
    .isLength({ min: 3 })
    .isAlpha()
    .withMessage("Classification must be at least 3 letters and alphabetic."),
];

/* **********************************
 *  Account Update Validation Rules
 * ********************************* */
const validateAccountUpdate = [
  body("account_firstname").trim().notEmpty().withMessage("First name is required."),
  body("account_lastname").trim().notEmpty().withMessage("Last name is required."),
  body("account_email")
    .trim()
    .isEmail()
    .withMessage("Valid email is required.")
    .custom(async (email, { req }) => {
      // Check email uniqueness only if changed
      const account_id = req.body.account_id;
      const existingAccount = await accountModel.getAccountByEmail(email);
      if (existingAccount && existingAccount.account_id != account_id) {
        throw new Error("Email already in use by another account.");
      }
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.validationErrors = errors.array();
      return next();
    }
    next();
  },
];

/* **********************************
 *  Password Change Validation Rules
 * ********************************* */
const validatePasswordChange = [
  body("account_password")
    .optional({ checkFalsy: true }) // allow empty password (means no change)
    .isLength({ min: 12 })
    .withMessage("Password must be at least 12 characters long.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number.")
    .matches(/[\W_]/)
    .withMessage("Password must contain at least one special character."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.validationErrors = errors.array();
      return next();
    }
    next();
  },
];

module.exports = {
  registrationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  classificationRules,
  validateAccountUpdate,
  validatePasswordChange,
};
