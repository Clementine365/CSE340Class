const { body, validationResult } = require("express-validator");

function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Classification name must be at least 3 characters long.")
      .isAlpha("en-US", { ignore: " " })
      .withMessage("Classification name must contain only letters and spaces."),
  ];
}

function addInventoryRules() {
  return [
    body("classification_id")
      .notEmpty()
      .withMessage("Classification is required."),

    body("make")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Make is required.")
      .matches(/^[A-Za-z0-9\s\-]+$/)
      .withMessage("Make must contain letters, numbers, spaces, or hyphens only."),

    body("model")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Model is required.")
      .matches(/^[A-Za-z0-9\s\-]+$/)
      .withMessage("Model must contain letters, numbers, spaces, or hyphens only."),

    body("description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Description is required."),

    body("image")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Image path must be a valid URL or left blank."),

    body("thumbnail")
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage("Thumbnail path must be a valid URL or left blank."),

    body("price")
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),

    body("year")
      .isInt({ min: 1886, max: 2100 })
      .withMessage("Year must be between 1886 and 2100."),

    body("miles")
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive integer."),

    body("color")
      .trim()
      .matches(/^[A-Za-z\s]{1,30}$/)
      .withMessage("Color must contain letters and spaces only, max 30 characters."),
  ];
}

// Middleware to check validation result for classification
function checkAddClassification(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("inventory/add-classification", {
      title: "Add New Classification",
      errors: errors,
      message: null,
      classification_name: req.body.classification_name,
      nav: req.nav || null,
    });
  }
  next();
}

// Middleware to check validation result for inventory (vehicle)
function checkAddInventory(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Make sure to provide classificationList in the render context if you use it in the form
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      errors: errors,
      message: null,
      classificationList: req.classificationList || null, // you might need to load this in your controller before render
      ...req.body,
      nav: req.nav || null,
    });
  }
  next();
}

module.exports = {
  classificationRules,
  addInventoryRules,
  checkAddClassification,
  checkAddInventory,
};
