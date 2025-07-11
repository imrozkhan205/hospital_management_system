import { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { CalendarCheck, Users } from 'lucide-react';

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const doctorId = localStorage.getItem('linked_doctor_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apptRes, patientsRes] = await Promise.all([
          axiosInstance.get(`/doctors/${doctorId}/appointments`),
          axiosInstance.get(`/doctors/${doctorId}/patients`),
        ]);
        setAppointments(apptRes.data);
        setPatients(patientsRes.data);
      } catch (err) {
        console.error('Error fetching doctor data', err);
      } finally {
        setLoading(false);
      }
    };
    if (doctorId) fetchData();
  }, [doctorId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
        <CalendarCheck className="text-purple-600" /> Doctor Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 font-medium">My Appointments</p>
          <p className="text-3xl font-bold text-purple-600">{appointments.length}</p>
        </div>
        <div className="bg-white border rounded-xl shadow p-6 text-center">
          <p className="text-gray-500 font-medium">My Patients</p>
          <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
        </div>
      </div>

      {/* Appointments Table */}
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <CalendarCheck size={18} className="text-purple-600" /> My Appointments
      </h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="text-gray-500">No appointments found.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow mb-8">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.appointment_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{a.appointment_date}</td>
                  <td className="px-4 py-2">{a.appointment_time}</td>
                  <td className="px-4 py-2">{a.patient_id}</td>
                  <td className="px-4 py-2 capitalize">{a.appointment_type}</td>
                  <td className="px-4 py-2 capitalize">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Patients Table */}
      <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
        <Users size={18} className="text-purple-600" /> My Patients
      </h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : patients.length === 0 ? (
        <div className="text-gray-500">No patients found.</div>
      ) : (
        <div className="overflow-x-auto rounded shadow">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.patient_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.patient_id}</td>
                  <td className="px-4 py-2">{p.first_name} {p.last_name}</td>
                  <td className="px-4 py-2">{p.phone}</td>
                  <td className="px-4 py-2">{p.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
