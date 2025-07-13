import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios.js";
import { FilePlus, FileText, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      const res = await axiosInstance.get("/medical-records");
      setRecords(res.data);
    } catch (error) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      await axiosInstance.delete(`/medical-records/${id}`);
      toast.success("Record deleted");
      setRecords(records.filter((r) => r.record_id !== id));
    } catch (error) {
      toast.error("Error deleting record");
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText size={24} className="text-purple-600" />
          Medical Records
        </h1>
        <Link
          to="/medical-records/add"
          className="flex items-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow w-full sm:w-auto justify-center"
        >
          <FilePlus size={18} className="mr-2" />
          Add Record
        </Link>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="text-center text-gray-600">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="text-center text-gray-500">No records found.</div>
      ) : (
        <>
          {/* TABLE VIEW: Only on sm and above */}
          <div className="hidden sm:block overflow-x-auto rounded-lg shadow">
            <table className="w-full min-w-[800px] text-sm text-left text-gray-700">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Record ID</th>
                  <th className="px-4 py-3">Patient Name</th>
                  <th className="px-4 py-3">Doctor Name</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Diagnosis</th>
                  <th className="px-4 py-3">Lab Results</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr
                    key={record.record_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{record.record_id}</td>
                    <td className="px-4 py-3">
                      {record.patient_first_name} {record.patient_last_name}
                    </td>
                    <td className="px-4 py-3">
                      {record.doctor_first_name} {record.doctor_last_name}
                    </td>
                    <td className="px-4 py-3">
                      {record.visit_date
                        ? new Date(record.visit_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">{record.diagnosis}</td>
                    <td className="px-4 py-3">{record.lab_results}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(record.record_id)}
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

          {/* CARD VIEW: Only on mobile */}
          <div className="block sm:hidden space-y-4">
            {records.map((record) => (
              <div
                key={record.record_id}
                className="bg-white border rounded-lg p-4 shadow-sm"
              >
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Record ID:</span>{" "}
                  {record.record_id}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Patient:</span>{" "}
                  {record.patient_first_name} {record.patient_last_name}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Doctor:</span>{" "}
                  {record.doctor_first_name} {record.doctor_last_name}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Date:</span>{" "}
                  {record.visit_date
                    ? new Date(record.visit_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Diagnosis:</span>{" "}
                  {record.diagnosis}
                </div>
                <div className="text-sm text-gray-700 mb-2">
                  <span className="font-medium">Lab Results:</span>{" "}
                  {record.lab_results}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(record.record_id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MedicalRecords;