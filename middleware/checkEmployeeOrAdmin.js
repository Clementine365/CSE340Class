const jwt = require('jsonwebtoken');

function checkEmployeeOrAdmin(req, res, next) {
  try {
    const token = req.cookies.jwt; // assuming JWT stored in cookie named "jwt"
    if (!token) {
      req.flash('error', 'You must be logged in to view that page.');
      return res.status(401).render('account/login', { messages: req.flash('error') });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { account_type } = decoded;

    if (account_type === 'Employee' || account_type === 'Admin') {
      // attach user info to req if needed
      req.accountData = decoded;
      return next();
    } else {
      req.flash('error', 'You do not have permission to view that page.');
      return res.status(403).render('account/login', { messages: req.flash('error') });
    }
  } catch (err) {
    console.error(err);
    req.flash('error', 'Session expired or invalid. Please log in again.');
    return res.status(401).render('account/login', { messages: req.flash('error') });
  }
}

module.exports = checkEmployeeOrAdmin;
