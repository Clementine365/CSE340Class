

// Require utilities
const utilities = require("../utilities/");

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav();
  const noticeMessages = req.flash("notice"); // Pull notice messages from flash

  res.render("account/login", {
    title: "Login",
    nav,
    noticeMessages, // Pass to the view
  });
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  });
}
module.exports = { 
  buildLogin,
  buildRegister,
};
