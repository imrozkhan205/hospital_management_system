// src/pages/Doctors.jsx
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Trash2, UserPlus, Stethoscope, Users } from "lucide-react"; 
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const Doctors = ({ authUser }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      let res;
      if (authUser?.role === 'admin') {
        // Admin: Fetch all doctors
        res = await axiosInstance.get("/doctors");
      } else if (authUser?.role === 'patient') {
        if (authUser.id) { 
          res = await axiosInstance.get(`/patients/${authUser.id}/doctors`);
        } else {
          setDoctors([]); // Set doctors to empty
          setLoading(false); // Stop loading
          console.warn("Doctors component: Patient ID not found for fetching associated doctors.");
          return; // Exit the function
        }
      } else {
        setDoctors([]); // No doctors to display
        setLoading(false); // Stop loading
        toast.error("Unauthorized access or invalid user role for doctor list.");
        console.warn("Doctors component: Unexpected authUser role or missing authUser.");
        return; // Exit the function
      }
      setDoctors(res.data); // Update state with fetched doctors
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
      setDoctors([]); // Clear doctors on error to prevent displaying stale data
    } finally {
      setLoading(false); // Always set loading to false when fetch operation completes
    }
  };

  const handleDelete = async (id) => {
    // Confirmation dialog before deletion
    if (!window.confirm("Are you sure you want to delete this doctor? This action cannot be undone.")) {
      return; 
    }

    try {
      await axiosInstance.delete(`/doctors/${id}`);
      toast.success("Doctor deleted successfully!");
      // Optimistically update the UI by filtering out the deleted doctor
      setDoctors(doctors.filter((doc) => doc.doctor_id !== id));
    } catch (err) {
      console.error("Error deleting doctor:", err);
      // Display a specific error message if available, otherwise a generic one
      toast.error(err.response?.data?.message || "Failed to delete doctor.");
    }
  };

  // useEffect hook to fetch doctors when the component mounts or authUser changes
  useEffect(() => {
    if (authUser) {
      fetchDoctors();
    } else {
      // If no user is authenticated, clear doctors and stop loading
      setDoctors([]);
      setLoading(false);
    }
  }, [authUser]); // Dependency array: re-run useEffect when authUser changes

  // Helper flags for conditional rendering based on role
  const isPatient = authUser?.role === 'patient';
  const isAdmin = authUser?.role === 'admin';
  const isDoctor = authUser?.role === 'doctor';

  return (
    <div className="p-6">
      {/* Header & Actions Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          {/* Dynamically change icon and title based on user role */}
          {isPatient ? (
            <Users className="text-purple-600" size={24} /> // Icon for patient's doctors
          ) : (
            <Stethoscope className="text-purple-600" size={24} /> // Icon for general doctors (admin)
          )}
          {/* Dynamically change heading text */}
          {isPatient ? "My Doctors" : "Doctors"}
        </h1>
        {/* "Add doctor" button visible only to admins */}
        {isAdmin || isDoctor && (
          <Link to='/doctors/add' className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow">
            <UserPlus className="mr-2" size={18} />
            Add doctor
          </Link>
        )}
      </div>

      {/* Summary Card Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border rounded-xl shadow-sm p-6 text-center">
          {/* Dynamically change card title */}
          <p className="text-gray-500 font-medium">{isPatient ? "My Connected Doctors" : "Total Doctors"}</p>
          {/* Display the count of doctors */}
          <p className="text-3xl font-bold text-purple-600">{doctors.length}</p>
        </div>
      </div>

      {/* Doctors Table Section */}
      {loading ? (
        <div className="text-center text-gray-600 py-8">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          {/* Dynamically change no data message */}
          {isPatient ? "You currently have no appointments with any doctors, or no doctors are linked to your account." : "No doctors found in the system."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr><th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Experience (yrs)</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}</tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc.doctor_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{doc.doctor_id}</td>
                  <td className="px-4 py-3">
                    {doc.first_name} {doc.last_name}
                  </td>
                  <td className="px-4 py-3">{doc.email}</td>
                  <td className="px-4 py-3">{doc.phone}</td>
                  <td className="px-4 py-3">{doc.specialization}</td>
                  {doc.experience_years ? ( <td className="px-4 py-3">{doc.experience_years}</td>) : (<p className="px-4 py-3">N/A</p>)}
                  {isAdmin && ( // Delete button visible only to admins
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