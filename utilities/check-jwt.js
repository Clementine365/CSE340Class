// utilities/check-jwt.js

const jwt = require("jsonwebtoken");

function checkJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded; // attach user info to request
    return next();
  } catch (err) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
}

module.exports = checkJWT;
