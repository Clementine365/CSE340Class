const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const Util = {}

/* ************************
 * Builds the navigation bar
 ************************** */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  const rows = Array.isArray(data) ? data : []
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  rows.forEach((row) => {
    list += `<li><a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a></li>`
  })
  list += "</ul>"
  return list
}

/* ************************
 * Middleware to inject nav into all views
 ************************** */
Util.injectNav = async function (req, res, next) {
  try {
    res.locals.nav = await Util.getNav()
    next()
  } catch (err) {
    next(err)
  }
}

/* ************************
 * Middleware to inject account data into all views
 ************************** */
Util.injectAccountData = function (req, res, next) {
  res.locals.accountData = req.session?.account || null;
  next();
}

/* ************************
 * Builds the dropdown list of classifications for forms
 ************************** */
Util.buildClassificationList = function (classifications, selectedId = null) {
  let list = ""
  if (!Array.isArray(classifications)) classifications = []
  classifications.forEach((classification) => {
    const selected = selectedId == classification.classification_id ? "selected" : ""
    list += `<option value="${classification.classification_id}" ${selected}>${classification.classification_name}</option>`
  })
  return list
}

/* ************************
 * Grid for management table view
 ************************** */
Util.buildClassificationGrid = function (data) {
  let grid = '<table class="management-table">'
  grid += `
    <thead>
      <tr>
        <th>Vehicle</th>
        <th>Model</th>
        <th>Price</th>
        <th>Modify</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>
  `

  data.forEach(vehicle => {
    grid += `
      <tr>
        <td>${vehicle.inv_make} ${vehicle.inv_model}</td>
        <td>${vehicle.inv_model}</td>
        <td>$${vehicle.inv_price}</td>
        <td><a href="/inv/edit/${vehicle.inv_id}">Modify</a></td>
        <td><a href="/inv/delete/${vehicle.inv_id}">Delete</a></td>
      </tr>
    `
  })

  grid += '</tbody></table>'
  return grid
}

/* ************************
 * Grid for thumbnail display on public site
 ************************** */
Util.buildThumbnailGrid = async function (data) {
  let grid
  if (!Array.isArray(data)) data = []
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach((vehicle) => {
      grid += "<li>"
      grid += `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details"><img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`
      grid += '<div class="namePrice"><hr />'
      grid += `<h2><a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`
      grid += `<span>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</span>`
      grid += "</div></li>"
    })
    grid += "</ul>"
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* ************************
 * Inventory table for vehicle detail view (list form)
 ************************** */
Util.buildInventoryGrid = function (vehicles) {
  if (!vehicles || vehicles.length === 0) return null

  let grid = '<table class="inventory-grid">'
  grid += `
    <thead>
      <tr>
        <th>Make</th>
        <th>Model</th>
        <th>Year</th>
        <th>Price</th>
        <th>Details</th>
      </tr>
    </thead>
    <tbody>
  `

  vehicles.forEach((vehicle) => {
    grid += `
      <tr>
        <td>${vehicle.inv_make}</td>
        <td>${vehicle.inv_model}</td>
        <td>${vehicle.inv_year}</td>
        <td>$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</td>
        <td><a href="/inv/detail/${vehicle.inv_id}">View</a></td>
      </tr>
    `
  })

  grid += "</tbody></table>"
  return grid
}

/* ************************
 * Full vehicle detail page HTML
 ************************** */
Util.buildVehicleDetailView = function (vehicle) {
  const formatter = new Intl.NumberFormat("en-US")
  const price = `$${formatter.format(vehicle.inv_price)}`
  const mileage = `${formatter.format(vehicle.inv_miles)} miles`
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
  `
}

/* ************************
 * Generic error handler wrapper
 ************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

/* ************************
 * JWT authentication checker
 ************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = true
        next()
      }
    )
  } else {
    next()
  }
}

/* ************************
 * Login protection middleware
 ************************** */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

module.exports = Util
