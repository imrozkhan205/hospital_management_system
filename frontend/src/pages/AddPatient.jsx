import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AddPatient = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patient_number: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    blood_type: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    insurance_provider: "",
    insurance_policy_number: "",
    allergies: "",
    // Add new fields for login credentials
    username: "", // Added username
    password: "", // Added password
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
      console.log("Form data being sent:", formData);
      const response = await axiosInstance.post("/api/patients", formData); // Ensure your backend /patients endpoint handles username/password
      console.log("Response:", response.data);
      toast.success("Patient added successfully with login credentials"); // Updated toast message
      navigate("/patients");
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to add patient"
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Patient</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border rounded-xl shadow-md"
      >
        <input
          type="text"
          name="patient_number"
          placeholder="Patient Number"
          value={formData.patient_number}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="date"
          name="date_of_birth"
          placeholder="DOB"
          value={formData.date_of_birth}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <select
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="text"
          name="blood_type"
          placeholder="Blood Type (e.g. A+)"
          value={formData.blood_type}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />
        <input
          type="text"
          name="emergency_contact_name"
          placeholder="Emergency Contact Name"
          value={formData.emergency_contact_name}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          name="emergency_contact_phone"
          placeholder="Emergency Contact Phone"
          value={formData.emergency_contact_phone}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          name="insurance_provider"
          placeholder="Insurance Provider"
          value={formData.insurance_provider}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          name="insurance_policy_number"
          placeholder="Insurance Policy Number"
          value={formData.insurance_policy_number}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <input
          type="text"
          name="allergies"
          placeholder="Allergies"
          value={formData.allergies}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        {/* New fields for username and password */}
        <input
          type="text"
          name="username"
          placeholder="Username for login"
          value={formData.username}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required // Make username required for login
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
          required // Make password required for login
        />

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Add Patient
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPatient;