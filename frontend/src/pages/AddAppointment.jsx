import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; // Import icons

const AddAppointment = () => {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: "",
    doctor_id: "",
    appointment_date: "",
    appointment_time: "", // Initialize as empty string
    duration_minutes: "",
    appointment_type: "",
    status: "",
    reason_for_visit: "",
    notes: "",
  });

  // Get the user's role
  const role = localStorage.getItem("role"); // Ensure role is correctly set in local storage
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [patientRes, doctorRes] = await Promise.all([
          axiosInstance.get("/patients"),
          axiosInstance.get("/doctors"),
        ]);
        setPatients(patientRes.data);
        setDoctors(doctorRes.data);
      } catch (error) {
        toast.error("Failed to load patients or doctors");
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
  const { name, value } = e.target;
  const newValue = (name === "patient_id" || name === "doctor_id")
    ? Number(value)
    : value;

  setFormData((prev) => ({
    ...prev,
    [name]: newValue,
  }));

  if (name === "doctor_id") {
    const selectedDoctor = doctors.find(d => d.doctor_id === Number(value));
    if (selectedDoctor) {
      const slots = generateTimeSlotsFromAvailability(selectedDoctor.available_from, selectedDoctor.available_to);
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  }
};

const generateTimeSlotsFromAvailability = (from, to) => {
  if (!from || !to) return [];

  const slots = [];
  let start = new Date(`1970-01-01T${from}`);
  const end = new Date(`1970-01-01T${to}`);

  while (start < end) {
    const next = new Date(start.getTime() + 30 * 60000); // 30 mins
    if (next > end) break;

    const format = (date) => date.toTimeString().split(' ')[0]; // "HH:MM:SS"
    const slot = `${format(start)} - ${format(next)}`;
    slots.push(slot);
    start = next;
  }
  return slots;
};



  // Handler for Headless UI Listbox (appointment_time)
  const handleTimeSlotChange = (selectedTime) => {
    setFormData((prev) => ({
      ...prev,
      appointment_time: selectedTime,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic role check (consider more robust auth in a real app)
    if (role !== "admin" && role !== "doctor") {
      toast.error("You are not authorized to add appointments.");
      return;
    }

    const preparedData = {
      ...formData,
      patient_id: Number(formData.patient_id),
      doctor_id: Number(formData.doctor_id),
      duration_minutes: Number(formData.duration_minutes),
    };

    console.log("Submitting prepared:", preparedData);

    try {
      await axiosInstance.post("/appointments", preparedData);
      toast.success("Appointment added successfully");
      navigate("/appointments");
    } catch (error) {
      console.error("Error response:", error.response);
      toast.error(error.response?.data?.message || "Failed to add appointment");
    }
  };


  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Add Appointment</h2>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 border rounded-xl shadow-md"
      >
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
        <select
          name="doctor_id"
          value={formData.doctor_id}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
          required
        >
          <option value="">Select Doctor</option>
          {doctors.map((d) => (
            <option key={d.doctor_id} value={d.doctor_id}> {/* Corrected value to d.doctor_id */}
              Dr. {d.first_name} {d.last_name}
            </option>
          ))}
        </select>

        {/* Appointment Date Input with Label */}
        <div className="relative">
          <label
            htmlFor="appointment_date"
            className="absolute -top-2 left-3 px-1 text-xs text-gray-600 bg-white"
          >
            Appointment Date
          </label>
          <input
            id="appointment_date"
            type="date"
            name="appointment_date"
            value={formData.appointment_date}
            onChange={handleChange}
            className="border px-3 py-2 rounded w-full pt-4"
            required
          />
        </div>

        {/* TIME SLOT SELECTION USING HEADLESS UI LISTBOX */}
        <Listbox value={formData.appointment_time} onChange={handleTimeSlotChange} required>
          {({ open }) => (
            <div className="relative z-10"> {/* Added z-10 for Listbox to appear above other elements */}
              <ListboxButton className="relative w-full cursor-default rounded border bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm">
                <span className="block truncate">
                  {formData.appointment_time || "Select time slot"}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </span>
              </ListboxButton>

              <ListboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {/* Optional "Select time slot" option, often disabled */}
                <ListboxOption
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-purple-100 text-purple-900' : 'text-gray-900'
                    }`
                  }
                  value="" // Represents no selection
                  disabled={true} // Makes it unselectable
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        Select time slot
                      </span>
                    </>
                  )}
                </ListboxOption>

                {timeSlots.map((slot) => (
                  <ListboxOption
                    key={slot}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? 'bg-purple-100 text-purple-900' : 'text-gray-900'
                      }`
                    }
                    value={slot}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? 'font-medium' : 'font-normal'
                          }`}
                        >
                          {slot}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-600">
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          )}
        </Listbox>
        {/* END TIME SLOT SELECTION */}


        {/* <input
          type="number"
          name="duration_minutes"
          placeholder="Duration (minutes)"
          value={formData.duration_minutes}
          onChange={handleChange}
          onWheel={(e) => e.target.blur()}
          className="border px-3 py-2 rounded"
          required
        /> */}

        {/* Appointment Type Select */}
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

        {/* Status Select */}
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

        <input
          type="text"
          name="reason_for_visit"
          placeholder="Reason for Visit"
          value={formData.reason_for_visit}
          onChange={handleChange}
          className="border px-3 py-2 rounded"
        />

        <textarea
          name="notes"
          placeholder="Notes"
          value={formData.notes}
          onChange={handleChange}
          className="border px-3 py-2 rounded sm:col-span-2"
          rows={3}
        />

        {/* Conditionally render button based on role */}
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