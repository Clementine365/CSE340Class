// utilities/check-jwt.js

const jwt = require("jsonwebtoken");

function checkJWT(req, res, next) {
  const token = req.cookies.jwt;

  // No token in cookies
  if (!token) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Attach user info to req for use in routes/controllers
    req.user = decoded;

    // Also attach to session so views can access it (e.g. req.session.account)
    req.session.account = decoded;

    return next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
}

module.exports = checkJWT;
