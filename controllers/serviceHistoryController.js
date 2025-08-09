const serviceHistoryModel = require("../models/serviceHistory-model");
const invModel = require("../models/inventory-model");

async function buildServiceHistory(req, res) {
  const inv_id = parseInt(req.params.inv_id);
  const vehicle = await invModel.getInventoryById(inv_id);
  const history = await serviceHistoryModel.getServiceHistoryByVehicle(inv_id);

  res.render("serviceHistory/list", {
    title: `Service History - ${vehicle.inv_make} ${vehicle.inv_model}`,
    vehicle,
    history,
    errors: null
  });
}

function buildAddServiceForm(req, res) {
  const inv_id = parseInt(req.params.inv_id);
  res.render("serviceHistory/add", {
    title: "Add Service Record",
    inv_id,
    errors: null
  });
}

async function addServiceRecord(req, res) {
  const { inv_id, service_date, description, cost } = req.body;
  await serviceHistoryModel.addServiceRecord(inv_id, service_date, description, cost);
  req.flash("notice", "Service record added successfully.");
  res.redirect(`/service-history/${inv_id}`);
}

async function buildEditServiceForm(req, res) {
  const service_id = parseInt(req.params.service_id);
  const record = await serviceHistoryModel.getServiceRecordById(service_id);
  res.render("serviceHistory/edit", {
    title: "Edit Service Record",
    record,
    errors: null
  });
}

async function updateServiceRecord(req, res) {
  const { service_id, service_date, description, cost, inv_id } = req.body;
  await serviceHistoryModel.updateServiceRecord(service_id, service_date, description, cost);
  req.flash("notice", "Service record updated successfully.");
  res.redirect(`/service-history/${inv_id}`);
}

async function deleteServiceRecord(req, res) {
  const { service_id, inv_id } = req.body;
  await serviceHistoryModel.deleteServiceRecord(service_id);
  req.flash("notice", "Service record deleted successfully.");
  res.redirect(`/service-history/${inv_id}`);
}

module.exports = {
  buildServiceHistory,
  buildAddServiceForm,
  addServiceRecord,
  buildEditServiceForm,
  updateServiceRecord,
  deleteServiceRecord
};
