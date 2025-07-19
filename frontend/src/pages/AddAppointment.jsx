import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';

const AddAppointment = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "",
    duration_minutes: "",
    appointment_type: "",
    status: "",
    reason_for_visit: "",
    notes: "",
  });

  // Fetch patients & doctors based on role
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (role === "admin") {
          const [patientRes, doctorRes] = await Promise.all([
            axiosInstance.get("/patients"),
            axiosInstance.get("/doctors"),
          ]);
          setPatients(patientRes.data);
          setDoctors(doctorRes.data);
        } else if (role === "doctor") {
          const doctorId = Number(localStorage.getItem("linked_doctor_id"));
          setFormData((prev) => ({ ...prev, doctor_id: doctorId })); // set own doctor_id
          const [patientRes, doctorRes] = await Promise.all([
            axiosInstance.get(`/doctors/${doctorId}/patients`),
            axiosInstance.get(`/doctors/${doctorId}`), // get doctor details
          ]);
          setPatients(patientRes.data);
          setDoctors([doctorRes.data]); // put single doctor in array for consistency
        }
      } catch (error) {
        toast.error("Failed to load patients or doctors");
      }
    };
    fetchData();
  }, [role]);

  // Generate time slots when doctor_id and date are selected
  useEffect(() => {
    const selectedDoctor = doctors.find(d => d.doctor_id === Number(formData.doctor_id));
    if (selectedDoctor && formData.appointment_date) {
      const slots = generateTimeSlotsFromAvailability(
        selectedDoctor.available_from,
        selectedDoctor.available_to
      );
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  }, [formData.doctor_id, formData.appointment_date, doctors]);

  // Generate slots: e.g., every 30 min
  const generateTimeSlotsFromAvailability = (from, to) => {
    if (!from || !to) return [];
    const slots = [];
    let start = new Date(`1970-01-01T${from}`);
    const end = new Date(`1970-01-01T${to}`);
    while (start < end) {
      const next = new Date(start.getTime() + 30 * 60000); // 30 minutes
      if (next > end) break;
      const format = (date) => date.toTimeString().split(' ')[0]; // HH:MM:SS
      slots.push(`${format(start)} - ${format(next)}`);
      start = next;
    }
    return slots;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = (name === "patient_id" || name === "doctor_id")
      ? Number(value)
      : value;
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

const handleTimeSlotChange = (selectedTime) => {
  const startTime = selectedTime.split(' - ')[0];  
  setFormData((prev) => ({
    ...prev,
    appointment_time: startTime,
  }));
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== "admin" && role !== "doctor") {
      toast.error("You are not authorized to add appointments.");
      return;
    }

    try {
      const preparedData = {
        ...formData,
        patient_id: Number(formData.patient_id),
        doctor_id: Number(formData.doctor_id),
        duration_minutes: Number(formData.duration_minutes) || 30, // default if empty
      };
      await axiosInstance.post("/appointments", preparedData);
      toast.success("Appointment added successfully");
      navigate("/appointments");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add appointment");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Appointment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border rounded-xl shadow-md">

        {/* Patient Select */}
        <select
          name="patient_id"
          value={formData.patient_id}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Patient</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>

        {/* Doctor Select */}
        {role === "admin" && (
          <select
            name="doctor_id"
            value={formData.doctor_id}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
            required
          >
            <option value="">Select Doctor</option>
            {doctors.map((d) => (
              <option key={d.doctor_id} value={d.doctor_id}>
                Dr. {d.first_name} {d.last_name}
              </option>
            ))}
          </select>
        )}

        {role === "doctor" && (
          <input
            type="hidden"
            name="doctor_id"
            value={formData.doctor_id}
          />
        )}

        {/* Date */}
        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        />

        {/* Time Slot (Listbox) */}
        <Listbox value={formData.appointment_time} onChange={handleTimeSlotChange}>
          <div className="relative">
            <ListboxButton className="relative w-full cursor-default rounded border bg-white py-2 pl-3 pr-10 text-left shadow-sm">
              <span className="block truncate">{formData.appointment_time || "Select time slot"}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </ListboxButton>
            <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {timeSlots.map((slot) => (
                <ListboxOption
                  key={slot}
                  value={slot}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-purple-100 text-purple-900' : 'text-gray-900'
                    }`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {slot}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </ListboxOption>
              ))}
            </ListboxOptions>
          </div>
        </Listbox>

        {/* Appointment Type */}
        <select
          name="appointment_type"
          value={formData.appointment_type}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Type</option>
          <option value="consultation">Consultation</option>
          <option value="follow_up">Follow-up</option>
          <option value="emergency">Emergency</option>
          <option value="routine_checkup">Routine Checkup</option>
        </select>

        {/* Status */}
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Reason for visit */}
        <input
          type="text"
          name="reason_for_visit"
          placeholder="Reason for Visit"
          value={formData.reason_for_visit}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />

        {/* Notes */}
        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          className="border px-3 py-2 rounded sm:col-span-2"
          rows={3}
        />

        {/* Submit button */}
        {(role === "admin" || role === "doctor") && (
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
            >
              Add Appointment
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default AddAppointment;
