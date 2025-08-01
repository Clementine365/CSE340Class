function checkLogin(req, res, next) {
  if (req.session && req.session.account) {
    // User is logged in
    next();
  } else {
    // Not logged in
    req.flash("notice", "Please log in.");
    res.redirect("/account/login");
  }
}

module.exports = checkLogin;
