function checkLogin(req, res, next) {
  if ((req.session && req.session.account) || req.user) {
    // User is logged in via session or JWT
    return next();
  }

  // Not logged in
  req.flash("notice", "Please log in.");
  return res.redirect("/account/login");
}


module.exports = checkLogin;
