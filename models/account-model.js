const pool = require("../database/");
const bcrypt = require("bcrypt");

/* ****************************
 *   Register new account (hashed password)
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
      RETURNING *`;

    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Register Error:", error);
    return null;
  }
}

/* ****************************
 *   Check for existing email
 * **************************** */
async function checkExistingEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rowCount; // true if > 0
  } catch (error) {
    console.error("Email Check Error:", error);
    return false;
  }
}

/* ****************************
 *   Get user by email (for login)
 * **************************** */
async function getUserByEmail(account_email) {
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1";
    const result = await pool.query(sql, [account_email]);
    return result.rows[0];
  } catch (error) {
    console.error("Get User Error:", error);
    return null;
  }
}

/* ****************************
 *   Compare plain and hashed password
 * **************************** */
async function checkPassword(user, inputPassword) {
  try {
    return await bcrypt.compare(inputPassword, user.account_password);
  } catch (error) {
    console.error("Password Compare Error:", error);
    return false;
  }
}


/* *****************************
 * Return account data using email address
 * ***************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      `SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password 
       FROM account WHERE account_email = $1`,
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    return new Error("No matching email found");
  }
}


module.exports = {
  registerAccount,
  checkExistingEmail,
  getUserByEmail,
  checkPassword,
  getAccountByEmail, // <== Added to export
};
