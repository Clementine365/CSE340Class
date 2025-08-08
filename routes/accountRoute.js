const express = require('express');
const router = express.Router();

const utilities = require('../utilities');
const accountsController = require('../controllers/accountsController'); // note plural

const regValidate = require('../utilities/account-validation');
const checkJWT = require('../utilities/check-jwt'); // JWT validation middleware
const { validateAccountUpdate, validatePasswordChange } = require('../utilities/account-validation');



console.log('buildLogin is a',typeof accountsController.buildLogin);
console.log('handleErrors:', typeof utilities.handleErrors);

// Public routes
router.get(
  '/login',
  utilities.handleErrors(accountsController.buildLogin)
);

router.get(
  '/register',
  utilities.handleErrors(accountsController.buildRegister)
);

router.post(
  '/register',
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountsController.registerAccount)
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
