const utilities = require("../utilities/");
const baseController = {};

/**
 * Set a flash message and redirect to the home page
 */
baseController.setFlashAndRedirect = function(req, res) {
  req.flash("notice", "This is a flash message.");
  res.redirect("/");
};

/**
 * Render the home page
 */
baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav();
  const noticeMessages = req.flash("notice"); // Get the flash message (if any)
  res.render("index", { 
    title: "Home", 
    nav,
    noticeMessages
  });
};

module.exports = baseController;
