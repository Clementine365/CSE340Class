const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  const rows = data?.rows || data || [];

  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  rows.forEach((row) => {
    list += "<li>";
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>";
    list += "</li>";
  });
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification dropdown list HTML for forms
 * ************************************ */
Util.buildClassificationList = function (classifications, selectedId = null) {
  let list = "";
  classifications.forEach((classification) => {
    const selected = selectedId == classification.classification_id ? "selected" : "";
    list += `<option value="${classification.classification_id}" ${selected}>${classification.classification_name}</option>`;
  });
  return list;
};

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ***************************************
 * Build individual vehicle detail view
 * *************************************** */
Util.buildVehicleDetailView = function (vehicle) {
  const formatter = new Intl.NumberFormat("en-US");
  const price = `$${formatter.format(vehicle.inv_price)}`;
  const mileage = `${formatter.format(vehicle.inv_miles)} miles`;

  return `
    <section class="vehicle-detail">
      <div class="vehicle-image-box">
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        <p class="inspection-note">This vehicle has passed inspection by an ASE-certified technician.</p>
      </div>

      <div class="vehicle-info-box">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <p class="price">No-Haggle Price: <span>${price}</span></p>

        <ul class="vehicle-specs">
          <li><strong>Mileage:</strong> ${mileage}</li>
          <li><strong>Ext. Color:</strong> ${vehicle.inv_color || "Unknown"}</li>
          <li><strong>Fuel Type:</strong> ${vehicle.inv_fueltype || "Unknown"}</li>
          <li><strong>Transmission:</strong> ${vehicle.inv_transmission || "Unknown"}</li>
          <li><strong>Drivetrain:</strong> ${vehicle.inv_drivetrain || "Unknown"}</li>
          <li><strong>VIN:</strong> ${vehicle.inv_vin || "Unavailable"}</li>
        </ul>

        <div class="cta-buttons">
          <a href="#" class="btn primary">Start My Purchase</a>
          <a href="#" class="btn">Contact Us</a>
          <a href="#" class="btn">Schedule Test Drive</a>
          <a href="#" class="btn">Apply for Financing</a>
        </div>
      </div>
    </section>
  `;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other functions in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
 * Middleware to check for JWT token
 **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in");
          res.clearCookie("jwt");
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = true;
        next();
      }
    );
  } else {
    next(); // Continue without JWT
  }
};

/* ****************************************
 * Check Login Middleware (uses res.locals.loggedin)
 **************************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

module.exports = Util;
