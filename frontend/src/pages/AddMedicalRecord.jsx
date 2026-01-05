import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AddMedicalRecord = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    visit_date: "",
    diagnosis: "",
    treatment: "",
    prescription: "",
    lab_results: "",
    notes: "",
  });

  // Fetch patients and doctors for dropdowns
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          axiosInstance.get("/api/patients"),
          axiosInstance.get("/api/doctors"),
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
      } catch (err) {
        toast.error("Failed to load patients or doctors");
      }
    };
    fetchData();
  }, []);

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
      await axiosInstance.post("/api/medical-records", formData);
      toast.success("Medical record added successfully");
      navigate("/medical-records");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to add medical record"
      );
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Medical Record</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border rounded-xl shadow-md"
      >
        <select
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.first_name} {p.last_name} (ID: {p.patient_id})
            </option>
          ))}
        </select>

        <select
          name="doctor_id"
          value={formData.doctor_id}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.doctor_id} value={d.doctor_id}>
              Dr. {d.first_name} {d.last_name} (ID: {d.doctor_id})
            </option>
          ))}
        </select>

        <input
          type="date"
          name="visit_date"
          value={formData.visit_date}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="diagnosis"
          placeholder="Diagnosis"
          value={formData.diagnosis}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />
        <input
          type="text"
          name="treatment"
          placeholder="Treatment"
          value={formData.treatment}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="prescription"
          placeholder="Prescription"
          value={formData.prescription}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <input
          type="text"
          name="lab_results"
          placeholder="Lab Results"
          value={formData.lab_results}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />
        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          className="border px-3 py-2 rounded sm:col-span-2"
          rows={3}
        />

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Add Record
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicalRecord;
