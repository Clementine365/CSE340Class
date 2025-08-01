const express = require("express");
const router = express.Router();

const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation");

// ============================
// MAIN INVENTORY PAGE ROUTE
// ============================

// GET - Show Inventory Management Page
router.get("/", invController.buildInventory);

// =====================
// CLASSIFICATION ROUTES
// =====================

// GET - Show Add Classification form
router.get("/add-classification", invController.buildAddClassification);

// POST - Process Add Classification form with validation
router.post(
  "/add-classification",
  validate.classificationRules(),       // Client-side validation rules
  validate.checkAddClassification,      // Server-side validation handler
  invController.addClassification       // Controller logic
);

// ==========================
// VEHICLE INVENTORY ROUTES
// ==========================

// GET - Show Add Vehicle form
router.get("/add-inventory", invController.buildAddInventory);

// POST - Process Add Vehicle form with validation
router.post(
  "/add-inventory",
  validate.addInventoryRules(),         // Client-side validation rules
  validate.checkAddInventory,           // Server-side validation handler
  invController.addInventory            // Controller logic
);

// =============================
// VIEW BY CLASSIFICATION ROUTE
// =============================

router.get("/type/:classificationId", invController.buildInventoryByClassificationId);

module.exports = router;
