import { useEffect, useState } from 'react';
import { axiosInstance } from '../lib/axios';
import { User } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axiosInstance.get('/patients');
        setPatients(res.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  return (
    <div className="p-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <User className="text-purple-600" size={24} />
          Patients
        </h1>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 font-medium">Total Patients</p>
          <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-600">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="text-center text-gray-500">No patients found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">Patient #</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">DOB</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Insurance</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patient_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{patient.patient_number}</td>
                  <td className="px-4 py-3">
                    {patient.first_name} {patient.last_name}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(patient.date_of_birth).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3">{patient.gender}</td>
                  <td className="px-4 py-3">{patient.phone}</td>
                  <td className="px-4 py-3">{patient.email}</td>
                  <td className="px-4 py-3">{patient.insurance_provider}</td>
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