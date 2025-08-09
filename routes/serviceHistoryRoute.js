const express = require("express");
const router = express.Router();
const serviceHistoryController = require("../controllers/serviceHistoryController");
const utilities = require("../utilities");
const serviceHistoryValidate = require("../utilities/serviceHistory-validation");

router.get("/:inv_id", utilities.checkLogin, serviceHistoryController.buildServiceHistory);

router.get("/:inv_id/add", utilities.checkLogin, serviceHistoryController.buildAddServiceForm);

router.post(
  "/add", 
  utilities.checkLogin, 
  serviceHistoryValidate.serviceHistoryRules(),
  serviceHistoryValidate.checkServiceHistoryData,
  serviceHistoryController.addServiceRecord
);

router.get("/edit/:service_id", utilities.checkLogin, serviceHistoryController.buildEditServiceForm);

router.post(
  "/update", 
  utilities.checkLogin, 
  serviceHistoryValidate.serviceHistoryRules(),
  serviceHistoryValidate.checkServiceHistoryData,
  serviceHistoryController.updateServiceRecord
);

router.post("/delete", utilities.checkLogin, serviceHistoryController.deleteServiceRecord);

module.exports = router;
