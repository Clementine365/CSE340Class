const pool = require("../database/");

async function getServiceHistoryByVehicle(inv_id) {
  try {
    const result = await pool.query(
      `SELECT sh.*, inv.inv_make, inv.inv_model
       FROM service_history AS sh
       JOIN inventory AS inv ON sh.inv_id = inv.inv_id
       WHERE sh.inv_id = $1
       ORDER BY service_date DESC`,
      [inv_id]
    );
    return result.rows;
  } catch (error) {
    console.error("getServiceHistoryByVehicle error:", error);
    throw error;
  }
}

async function addServiceRecord(inv_id, service_date, description, cost) {
  try {
    const result = await pool.query(
      `INSERT INTO service_history (inv_id, service_date, description, cost)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [inv_id, service_date, description, cost]
    );
    return result.rows[0];
  } catch (error) {
    console.error("addServiceRecord error:", error);
    throw error;
  }
}

async function getServiceRecordById(service_id) {
  try {
    const result = await pool.query(
      `SELECT * FROM service_history WHERE service_id = $1`,
      [service_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getServiceRecordById error:", error);
    throw error;
  }
}

async function updateServiceRecord(service_id, service_date, description, cost) {
  try {
    const result = await pool.query(
      `UPDATE service_history
       SET service_date = $1, description = $2, cost = $3
       WHERE service_id = $4
       RETURNING *`,
      [service_date, description, cost, service_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("updateServiceRecord error:", error);
    throw error;
  }
}

async function deleteServiceRecord(service_id) {
  try {
    const result = await pool.query(
      `DELETE FROM service_history WHERE service_id = $1`,
      [service_id]
    );
    return result.rowCount;
  } catch (error) {
    console.error("deleteServiceRecord error:", error);
    throw error;
  }
}

module.exports = {
  getServiceHistoryByVehicle,
  addServiceRecord,
  getServiceRecordById,
  updateServiceRecord,
  deleteServiceRecord
};
