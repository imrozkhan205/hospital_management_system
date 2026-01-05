import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { Stethoscope, ChevronDown, Check } from "lucide-react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { Link } from "react-router-dom";

const AllDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [patientDocuments, setPatientDocuments] = useState([]);

  const patientId = localStorage.getItem('linked_patient_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resDoctors = await axiosInstance.get("/api/doctors");
        setDoctors(resDoctors.data);
        setFilteredDoctors(resDoctors.data);

        // Fetch patient documents
        const resDocs = await axiosInstance.get(`/api/patients/${patientId}/attachments`);
        setPatientDocuments(resDocs.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId]);

  // Handle filter change
  useEffect(() => {
    if (!specializationFilter) {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(
        doctors.filter(
          (doc) =>
            doc.specialization.toLowerCase() === specializationFilter.toLowerCase()
        )
      );
    }
  }, [specializationFilter, doctors]);

  const uniqueSpecializations = Array.from(
    new Set(doctors.map((doc) => doc.specialization))
  );

  const handleSpecializationChange = (specialization) => {
    setSpecializationFilter(specialization);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 mb-6">
        <Stethoscope className="text-purple-600" />
        Doctors for your service
      </h1>

      {/* Filter dropdown */}
      <div className="mb-4 flex items-center gap-2">
        <label className="font-medium text-gray-700">Filter by specialization:</label>
        <Menu as="div" className="relative inline-block text-left">
          <MenuButton className="inline-flex items-center justify-between min-w-[180px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
            {specializationFilter || "All Specializations"}
            <ChevronDown className="ml-2 h-4 w-4" />
          </MenuButton>
          <MenuItems className="mt-1 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            <div className="py-1">
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={() => handleSpecializationChange("")}
                    className={`${focus ? "bg-gray-100 text-gray-900" : "text-gray-700"}
                      group flex w-full items-center px-4 py-2 text-sm justify-between`}
                  >
                    All Specializations
                    {!specializationFilter && <Check className="h-4 w-4 text-indigo-600" />}
                  </button>
                )}
              </MenuItem>
              {uniqueSpecializations.map((spec) => (
                <MenuItem key={spec}>
                  {({ focus }) => (
                    <button
                      onClick={() => handleSpecializationChange(spec)}
                      className={`${focus ? "bg-gray-100 text-gray-900" : "text-gray-700"}
                        group flex w-full items-center px-4 py-2 text-sm justify-between`}
                    >
                      {spec}
                      {specializationFilter === spec && <Check className="h-4 w-4 text-indigo-600" />}
                    </button>
                  )}
                </MenuItem>
              ))}
            </div>
          </MenuItems>
        </Menu>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading doctors...</p>
      ) : filteredDoctors.length === 0 ? (
        <p className="text-center text-gray-500">No doctors found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow mb-6">
          <table className="w-full table-auto text-sm text-left text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Specialization</th>
                <th className="px-4 py-3">Experience (yrs)</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.map((doc) => (
                <tr key={doc.doctor_id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{doc.doctor_id}</td>
                  <td className="px-4 py-3">
                    <Link to={`/book-appointment/${doc.doctor_id}`} className="underline hover:text-purple-700">
                      {doc.first_name} {doc.last_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{doc.email}</td>
                  <td className="px-4 py-3">{doc.phone}</td>
                  <td className="px-4 py-3">{doc.specialization}</td>
                  <td className="px-4 py-3">{doc.experience_years !== null ? doc.experience_years : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Show patient documents below doctors table */}
<h2 className="text-lg font-semibold mt-6 mb-2">Your Documents</h2>
{patientDocuments.length === 0 ? (
  <p className="text-gray-500">No documents found.</p>
) : (
  <ul className="list-disc pl-5 text-purple-700">
    {patientDocuments.map((doc) => (
      <li key={doc.attachment_id}>
        <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="hover:underline">
          {doc.file_name || `Document ${doc.attachment_id}`}
        </a>
        {doc.doctor_first_name && (
          <span className="ml-2 text-gray-500 text-sm">
            (Uploaded by Dr. {doc.doctor_first_name} {doc.doctor_last_name})
          </span>
        )}
      </li>
    ))}
  </ul>
)}

    </div>
  );
};

export default AllDoctors;
