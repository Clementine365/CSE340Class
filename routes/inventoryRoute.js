const express = require("express");
const router = express.Router();

const invController = require("../controllers/invController");
const validate = require("../utilities/inventory-validation");
const Util = require("../utilities/index");

// Inventory management view
router.get("/management", Util.checkLogin, invController.buildManagement);

// Add Classification
router.get("/add-classification", Util.checkLogin, invController.buildAddClassification);
router.post(
  "/add-classification",
  Util.checkLogin,
  validate.classificationRules(),
  validate.checkAddClassification,
  invController.addClassification
);

// Add Inventory
router.get("/add-inventory", Util.checkLogin, invController.buildAddInventory);
router.post(
  "/add-inventory",
  Util.checkLogin,
  validate.addInventoryRules(),
  validate.checkAddInventory,
  invController.addInventory
);

// View by Classification
router.get("/classification/:classification_id", invController.buildByClassificationId);
router.get("/type/:classification_id", invController.buildByClassificationId);

// View Vehicle Detail
router.get("/detail/:inv_id", invController.buildDetail);

// Edit Inventory
router.get("/edit/:inv_id", Util.checkLogin, invController.buildEditInventory);
router.post(
  "/update",
  Util.checkLogin,
  validate.updateInventoryRules(),
  validate.checkUpdateInventory,
  invController.updateInventory
);

// Delete Confirmation View (GET)
router.get("/delete/:inv_id", Util.checkLogin, invController.buildDeleteInventory);

// Perform Delete (POST)
router.post("/delete", Util.checkLogin, invController.deleteInventory);




module.exports = router;
