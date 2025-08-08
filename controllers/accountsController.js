const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const utilities = require('../utilities') // make sure this points to your utilities module

/* =========================
 * Build Login View
 * ========================= */
exports.buildLogin = async (req, res) => {
  try {
    const nav = await utilities.getNav()
    const noticeMessages = req.flash('notice') || []
    const errorMessages = req.flash('error') || []

    res.render('account/login', {
      title: 'Login',
      nav,
      noticeMessages,
      errorMessages,
      errors: [],            // no validation errors on initial GET
      account_email: '',     // no email on initial GET
    })
  } catch (error) {
    console.error('Error building login view:', error)
    res.status(500).render('errors/500')
  }
}

/* =========================
 * Process Login (POST) with validation errors handling
 * ========================= */
exports.accountLogin = async (req, res) => {
  try {
    const nav = await utilities.getNav()
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).render('account/login', {
        title: 'Login',
        nav,
        noticeMessages: [],
        errorMessages: [],
        errors: errors.array(),
        account_email: req.body.account_email || '',
      })
    }

    // Continue with your login logic (check user, password, create JWT, etc.)
    const account_email = req.body.account_email
    const account_password = req.body.account_password
    const accountData = await accountModel.getAccountByEmail(account_email)

    if (!accountData) {
      req.flash('notice', 'Please check your credentials and try again.')
      return res.status(400).render('account/login', {
        title: 'Login',
        nav,
        noticeMessages: req.flash('notice'),
        errorMessages: [],
        errors: [],
        account_email,
      })
    }

    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (!passwordMatch) {
      req.flash('notice', 'Please check your credentials and try again.')
      return res.status(400).render('account/login', {
        title: 'Login',
        nav,
        noticeMessages: req.flash('notice'),
        errorMessages: [],
        errors: [],
        account_email,
      })
    }

    delete accountData.account_password

// ✅ SET SESSION
    req.session.account = accountData;

    // Create JWT, set cookie (example)
    const jwt = require('jsonwebtoken')
    const token = jwt.sign(
      accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    )

    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 3600 * 1000,
      secure: process.env.NODE_ENV === 'production',
    })

    return res.redirect('/account/')
  } catch (error) {
    console.error('Login error:', error)
    const nav = await utilities.getNav()
    req.flash('notice', 'Access forbidden.')
    return res.status(403).render('account/login', {
      title: 'Login',
      nav,
      noticeMessages: req.flash('notice'),
      errorMessages: [],
      errors: [],
      account_email: '',
    })
  }
}

/* =========================
 * Build Register View
 * ========================= */
exports.buildRegister = (req, res) => {
  res.render('account/register', {
    title: 'Register',
    noticeMessages: req.flash('notice') || [],
    messages: req.flash('message') || [],
    errors: req.flash('error') || [],
  })
}




/* =========================
 * Build Account Management View
 * ========================= */
exports.buildAccountManagement = async (req, res) => {
  try {
    const nav = await utilities.getNav();
    const accountData = req.session.account;

    res.render('account/management', {
      title: 'Account Management',
      nav,
      accountData,
      messages: req.flash('message') || [],
      noticeMessages: req.flash('notice') || [],
      errors: []
    });
  } catch (error) {
    console.error("Error building account management view:", error);
    res.status(500).render("errors/500");
  }
};

/* =========================
 * Build Update Account View
 * ========================= */
exports.buildUpdateAccountView = async (req, res) => {
  try {
    const account_id = req.params.id
    const account = await accountModel.getAccountById(account_id)

    if (!account) {
      req.flash('error', 'Account not found.')
      return res.redirect('/account/')
    }

    res.render('account/update', {
      title: 'Update Account',
      account,
      messages: req.flash('message') || [],
      noticeMessages: req.flash('notice') || [],
      errors: []
    })
  } catch (error) {
    console.error(error)
    res.status(500).render('errors/500')
  }
}

/* =========================
 * Update Account Info
 * ========================= */
exports.updateAccountInfo = async (req, res) => {
  const errors = validationResult(req)
  const { account_id, account_firstname, account_lastname, account_email } = req.body

  if (!errors.isEmpty()) {
    return res.render('account/update', {
      title: 'Update Account',
      account: { account_id, account_firstname, account_lastname, account_email },
      messages: [],
      noticeMessages: [],
      errors: errors.array()
    })
  }

  try {
    const existingAccount = await accountModel.getAccountByEmail(account_email)
    if (existingAccount && existingAccount.account_id != account_id) {
      return res.render('account/update', {
        title: 'Update Account',
        account: { account_id, account_firstname, account_lastname, account_email },
        messages: [],
        noticeMessages: [],
        errors: [{ msg: 'Email address is already in use.' }]
      })
    }

    const updated = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)

    if (updated) {
      req.flash('message', 'Account information updated successfully.')
    } else {
      req.flash('message', 'No changes were made.')
    }

    return res.redirect('/account/')
  } catch (error) {
    console.error(error)
    res.status(500).render('errors/500')
  }
}

/* =========================
 * Change Password
 * ========================= */
exports.changePassword = async (req, res) => {
  const errors = validationResult(req)
  const { account_id, account_password } = req.body

  if (!errors.isEmpty()) {
    const account = await accountModel.getAccountById(account_id)
    return res.render('account/update', {
      title: 'Update Account',
      account,
      messages: [],
      noticeMessages: [],
      errors: errors.array()
    })
  }

  if (!account_password) {
    req.flash('notice', 'Password not changed because no new password was entered.')
    return res.redirect('/account/')
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10)
    const result = await accountModel.updatePassword(account_id, hashedPassword)

    if (result) {
      req.flash('message', 'Password changed successfully.')
    } else {
      req.flash('message', 'Password change failed.')
    }

    return res.redirect('/account/')
  } catch (error) {
    console.error(error)
    res.status(500).render('errors/500')
  }
}
