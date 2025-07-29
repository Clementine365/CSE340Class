const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invController = {};

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

  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classifications,
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
  const vehicle = req.body;

  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      classifications,
      vehicle,
      errors,
      message: null,
    });
  }

  try {
    const result = await invModel.addInventory(vehicle); // Make sure this exists in your model
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
      classifications,
      vehicle,
      message: "Error adding vehicle.",
      errors: null,
    });
  }
};

module.exports = invController;
