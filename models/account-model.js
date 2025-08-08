const pool = require('../database/'); // Use your existing pool import
const bcrypt = require('bcrypt');

/* ****************************
 * Register new account (hashed password)
 * **************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const hashedPassword = await bcrypt.hash(account_password, 12);

    const sql = `
      INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password,
        account_type
      )
      VALUES ($1, $2, $3, $4, 'Client')
      RETURNING *;
    `;

    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error('Register Error:', error);
    return null;
  }
}

/* ****************************
 * Check if email already exists
 * **************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = 'SELECT * FROM account WHERE account_email = $1';
    const result = await pool.query(sql, [account_email]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Email Check Error:', error);
    return false;
  }
}

/* ****************************
 * Get account by email
 * **************************** */
async function getAccountByEmail(account_email) {
  try {
    const sql = 'SELECT * FROM account WHERE account_email = $1';
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error('Get Account By Email Error:', error);
    return null;
  }
}

/* ****************************
 * Get account by ID
 * **************************** */
async function getAccountById(account_id) {
  try {
    const sql = 'SELECT * FROM account WHERE account_id = $1';
    const result = await pool.query(sql, [account_id]);
    return result.rows[0];
  } catch (error) {
    console.error('Get Account By ID Error:', error);
    return null;
  }
}

/* ****************************
 * Update account info (firstname, lastname, email)
 * **************************** */
async function updateAccountInfo(account_id, firstname, lastname, email) {
  try {
    const sql = `
      UPDATE account
      SET account_firstname = $1,
          account_lastname = $2,
          account_email = $3
      WHERE account_id = $4
      RETURNING *;
    `;
    const result = await pool.query(sql, [firstname, lastname, email, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Update Account Info Error:', error);
    return false;
  }
}

/* ****************************
 * Update account password (hashed)
 * **************************** */
async function updatePassword(account_id, hashedPassword) {
  try {
    const sql = `
      UPDATE account
      SET account_password = $1
      WHERE account_id = $2
      RETURNING *;
    `;
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error('Update Password Error:', error);
    return false;
  }
}

/* ****************************
 * Compare plain password to hashed password
 * **************************** */
async function checkPassword(user, inputPassword) {
  try {
    return await bcrypt.compare(inputPassword, user.account_password);
  } catch (error) {
    console.error('Password Compare Error:', error);
    return false;
  }
}

module.exports = {
  registerAccount,
  checkExistingEmail,
  getAccountByEmail,
  getAccountById,
  updateAccountInfo,
  updatePassword,
  checkPassword,
};
