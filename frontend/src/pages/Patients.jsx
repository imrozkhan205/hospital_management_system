import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { User, UserPlus, Trash2, Upload, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attachmentsMap, setAttachmentsMap] = useState({});
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const role = localStorage.getItem("role");

  const fetchPatients = async () => {
    try {
      let res;
      if (role === "doctor") {
        const doctorId = localStorage.getItem("linked_doctor_id");
        res = await axiosInstance.get(`/api/doctors/${doctorId}/patients`);
      } else {
        res = await axiosInstance.get("/api/patients");
      }

      setPatients(res.data);

      // fetch attachments for each patient
      const attachmentsObj = {};
      await Promise.all(
        res.data.map(async (patient) => {
          try {
            const attachRes = await axiosInstance.get(
              `/api/patients/${patient.patient_id}/attachments`
            );
            attachmentsObj[patient.patient_id] = attachRes.data;
          } catch (err) {
            attachmentsObj[patient.patient_id] = [];
          }
        })
      );
      setAttachmentsMap(attachmentsObj);
    } catch (error) {
      toast.error("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;
    try {
      await axiosInstance.delete(`/api/patients/${id}`);
      toast.success("Patient deleted");
      setPatients((prev) => prev.filter((p) => p.patient_id !== id));
    } catch (err) {
      toast.error("Failed to delete patient");
    }
  };

  // console.log('attachmentsMap', attachmentsMap);

  // Upload attachment
  const handleUploadAttachment = async (patientId, file) => {
    if (!file) return toast.error("No file selected");
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axiosInstance.post(`/api/patients/${patientId}/attachment`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Attachment uploaded");
      fetchPatients(); // refresh list to get new attachment_url
    } catch (error) {
      toast.error("Failed to upload attachment");
    }
  };

  // View attachment
  const handleViewAttachment = (url) => {
    setSelectedPdfUrl(url);
  };

  // Delete attachment
  const handleDeleteAttachment = async (patientId, attachmentId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    
    try {
      await axiosInstance.delete(`/api/patients/${patientId}/attachments/${attachmentId}`);
      toast.success("Attachment deleted");
      fetchPatients(); // refresh the list
    } catch (error) {
      toast.error("Failed to delete attachment");
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

      {loading ? (
        <div className="text-center text-gray-600">Loading patients...</div>
      ) : patients.length === 0 ? (
        <div className="text-center text-gray-500">No patients found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Attachments</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.patient_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{p.patient_id}</td>
                  <td className="px-4 py-3">
                    {p.first_name} {p.last_name}
                  </td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">{p.phone}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      {/* Upload Button */}
                      {(role === "doctor" || role === "admin") && (
                        <label className="flex items-center gap-1 cursor-pointer text-indigo-600 hover:text-indigo-800 w-fit">
                          <Upload size={16} />
                          <span className="text-xs">Upload</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={(e) =>
                              handleUploadAttachment(
                                p.patient_id,
                                e.target.files[0]
                              )
                            }
                            className="hidden"
                          />
                        </label>
                      )}
                      
                      {/* Attachments List */}
                      {attachmentsMap[p.patient_id]?.length > 0 && (
                        <div className="flex flex-col gap-1">
                          {attachmentsMap[p.patient_id].map((a, index) => (
                            <div 
                              key={a.attachment_id} 
                              className="flex items-center gap-2 bg-gray-50 p-2 rounded text-xs"
                            >
                              {/* View Button */}
                             <div className="flex items-center gap-2">
  {/* View button */}
  <button
    onClick={() => handleViewAttachment(a.file_path)}
    className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
    title={`View attachment ${a.attachment_id}`}
  >
    <FileText size={14} />
    <span>View</span>
  </button>

  {/* Download button */}
  <a
    href={a.file_path}
    download={a.file_path || `patient_${p.patient_id}_attachment.pdf`}
    className="text-green-500 hover:text-green-700 flex items-center gap-1"
    title="Download PDF"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 11-2 0V5H5v7h4a1 1 0 110 2H4a1 1 0 01-1-1V4zm7 11a1 1 0 011-1h1v-3a1 1 0 112 0v3h1a1 1 0 110 2h-4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
    <span>Download</span>
  </a>
</div>

                              
                              {/* Delete Button */}
                              {(role === "doctor" || role === "admin") && (
                                <button
                                  onClick={() => handleDeleteAttachment(p.patient_id, a.attachment_id)}
                                  className="text-red-500 hover:text-red-700 ml-auto"
                                  title="Delete attachment"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* No attachments message */}
                      {(!attachmentsMap[p.patient_id] || attachmentsMap[p.patient_id].length === 0) && (
                        <span className="text-gray-400 text-xs">No attachments</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {(role === "doctor" || role === "admin") && (
                      <button
                        onClick={() => handleDelete(p.patient_id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete patient"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PDF Preview Modal */}
      {selectedPdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">PDF Preview</h2>
              <button
                onClick={() => setSelectedPdfUrl(null)}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                Close
              </button>
            </div>
            <div className="p-4">
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <div style={{ height: '600px' }}>
                  <Viewer fileUrl={selectedPdfUrl} />
                </div>
              </Worker>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;