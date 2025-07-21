// Required Resources
const express = require("express")
const router = express.Router()

const invController = require("../controllers/invController")
const utilities = require("../utilities") // Needed for handleErrors

// Route to build inventory by classification view
router.get(
  "/type/:classificationId",
  utilities.handleErrors(invController.buildByClassificationId)
)

// Route to build vehicle detail view
router.get(
  "/detail/:invId",
  utilities.handleErrors(invController.buildByInventoryId)
)

module.exports = router
