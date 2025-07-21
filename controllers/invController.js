const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);

  if (!data || data.length === 0) {
    return res.status(404).render("errors/404", { title: "No vehicles found" });
  }

  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build vehicle detail view by inventory ID
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const invId = req.params.invId;
  const vehicleData = await invModel.getVehicleById(invId);

  if (!vehicleData) {
    return res.status(404).render("errors/404", { title: "Vehicle Not Found" });
  }

  let nav = await utilities.getNav();

  res.render("inventory/detail", {
    title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
    nav,
    vehicle: vehicleData, // ✅ passes actual vehicle object
  });
};

module.exports = invCont;
