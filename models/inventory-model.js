const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * *************************** */
async function getClassifications() {
  try {
    const result = await pool.query(
      "SELECT * FROM public.classification ORDER BY classification_name"
    );
    return result.rows;
  } catch (error) {
    console.error("getClassifications error:", error);
    return [];
  }
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * *************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id 
       WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    return [];
  }
}

/* ***************************
 *  Get a vehicle by inv_id
 * *************************** */
async function getVehicleById(invId) {
  try {
    const result = await pool.query(
      `SELECT * FROM inventory WHERE inv_id = $1`,
      [invId]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getVehicleById error:", error);
  }
}

/* ***************************
 *  Add a new classification
 * *************************** */
async function addClassification(classification_name) {
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1)";
    const result = await pool.query(sql, [classification_name]);
    return result.rowCount;
  } catch (error) {
    console.error("Error adding classification:", error);
    throw error;
  }
}

/* ***************************
 *  Add a new inventory (vehicle)
 * *************************** */
async function addInventory(vehicle) {
  try {
    const sql = `
      INSERT INTO inventory (
        inv_make, inv_model, inv_year, inv_description,
        inv_image, inv_thumbnail, inv_price, inv_miles,
        inv_color, classification_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    const values = [
      vehicle.inv_make,
      vehicle.inv_model,
      vehicle.inv_year,
      vehicle.inv_description,
      vehicle.inv_image,
      vehicle.inv_thumbnail,
      vehicle.inv_price,
      vehicle.inv_miles,
      vehicle.inv_color,
      vehicle.classification_id,
    ];
    const result = await pool.query(sql, values);
    return result.rowCount;
  } catch (error) {
    console.error("Error adding inventory:", error);
    throw error;
  }
}

// Export all functions
module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory, 
};
