import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AddAppointment = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: "",
    appointment_type: "",
    status: "",
    reason_for_visit: "",
    notes: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          axiosInstance.get("/patients"),
          axiosInstance.get("/doctors"),
        ]);
        setPatients(patientRes.data);
        setDoctors(doctorRes.data);
      } catch (error) {
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
      await axiosInstance.post("/appointments", formData);
      toast.success("Appointment added successfully");
      navigate("/appointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add appointment");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Appointment</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border rounded-xl shadow-md"
      >
        {/* Patient */}
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
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>

        {/* Doctor */}
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
              Dr. {d.first_name} {d.last_name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="time"
          name="appointment_time"
          value={formData.appointment_time}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="number"
          name="duration_minutes"
          placeholder="Duration (minutes)"
          value={formData.duration_minutes}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}

          className="border px-3 py-2 rounded"
          required
        />

        <input
          type="text"
          name="appointment_type"
          placeholder="Appointment Type"
          value={formData.appointment_type}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <input
          type="text"
          name="reason_for_visit"
          placeholder="Reason for Visit"
          value={formData.reason_for_visit}
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
            Add Appointment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAppointment;
