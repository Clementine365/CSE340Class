function checkLogin(req, res, next) {
  if (req.session && req.session.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    res.redirect("/account/login");
  }
}

module.exports = checkLogin;
