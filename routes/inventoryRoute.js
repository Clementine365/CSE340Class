const express = require("express");
const router = express.Router();

const invController = require("../controllers/invController");
const checkLogin = require("../utilities/check-login");
const validate = require("../utilities/inventory-validation");

// =====================
// CLASSIFICATION ROUTES
// =====================

// GET - Show Add Classification form
router.get(
  "/add-classification",
  checkLogin,
  invController.buildAddClassification
);

// POST - Process Add Classification form
router.post(
  "/add-classification",
  checkLogin,
  validate.classificationRules(),
  validate.checkAddClassification,  // Correct middleware here
  invController.addClassification
);

// ==========================
// VEHICLE INVENTORY ROUTES
// ==========================

// GET - Show Add Vehicle form
router.get(
  "/add-inventory",
  checkLogin,
  invController.buildAddInventory
);

// POST - Process Add Vehicle form
router.post(
  "/add-inventory",
  checkLogin,
  validate.addInventoryRules(),
  validate.checkAddInventory,  // Correct middleware here
  invController.addInventory
);

// =============================
// VIEW BY CLASSIFICATION ROUTE
// =============================
router.get(
  "/type/:classificationId",
  invController.buildInventoryByClassificationId
);

module.exports = router;
