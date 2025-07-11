import { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { User, UserPlus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');
  const doctorId = localStorage.getItem('doctorId');

  const fetchPatients = async () => {
    try {
      let res;
      if (role === 'doctor' && doctorId) {
        res = await axiosInstance.get(`/doctors/${doctorId}/patients`);
      } else {
        res = await axiosInstance.get('/patients');
      }
      setPatients(res.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    try {
      await axiosInstance.delete(`/patients/${id}`);
      toast.success('Patient deleted');
      setPatients((prev) => prev.filter((p) => p.patient_id !== id));
    } catch (err) {
      toast.error('Failed to delete patient');
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-purple-600" size={24} />
          Patients
        </h1>
        <Link
          to="/patients/add"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow"
        >
          <UserPlus className="mr-2" size={18} />
          Add Patient
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-600">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="text-center text-gray-500">No patients found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Insurance</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patient_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{patient.patient_id}</td>
                  <td className="px-4 py-3">{patient.first_name} {patient.last_name}</td>
                  <td className="px-4 py-3">
                    {new Date(patient.date_of_birth).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">{patient.gender}</td>
                  <td className="px-4 py-3">{patient.phone}</td>
                  <td className="px-4 py-3">{patient.email}</td>
                  <td className="px-4 py-3">{patient.insurance_provider}</td>
                  <td className="px-4 py-3">{patient.latest_diagnosis || 'N/A'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(patient.patient_id)}
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

export default Patients;
