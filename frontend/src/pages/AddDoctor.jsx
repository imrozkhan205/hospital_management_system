import { useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddDoctor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialization: "",
    experience_years: "",
    username: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post("/doctors", form);
      toast.success("Doctor created with login");
      navigate("/doctors");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error adding doctor");
    }
  };

  return (
    <div className=" max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Doctor</h2>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 bg-white p-6 rounded shadow"
      >
        <input
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          placeholder="First Name"
          required
          className="border p-2 rounded"
        />
        <input
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          placeholder="Last Name"
          required
          className="border p-2 rounded"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="border p-2 rounded"
        />
        <input
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Phone"
          required
          className="border p-2 rounded"
        />
        <input
          name="specialization"
          value={form.specialization}
          onChange={handleChange}
          placeholder="Specialization"
          required
          className="border p-2 rounded"
        />
        <input
          name="experience_years"
          value={form.experience_years}
          onChange={handleChange}
          placeholder="Experience (years)"
          type="number"
          required
          className="border p-2 rounded"
        />
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Username for login"
          required
          className="border p-2 rounded"
        />
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          type="password"
          required
          className="border p-2 rounded"
        />
        <button type="submit" className="bg-purple-600 text-white py-2 rounded">
          Add Doctor
        </button>
      </form>
    </div>
  );
};

export default AddDoctor;
