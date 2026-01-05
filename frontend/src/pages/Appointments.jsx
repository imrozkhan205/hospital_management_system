import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import { Calendar, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
// Ensure Listbox components are imported
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { Check, ChevronDown } from 'lucide-react'; // Also Check and ChevronDown icons

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const role = localStorage.getItem("role");

  const handleStatusChange = async (appointmentId, newStatus) => {
    newStatus = newStatus.toLowerCase();
    const originalStatus = appointments.find(a => a.appointment_id === appointmentId)?.status;

    setAppointments(prev =>
      prev.map(a =>
        a.appointment_id === appointmentId ? { ...a, status: newStatus } : a
      )
    );

    try {
      await axiosInstance.put(`/api/appointments/${appointmentId}/status`, { status: newStatus });
      toast.success("Status updated");
    } catch (error) {
      setAppointments(prev =>
        prev.map(a =>
          a.appointment_id === appointmentId ? { ...a, status: originalStatus } : a
        )
      );
      toast.error("Failed to update status");
    }
  };

  const fetchAppointments = async () => {
    try {
      let res;
      if (role === "doctor") {
        const doctorId = localStorage.getItem("linked_doctor_id");
        res = await axiosInstance.get(`/api/appointments/doctors/${doctorId}/appointments`);
      } else if (role === "patient") {
        const patientId = localStorage.getItem("linked_patient_id");
        res = await axiosInstance.get(`/api/appointments/patients/${patientId}/appointments`);
      } else {
        res = await axiosInstance.get("/api/appointments"); // admin
      }
      setAppointments(res.data);
    } catch (error) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await axiosInstance.delete(`/api/appointments/${id}`);
      toast.success("Appointment deleted");
      setAppointments(prev => prev.filter(appt => appt.appointment_id !== id));
    } catch (error) {
      toast.error("Failed to delete appointment");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Possible statuses for appointments
  const appointmentStatuses = ['scheduled', 'completed', 'cancelled'];

  return (
    <div className="p-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="text-purple-600" />
            Appointments
          </h1>
        </div>
        <Link
          to={role === "admin" || role === "doctor" ? "/appointments/add" : "/all-doctors"}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow"
        >
          <Plus size={18} className="mr-2" />
          Add Appointment
        </Link>
      </div>

      {/* ✅ Existing Status filter dropdown */}
      <Listbox value={statusFilter} onChange={setStatusFilter}>
        <div className="relative pb-3">
          <ListboxButton className="flex justify-between items-center border border-gray-300 rounded-md shadow-sm py-1 pl-2 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36">
            <span className="capitalize">{statusFilter}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </ListboxButton>
          <ListboxOptions className="absolute mt-1 w-36 bg-white shadow-lg rounded-md z-10 text-xs border border-gray-200">
            {['all', 'scheduled', 'completed', 'cancelled'].map((status) => (
              <ListboxOption
                key={status}
                value={status}
                className={({ active }) =>
                  `cursor-pointer select-none px-3 py-1 ${
                    active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700'
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex justify-between items-center">
                    <span className="capitalize">{status}</span>
                    {selected && <Check className="w-4 h-4 text-indigo-600" />}
                  </div>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        </div>
      </Listbox>


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
                {(role === "admin" || role === "doctor") && (
                  <th className="px-4 py-3">Patient Name</th>
                )}
                {(role === "admin" || role === "patient") && (
                  <th className="px-4 py-3">Doctor Name</th>
                )}
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                {(role === "admin" || role === "doctor") && (<th className="px-4 py-3 text-right">Actions</th>)}
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter((appt) => statusFilter === 'all' || appt.status === statusFilter)
                .map((appt) => (
                  <tr key={appt.appointment_id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{appt.patient_id}</td>
                    <td className="px-4 py-3">{appt.doctor_id}</td>
                    {(role === "admin" || role === "doctor") && (
                      <td className="px-4 py-3">{appt.patient_first_name} {appt.patient_last_name}</td>
                    )}
                    {(role === "admin" || role === "patient") && (
                      <td className="px-4 py-3">
                        Dr. {appt.doctor_first_name} {appt.doctor_last_name}
                      </td>
                    )}
                    <td className="px-4 py-3">{new Date(appt.appointment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{appt.appointment_time}</td>
                    <td className="px-4 py-3 capitalize">{appt.appointment_type}</td>
                    <td className="px-4 py-3">
                      {/* ✅ REPLACED SELECT WITH HEADLESS UI LISTBOX */}
                      {(role === "doctor" || role === "admin") ? (
                        <Listbox
                          value={appt.status}
                          onChange={(newStatus) => handleStatusChange(appt.appointment_id, newStatus)}
                        >
                          <div className="relative">
                            <ListboxButton className="flex justify-between items-center border border-gray-300 rounded-md shadow-sm py-1 pl-2 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-32 capitalize">
                              <span>{appt.status}</span>
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            </ListboxButton>
                            <ListboxOptions className="absolute mt-1 w-32 bg-white shadow-lg rounded-md z-20 text-xs border border-gray-200 max-h-60 overflow-auto">
                              {appointmentStatuses.map((status) => (
                                <ListboxOption
                                  key={status}
                                  value={status}
                                  className={({ active }) =>
                                    `cursor-pointer select-none px-3 py-1 ${
                                      active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-700'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <div className="flex justify-between items-center">
                                      <span className="capitalize">{status}</span>
                                      {selected && <Check className="w-4 h-4 text-indigo-600" />}
                                    </div>
                                  )}
                                </ListboxOption>
                              ))}
                            </ListboxOptions>
                          </div>
                        </Listbox>
                      ) : (
                        <span className="capitalize">{appt.status}</span>
                      )}
                    </td>
                    {(role === "admin" || role === "doctor") && (
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(appt.appointment_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    )}
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