import pool from "../config/db.js";

export const createDepartment = async (req, res) => {
  const { department_name, head_doctor_id, location, phone } = req.body;

  try {
    const [result] = await pool.query(
      `INSERT INTO departments
             (department_name ,
    head_doctor_id ,
    location ,
    phone) VALUES(?,?,?,?)
            `,
      [department_name, head_doctor_id, location, phone]
    );
    res
      .status(201)
      .json({
        message: "Department created successfully",
        department_id: result.insertId,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error in creating Department", error: error.message });
  }
};

export const getDepartments = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM departments'
        );
        res.json(rows)
    } catch (error) {
        res.status(500).json({message: "Error fetching Departments", error: error.message});
    }
};

export const deleteDepartment = async (req, res) => {
    const {id} = req.params;

    try {
        const [result] = await pool.query(
            'DELETE FROM departments where department_id = ? ', [id]
        );

        if(result.affectedRows === 0){
            return res.status(500).json({message: "Department not found "});
        }

        res.json({message: "Department deleted successfully"})
    } catch (error) {
        
    }
}