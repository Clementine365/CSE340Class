const pool = require("../database/");

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
  try {
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
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result.rows[0]; // ✅ return the new user object
  } catch (error) {
    console.error("Register Error:", error); // ✅ helpful for debugging
    return null; // Avoid throwing errors into your views
  }
}

module.exports = { registerAccount };
