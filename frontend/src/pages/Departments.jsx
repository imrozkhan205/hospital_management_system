import { useEffect, useState } from "react";
import { Plus, Trash2, Folder, X } from "lucide-react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [department_name, setDepartmentName] = useState("");
  const [head_doctor_id, setHeadDoctorId] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/departments");
      setDepartments(res.data);
    } catch (err) {
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!department_name) return toast.error("Department name is required");

    try {
      await axiosInstance.post("/departments", {
        department_name,
        head_doctor_id: head_doctor_id || null,
        location: location || null,
        phone: phone || null,
      });
      toast.success("Department created");
      setDepartmentName("");
      setHeadDoctorId("");
      setLocation("");
      setPhone("");
      setShowForm(false);
      fetchDepartments();
    } catch (err) {
      toast.error("Error creating department");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await axiosInstance.delete(`/departments/${id}`);
      toast.success("Department deleted");
      setDepartments(departments.filter((d) => d.department_id !== id));
    } catch (err) {
      toast.error("Error deleting department");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Folder className="text-purple-600" size={24} />
          Departments
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded shadow"
        >
          {showForm ? (
            <>
              <X size={18} className="mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus size={18} className="mr-2" />
              Add Department
            </>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Department Name"
              value={department_name}
              onChange={(e) => setDepartmentName(e.target.value)}
              className="border px-4 py-2 rounded w-full"
              required
            />
            <input
              type="number"
              placeholder="Head Doctor ID (optional)"
              value={head_doctor_id}
              onChange={(e) => setHeadDoctorId(e.target.value)}
              onWheel={(e) => e.target.blur()}
              className="border px-4 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
            <input
              type="text"
              placeholder="Phone (optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border px-4 py-2 rounded w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Save Department
          </button>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="text-center text-gray-600">Loading departments...</div>
      ) : departments.length === 0 ? (
        <div className="text-center text-gray-500">No departments found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Head Doctor ID</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.department_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{dept.department_id}</td>
                  <td className="px-4 py-3">{dept.department_name}</td>
                  <td className="px-4 py-3">{dept.head_doctor_id || "—"}</td>
                  <td className="px-4 py-3">{dept.location || "—"}</td>
                  <td className="px-4 py-3">{dept.phone || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(dept.department_id)}
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

export default Departments;
