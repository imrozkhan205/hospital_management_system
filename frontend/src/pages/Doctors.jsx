import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Trash2, UserPlus, Stethoscope } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await axiosInstance.get("/doctors");
      setDoctors(res.data);
    } catch (err) {
      toast.error("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      await axiosInstance.delete(`/doctors/${id}`);
      toast.success("Doctor deleted");
      setDoctors(doctors.filter((doc) => doc.doctor_id !== id));
    } catch (err) {
      toast.error("Failed to delete doctor");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="p-6">
      {/* Header & Actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Stethoscope className="text-purple-600" size={24} />
          Doctors
        </h1>
        <Link to='/doctors/add' className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
        <UserPlus className="mr-2" size={18} />
        Add doctor
        </Link>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 font-medium">Total Doctors</p>
          <p className="text-3xl font-bold text-purple-600">{doctors.length}</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-600">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center text-gray-500">No doctors found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Experience (yrs)</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.doctor_id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">{doc.doctor_id}</td>
                  {/* <td className="px-4 py-3">{doc.employee_id}</td> */}
                  <td className="px-4 py-3">
                    {doc.first_name} {doc.last_name}
                  </td>
                  <td className="px-4 py-3">{doc.email}</td>
                  <td className="px-4 py-3">{doc.phone}</td>
                  <td className="px-4 py-3">{doc.specialization}</td>
                  <td className="px-4 py-3">{doc.experience_years}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(doc.doctor_id)}
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

export default Doctors;
