import pool from "../config/db.js";

export const getDoctors = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: err.message });
  }
};

export const createDoctor = async (req, res) => {
  const {
    employee_id,
    first_name,
    last_name,
    email,
    phone,
    specialization,
    license_number,
    department_id,
    consultation_fee,
    experience_years,
  } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO doctors 
      (employee_id, first_name, last_name, email, phone, specialization, license_number, department_id, consultation_fee, experience_years)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        first_name,
        last_name,
        email,
        phone,
        specialization,
        license_number,
        department_id,
        consultation_fee,
        experience_years,
      ]
    );

    res
      .status(201)
      .json({ message: "Doctor created", doctor_id: result.insertId });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating doctor", error: err.message });
  }
};

export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      "DELETE FROM doctors WHERE doctor_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting doctor", error: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  const { id } = req.params;
  const {
    phone,
    email,
    specialization,
    license_number,
    department_id,
    consultation_fee,
    experience_years,
  } = req.body;

  try {
    const [result] = await pool.query(
      `UPDATE doctors SET 
        phone = ?,
        email = ?,
        specialization = ?,
        license_number = ?,
        department_id = ?,
        consultation_fee = ?,
        experience_years = ?
      WHERE doctor_id = ?`,
      [
        phone,
        email,
        specialization,
        license_number,
        department_id,
        consultation_fee,
        experience_years,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json({ message: "Doctor updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating doctor", error: error.message });
  }
};
