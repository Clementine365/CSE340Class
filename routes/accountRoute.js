const express = require('express');
const router = express.Router();

const utilities = require('../utilities');
const accountsController = require('../controllers/accountsController'); // adjust path/name as needed
const accountController = require('../controllers/accountController');
const regValidate = require('../utilities/account-validation');
const checkJWT = require('../utilities/check-jwt'); // JWT validation middleware
const { validateAccountUpdate, validatePasswordChange } = require('../utilities/account-validation');

// Debug logs to verify function types (remove in production)
console.log('buildLogin is a', typeof accountsController.buildLogin);
console.log('handleErrors is a', typeof utilities.handleErrors);
console.log('registrationRules is a', typeof regValidate.registrationRules);
console.log('checkRegData is a', typeof regValidate.checkRegData);
console.log('registerAccount is a', typeof accountsController.registerAccount);

// Public routes
router.get(
  '/login',
  utilities.handleErrors(accountsController.buildLogin)
);

router.get(
  '/register',
  utilities.handleErrors(accountController.buildRegister)
);

router.post(
  '/register',
  regValidate.registrationRules(),  // This should return an array of validation middleware
  regValidate.checkRegData,          // This should be middleware to check validation result
  utilities.handleErrors(accountController.registerAccount)
);

router.post(
  '/login',
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountsController.accountLogin)
);

// Protected routes - require valid JWT and login
router.get(
  '/',
  checkJWT,
  utilities.checkLogin,
  utilities.handleErrors(accountsController.buildAccountManagement)
);

router.get(
  '/update/:id',
  checkJWT,
  utilities.checkLogin,
  utilities.handleErrors(accountsController.buildUpdateAccountView)
);

router.post(
  '/update',
  checkJWT,
  utilities.checkLogin,
  validateAccountUpdate,
  utilities.handleErrors(accountsController.updateAccountInfo)
);

router.post(
  '/change-password',
  checkJWT,
  utilities.checkLogin,
  validatePasswordChange,
  utilities.handleErrors(accountsController.changePassword)
);

router.get('/logout', (req, res, next) => {
  req.flash('notice', 'You have been logged out.');

  req.session.destroy(err => {
    if (err) {
      return next(err);
    }
    res.clearCookie('jwt');
    res.redirect('/');
  });
});

module.exports = router;
