import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { axiosInstance } from "../lib/axios.js";

const AppointmentAvailability = () => {
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlots, setTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);

  // Fetch doctor info (including available_from & available_to)
  useEffect(() => {
    const fetchDoctorInfo = async () => {
      try {
        const res = await axiosInstance.get(`/doctors/${doctorId}`);
        setDoctorInfo({
          name: `Dr. ${res.data.first_name} ${res.data.last_name}`,
          specialization: res.data.specialization,
          available_from: res.data.available_from,
          available_to: res.data.available_to,
        });
      } catch (error) {
        console.error("Error fetching doctor info:", error);
      }
    };
    fetchDoctorInfo();
  }, [doctorId]);

  // Generate time slots between available_from and available_to every 30 mins
  const generateTimeSlots = (from, to) => {
    const slots = [];
    const [fromHour, fromMinute] = from.split(":").map(Number);
    const [toHour, toMinute] = to.split(":").map(Number);

    let current = new Date();
    current.setHours(fromHour, fromMinute, 0, 0);

    const end = new Date();
    end.setHours(toHour, toMinute, 0, 0);

    while (current <= end) {
      slots.push(current.toTimeString().slice(0, 5)); // HH:MM
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  // Fetch appointments and update slot statuses
  useEffect(() => {
    if (!doctorInfo?.available_from || !doctorInfo?.available_to) return;

    const standardSlots = generateTimeSlots(
      doctorInfo.available_from,
      doctorInfo.available_to
    );

    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get(
          `/appointments/doctor/${doctorId}?date=${selectedDate}`
        );
        const appointments = Array.isArray(res.data) ? res.data : [];
        const bookedTimes = appointments.map((a) =>
          a.appointment_time.substring(0, 5)
        );

        const slots = standardSlots.map((time) => ({
          time,
          status: bookedTimes.includes(time) ? "booked" : "available",
        }));

        setTimeSlots(slots);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Failed to load appointment data. Please try again.");
        setTimeSlots(standardSlots.map((time) => ({ time, status: "available" })));
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [doctorId, selectedDate, doctorInfo]);

  // Book an appointment
  const handleBookAppointment = async (time) => {
  try {
    await axiosInstance.post(
      "/appointments/simple",
      {
        doctor_id: doctorId,
        date: selectedDate,
        time: time + ":00",
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    alert(`Appointment booked for ${time} on ${selectedDate}`);

    // Refresh appointments after booking
    const standardSlots = generateTimeSlots(
      doctorInfo.available_from,
      doctorInfo.available_to
    );
    const res = await axiosInstance.get(
      `/appointments/doctor/${doctorId}?date=${selectedDate}`
    );
    const appointments = Array.isArray(res.data) ? res.data : [];
    const bookedTimes = appointments.map((a) =>
      a.appointment_time.substring(0, 5)
    );
    setTimeSlots(
      standardSlots.map((t) => ({
        time: t,
        status: bookedTimes.includes(t) ? "booked" : "available",
      }))
    );
  } catch (error) {
    console.error("Booking failed:", error);
    alert(error.response?.data?.message || "Failed to book appointment");
  }
};

  const availableCount = timeSlots.filter((s) => s.status === "available").length;
  const totalSlots = timeSlots.length;
  const isFullyBooked = availableCount === 0;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Appointment Availability
        </h1>
        <p className="text-gray-600">Check available time slots and book your appointment</p>
        {doctorInfo ? (
          <p className="font-bold text-gray-700 text-lg mt-2">
            {doctorInfo.name}
            {doctorInfo.specialization && (
              <span className="ml-2 text-gray-700">— {doctorInfo.specialization}</span>
            )}
          </p>
        ) : (
          <p className="text-gray-500 text-sm mt-1">Loading doctor information...</p>
        )}
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {formatDate(selectedDate)}
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">Available: <span className="font-semibold">{availableCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm">Booked: <span className="font-semibold">{totalSlots - availableCount}</span></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm">Total Slots: <span className="font-semibold">{totalSlots}</span></span>
          </div>
        </div>
        {isFullyBooked && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-800 font-medium">All appointments are fully booked for this date. Please select another date.</span>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Time Slots</h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading availability...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-200 rounded-md flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                onClick={() => slot.status === "available" && handleBookAppointment(slot.time)}
                className={`p-4 rounded-lg border-2 ${slot.status === "available"
                  ? "bg-green-100 text-green-800 border-green-200 hover:shadow-md cursor-pointer transform hover:scale-105"
                  : "bg-red-100 text-red-800 border-red-200 cursor-not-allowed"
                  }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">{slot.time}</span>
                  {slot.status === "available" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div className="text-sm capitalize font-medium">
                  {slot.status}
                  {slot.status === "available" && <div className="mt-1 text-xs opacity-75">Click to book</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm">Available Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm">Booked Slot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentAvailability;
