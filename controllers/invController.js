const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult, body } = require("express-validator");

const invController = {};

/* Validation chains for Add Classification form */
invController.validateClassification = [
  body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .isAlphanumeric().withMessage("Classification name must contain only letters and numbers.")
    .isLength({ max: 30 }).withMessage("Classification name must be at most 30 characters."),
];

/* Validation chains for Add Inventory (Vehicle) form */
invController.validateInventory = [
  body("classification_id")
    .notEmpty().withMessage("Classification is required.")
    .isInt({ min: 1 }).withMessage("Classification must be a valid selection."),
  
  body("make")
    .trim()
    .notEmpty().withMessage("Make is required.")
    .matches(/^[A-Za-z0-9\s\-]{1,50}$/).withMessage("Make must be letters, numbers, spaces, or hyphens, max 50 chars."),
  
  body("model")
    .trim()
    .notEmpty().withMessage("Model is required.")
    .matches(/^[A-Za-z0-9\s\-]{1,50}$/).withMessage("Model must be letters, numbers, spaces, or hyphens, max 50 chars."),
  
  body("description")
    .trim()
    .notEmpty().withMessage("Description is required."),
  
  body("image")
    .optional({ checkFalsy: true })
    .isString().withMessage("Image path must be a string."),
  
  body("thumbnail")
    .optional({ checkFalsy: true })
    .isString().withMessage("Thumbnail path must be a string."),
  
  body("price")
    .notEmpty().withMessage("Price is required.")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  
  body("year")
    .notEmpty().withMessage("Year is required.")
    .isInt({ min: 1886, max: 2100 }).withMessage("Year must be between 1886 and 2100."),
  
  body("miles")
    .notEmpty().withMessage("Miles is required.")
    .isInt({ min: 0 }).withMessage("Miles must be zero or more."),
  
  body("color")
    .trim()
    .notEmpty().withMessage("Color is required.")
    .matches(/^[A-Za-z\s]{1,30}$/).withMessage("Color must be letters and spaces only, max 30 chars."),
];

/* GET - Render Inventory Management page */
invController.buildInventory = async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: null,
    });
  } catch (err) {
    console.error("Error building inventory management page:", err);
    res.status(500).send("Internal Server Error");
  }
};

/* GET - Render Add Classification form */
invController.buildAddClassification = async (req, res) => {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    message: null,
    classification_name: "",
  });
};

/* POST - Process Add Classification form */
invController.addClassification = async (req, res) => {
  const { classification_name } = req.body;
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors,
      message: null,
      classification_name,
    });
  }

  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("notice", "New classification added successfully.");
      return res.redirect("/inv");
    } else {
      throw new Error("Insert failed");
    }
  } catch (err) {
    console.error(err);
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      message: "Error adding classification.",
      errors: null,
      classification_name,
    });
  }
};

/* GET - Display inventory items by classification ID with built HTML grid */
invController.buildInventoryByClassificationId = async (req, res, next) => {
  const classificationId = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classificationId);
    let nav = await utilities.getNav();
    const grid = await utilities.buildClassificationGrid(data);

    res.render("inventory/classification", {
      title: "Vehicles",
      nav,
      classificationId,
      inventory: data,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* GET - Render Add Inventory (Vehicle) form */
invController.buildAddInventory = async (req, res) => {
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  const classificationList = await utilities.buildClassificationList(classifications);

  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    message: null,
    vehicle: {},
  });
};

/* POST - Process Add Inventory form */
invController.addInventory = async (req, res) => {
  const errors = validationResult(req);
  let nav = await utilities.getNav();
  const classifications = await invModel.getClassifications();
  const classificationList = await utilities.buildClassificationList(classifications);
  const vehicle = req.body;

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      vehicle,
      errors,
      message: null,
    });
  }

  try {
    const result = await invModel.addInventory(vehicle);
    if (result) {
      req.flash("notice", "New vehicle added successfully.");
      return res.redirect("/inv");
    } else {
      throw new Error("Insert failed");
    }
  } catch (err) {
    console.error(err);
    res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classificationList,
      vehicle,
      message: "Error adding vehicle.",
      errors: null,
    });
  }
};

module.exports = invController;
