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
      <div className="flex items-center mb-6">
        <User className="text-purple-600 mr-2" size={26} />
        <h1 className="text-2xl font-semibold text-gray-800">Patients</h1>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-lg font-medium text-gray-500">Total Patients</p>
          <p className="text-3xl font-bold text-purple-600">{patients.length}</p>
        </div>
        {/* Add more cards if needed */}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100 text-left">
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
              <tr key={patient.patient_id} className="border-t hover:bg-gray-50">
  <td className="px-4 py-2">{patient.patient_number}</td>
  <td className="px-4 py-2">{patient.first_name} {patient.last_name}</td>
  <td className="px-4 py-2">
    {new Date(patient.date_of_birth).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })}
  </td>
  <td className="px-4 py-2">{patient.gender}</td>
  <td className="px-4 py-2">{patient.phone}</td>
  <td className="px-4 py-2">{patient.email}</td>
  <td className="px-4 py-2">{patient.insurance_provider}</td>
</tr>

            ))}
          </tbody>
        </table>

        {patients.length === 0 && !loading && (
          <p className="text-center p-4 text-gray-500">No patients found.</p>
        )}
      </div>
    </div>
  );
};

export default Patients;
