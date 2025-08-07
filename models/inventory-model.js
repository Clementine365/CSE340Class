const pool = require("../database");

/* *****************************
 * Get all classifications
 ***************************** */
async function getClassifications() {
  const result = await pool.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
  return result.rows;
}

/* *****************************
 * Add new classification
 ***************************** */
async function addClassification(classification_name) {
  const sql = `
    INSERT INTO public.classification (classification_name)
    VALUES ($1)
    RETURNING *`;
  const result = await pool.query(sql, [classification_name]);
  return result.rows[0];
}

/* *****************************
 * Get all inventory items (with classification name)
 ***************************** */
async function getAllInventory() {
  const sql = `
    SELECT inv.*, c.classification_name 
    FROM public.inventory AS inv 
    JOIN public.classification AS c 
      ON inv.classification_id = c.classification_id 
    ORDER BY inv.inv_id`;
  const result = await pool.query(sql);
  return result.rows;
}

/* *****************************
 * Add new inventory item
 ***************************** */
async function addInventory(data) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  } = data;

  const sql = `
    INSERT INTO public.inventory (
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`;

  const result = await pool.query(sql, [
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  ]);

  return result.rows[0];
}

/* *****************************
 * Get inventory items by classification ID
 ***************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const sql = `
      SELECT inv.*, c.classification_name
      FROM public.inventory AS inv
      JOIN public.classification AS c
        ON inv.classification_id = c.classification_id
      WHERE inv.classification_id = $1
      ORDER BY inv.inv_model`;

    const result = await pool.query(sql, [classification_id]);
    return result.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    return [];
  }
}

/* *****************************
 * Get single inventory item by ID
 ***************************** */
async function getInventoryById(id) {
  const sql = `
    SELECT inv.*, c.classification_name
    FROM public.inventory AS inv
    JOIN public.classification AS c
      ON inv.classification_id = c.classification_id
    WHERE inv.inv_id = $1`;
  const result = await pool.query(sql, [id]);
  return result.rows[0];
}

async function updateInventory(data) {
  try {
    const sql = `
      UPDATE public.inventory
      SET 
        classification_id = $1,
        inv_make = $2,
        inv_model = $3,
        inv_year = $4,
        inv_description = $5,
        inv_image = $6,
        inv_thumbnail = $7,
        inv_price = $8,
        inv_miles = $9,
        inv_color = $10
      WHERE inv_id = $11
      RETURNING *;
    `;

    const result = await pool.query(sql, data);
    return result.rows[0]; // return the updated row
  } catch (error) {
    console.error("updateInventory error:", error);
    throw error;
  }
}

/* *****************************
 * Delete inventory item by ID
 ***************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = `DELETE FROM public.inventory WHERE inv_id = $1`;
    const result = await pool.query(sql, [inv_id]);
    return result; // result.rowCount will be 1 if deleted, 0 if not found
  } catch (error) {
    console.error("deleteInventoryItem model error:", error);
    throw new Error("Delete Inventory Error");
  }
}

module.exports = {
  getClassifications,
  addClassification,
  getAllInventory,
  addInventory,
  getInventoryByClassificationId,
  getInventoryById,
  updateInventory,
  deleteInventory, // make sure to use this name in your controller
};
