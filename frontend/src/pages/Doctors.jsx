// src/pages/Doctors.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Trash2, UserPlus, Stethoscope, Users } from "lucide-react"; 
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Doctors = ({ authUser }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let res;
      if (authUser?.role === "admin") {
        // Admin: Fetch all doctors
        res = await axiosInstance.get("/api/doctors");
      } else if (authUser?.role === "patient") {
        if (authUser.id) {
          res = await axiosInstance.get(`/api/patients/${authUser.id}/doctors`);
        } else {
          setDoctors([]);
          setLoading(false);
          console.warn(
            "Doctors component: Patient ID not found for fetching associated doctors."
          );
          return;
        }
      } else {
        setDoctors([]);
        setLoading(false);
        toast.error(
          "Unauthorized access or invalid user role for doctor list."
        );
        console.warn(
          "Doctors component: Unexpected authUser role or missing authUser."
        );
        return;
      }
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this doctor? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/doctors/${id}`);
      toast.success("Doctor deleted successfully!");
      setDoctors(doctors.filter((doc) => doc.doctor_id !== id));
    } catch (err) {
      console.error("Error deleting doctor:", err);
      toast.error(err.response?.data?.message || "Failed to delete doctor.");
    }
  };

  useEffect(() => {
    if (authUser) {
      fetchDoctors();
    } else {
      setDoctors([]);
      setLoading(false);
    }
  }, [authUser]);

  const isPatient = authUser?.role === "patient";
  const isAdmin = authUser?.role === "admin";
  const isDoctor = authUser?.role === "doctor";

  return (
    <div className="p-6">
      {/* Header & Actions Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {isPatient ? (
            <Users className="text-purple-600" size={24} />
          ) : (
            <Stethoscope className="text-purple-600" size={24} />
          )}
          {isPatient ? "My Doctors" : "Doctors"}
        </h1>

        {/* Add Doctor button (only for admins) */}
        {isAdmin && (
          <button
            onClick={() => navigate("/doctors/add")}
            className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow"
          >
            <UserPlus className="mr-2" size={18} />
            Add Doctor
          </button>
        )}
      </div>

      {/* Summary Card Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 font-medium">
            {isPatient ? "My Connected Doctors" : "Total Doctors"}
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {doctors.length}
          </p>
        </div>
      </div>

      {/* Doctors Table Section */}
      {loading ? (
        <div className="text-center text-gray-600 py-8">
          Loading doctors...
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {isPatient
            ? "You currently have no appointments with any doctors, or no doctors are linked to your account."
            : "No doctors found in the system."}
        </div>
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
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr
                  key={doc.doctor_id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="px-4 py-3">{doc.doctor_id}</td>
                  <td className="px-4 py-3">
                    {doc.first_name} {doc.last_name}
                  </td>
                  <td className="px-4 py-3">{doc.email}</td>
                  <td className="px-4 py-3">{doc.phone}</td>
                  <td className="px-4 py-3">{doc.specialization}</td>
                  <td className="px-4 py-3">
                    {doc.experience_years || "N/A"}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.doctor_id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md transition-colors duration-200"
                        title="Delete Doctor"
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

export default Doctors;
