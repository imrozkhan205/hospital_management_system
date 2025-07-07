import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AddDoctor = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    employee_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
    license_number: "",
    department_id: "",
    consultation_fee: "",
    experience_years: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post("/doctors", formData);
      toast.success("Doctor added successfully");
      navigate("/doctors");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add doctor"
      );
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Doctor</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border rounded-xl shadow-md"
      >
        <input
          type="text"
          name="employee_id"
          placeholder="Employee ID"
          value={formData.employee_id}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="specialization"
          placeholder="Specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="license_number"
          placeholder="License Number"
          value={formData.license_number}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          name="department_id"
          placeholder="Department ID"
          value={formData.department_id}
            onWheel={(e) => e.target.blur()}

          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          name="consultation_fee"
          placeholder="Consultation Fee"
          value={formData.consultation_fee}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="number"
          name="experience_years"
          placeholder="Experience (Years)"
          value={formData.experience_years}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Add Doctor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDoctor;
