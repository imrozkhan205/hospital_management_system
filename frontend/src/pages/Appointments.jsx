import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import { Calendar, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role");
  const doctorId = localStorage.getItem("doctorId");
  const patientId = localStorage.getItem("patientId");

const handleStatusChange = async(appointmentId, newStatus) => {
  const originalStatus = appointments.find(a => a.appointment_id === appointmentId)?.status;
  
  // Optimistic update
  setAppointments((prev) => prev.map((a) => 
    a.appointment_id === appointmentId ? {...a, status: newStatus} : a 
  ));
  
  try {
    await axiosInstance.put(`/appointments/${appointmentId}/status`, {status: newStatus});
    toast.success('Status updated');
  } catch (error) {
    // Rollback on error
    setAppointments((prev) => prev.map((a) => 
      a.appointment_id === appointmentId ? {...a, status: originalStatus} : a 
    ));
    console.error("Failed to update status:", error);
    toast.error("Failed to Update the status")
  }
}

  const fetchAppointments = async () => {
    try {
      const role = localStorage.getItem("role");
      let res;

      if (role === "doctor") {
        const doctorId = localStorage.getItem("linked_doctor_id");
        res = await axiosInstance.get(`/doctors/${doctorId}/appointments`);
      } else if (role === "patient") {
        const patientId = localStorage.getItem("linked_patient_id");
        res = await axiosInstance.get(`/patients/${patientId}/appointments`);
      } else {
        res = await axiosInstance.get("/appointments"); // admin gets all
      }

      setAppointments(res.data);
    } catch (error) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;
    try {
      await axiosInstance.delete(`/appointments/${id}`);
      toast.success("Appointment deleted");
      setAppointments((prev) =>
        prev.filter((appt) => appt.appointment_id !== id)
      );
    } catch (error) {
      toast.error("Failed to delete appointment");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-purple-600" />
          Appointments
        </h1>
        <Link
          to="/appointments/add"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow"
        >
          <Plus size={18} className="mr-2" />
          Add Appointment
        </Link>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p className="text-center text-gray-500">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Doctor ID</th>
                {/* <th className="px-4 py-3">Patient Name</th> */}

                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr
                  key={appt.appointment_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{appt.patient_id}</td>
                  <td className="px-4 py-3">{appt.doctor_id}</td>
                  {/* <td className="px-4 py-3">{appt.first_name}</td> */}
                  <td className="px-4 py-3">
                    {new Date(appt.appointment_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{appt.appointment_time}</td>
                  <td className="px-4 py-3 capitalize">
                    {appt.appointment_type}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={appt.status}
                      onChange={(e) =>
                        handleStatusChange(appt.appointment_id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(appt.appointment_id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;
