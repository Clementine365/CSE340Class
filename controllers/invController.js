const invModel = require("../models/inventory-model");
const Util = require("../utilities");
const { validationResult } = require("express-validator");

const invController = {};

/* ===============================
   Inventory Management View
================================= */
invController.buildManagement = async (req, res, next) => {
  try {
    const nav = await Util.getNav();
    let classifications = await invModel.getClassifications();
    if (!Array.isArray(classifications)) classifications = [];

    const classification_id = req.query.classification_id || "";

    let inventory = [];
    if (classification_id) {
      inventory = await invModel.getInventoryByClassificationId(classification_id);
    }

    console.log("Rendering management with:", {
      classifications,
      classification_id,
      inventory,
      messages: req.flash(),
    });

    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classifications,
      classification_id,
      inventory,
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error in buildManagement:", error);
    next(error);
  }
};


/* ===============================
   Show Add Classification Form
================================= */
invController.buildAddClassification = async (req, res, next) => {
  try {
    const nav = await Util.getNav();

    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      errors: null,                // no errors initially
      classification_name: "",     // no pre-filled value initially
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   Process Add Classification Form
================================= */
invController.addClassification = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const { classification_name } = req.body;

    if (!errors.isEmpty()) {
      const nav = await Util.getNav();
      // Render form again with errors and previous input preserved
      return res.status(400).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
        errors,                    // validation errors
        classification_name,       // preserve user input
      });
    }

    const newClassification = await invModel.addClassification(classification_name);

    if (newClassification) {
      req.flash("info", `Classification "${newClassification.classification_name}" added successfully.`);
      return res.redirect("/inv/management");
    } else {
      req.flash("info", "Failed to add classification.");
      return res.redirect("/inv/add-classification");
    }
  } catch (error) {
    next(error);
  }
};

/* ===============================
   Show Add Inventory Form
================================= */
invController.buildAddInventory = async (req, res, next) => {
  try {
    const nav = await Util.getNav();
    let classifications = await invModel.getClassifications();
    if (!Array.isArray(classifications)) classifications = [];

    res.render("inventory/add-inventory", {
      title: "Add New Vehicle",
      nav,
      classifications,
      classificationList: Util.buildClassificationList(classifications),
      message: req.flash("info")[0] || null,
      errors: null,
      inv_make: "",
      inv_model: "",
      inv_description: "",
      inv_image: "/images/vehicles/no-image.png",
      inv_thumbnail: "/images/vehicles/no-image-tn.png",
      inv_price: "",
      inv_year: "",
      inv_miles: "",
      inv_color: "",
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   Process Add Inventory Form
================================= */
invController.addInventory = async (req, res, next) => {
  try {
    const inventoryData = req.body;
    const added = await invModel.addInventory(inventoryData);

    if (added) {
      req.flash("info", "Vehicle added successfully!");
      return res.redirect("/inv/management");
    } else {
      req.flash("info", "Failed to add vehicle.");
      return res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    console.error("Error adding inventory:", error);
    req.flash("info", "Failed to add vehicle.");
    return res.redirect("/inv/add-inventory");
  }
};

/* ===============================
   Build Inventory by Classification
================================= */
invController.buildByClassificationId = async (req, res, next) => {
  try {
    const classification_id = req.params.classification_id;
    const nav = await Util.getNav();
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      req.flash("notice", "No vehicles found.");
      return res.status(404).render("inventory/classification", {
        title: "Vehicle Inventory",
        nav,
        classification_id,
        grid: null,
      });
    }

    const grid = Util.buildClassificationGrid(data);
    const classificationName = data[0].classification_name;

    res.render("inventory/classification", {
      title: `${classificationName} vehicles`,
      nav,
      classification_id,
      grid,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   Vehicle Detail View
================================= */
invController.buildDetail = async (req, res, next) => {
  try {
    const inv_id = req.params.inv_id;
    const nav = await Util.getNav();
    const vehicle = await invModel.getInventoryById(inv_id);

    if (!vehicle) {
      const err = new Error("Vehicle not found");
      err.status = 404;
      return next(err);
    }

    const vehicleDetail = Util.buildVehicleDetailView(vehicle);
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model} Details`,
      nav,
      vehicle,
      vehicleDetail,
    });
  } catch (error) {
    next(error);
  }
};

/* ===============================
   Build Edit Inventory View
================================= */
invController.buildEditInventory = async (req, res, next) => {
  try {
    const inv_id = req.params.inv_id;
    const inv = await invModel.getInventoryById(inv_id);
    if (!inv) {
      req.flash("info", "Vehicle not found.");
      return res.redirect("/inv/management");
    }

    let classifications = await invModel.getClassifications();
    if (!Array.isArray(classifications)) classifications = [];
    const classificationSelect = Util.buildClassificationList(classifications, inv.classification_id);
    const nav = await Util.getNav();

    res.render("inventory/edit-inventory", {
      title: `Edit ${inv.inv_make} ${inv.inv_model}`,
      nav,
      inv,
      classificationSelect,
      messages: req.flash(),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

invController.updateInventory = async function (req, res) {
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    inv_id,
  } = req.body;

  const updateResult = await invModel.updateInventory([
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    inv_id,
  ]);

  if (updateResult) {
    req.flash("info", "✅ Vehicle updated successfully.");
    res.redirect("/inv");
  } else {
    req.flash("error", "❌ Vehicle update failed. Please try again.");
    res.redirect(`/inv/edit/${inv_id}`);
  }
};

/* ===============================
   Build Delete Confirmation View
================================= */
invController.buildDeleteInventory = async (req, res, next) => {
  try {
    const inv_id = req.params.inv_id;
    const inv = await invModel.getInventoryById(inv_id);
    if (!inv) {
      req.flash("info", "Vehicle not found.");
      return res.redirect("/inv/management");
    }

    const nav = await Util.getNav();
    const title = `Delete ${inv.inv_make} ${inv.inv_model}`;

    res.render("inventory/delete-confirm", {
      title,
      nav,
      inventory: inv,
      messages: req.flash(),
      errors: null,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Inventory
invController.deleteInventory = async (req, res, next) => {
  try {
    const inv_id = parseInt(req.body.inv_id);
    const result = await invModel.deleteInventory(inv_id);

    if (result && result.rowCount > 0) {
      req.flash("info", "✅ Vehicle deleted successfully.");
      res.redirect("/inv/management");
    } else {
      req.flash("info", "❌ Failed to delete vehicle.");
      res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    next(error);
  }
};

module.exports = invController;
