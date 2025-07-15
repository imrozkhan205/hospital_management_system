import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
} from "lucide-react";
import { axiosInstance } from "../lib/axios.js";

const AppointmentAvailability = () => {
  const { doctorId } = useParams();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [timeSlots, setTimeSlots] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState(null);

useEffect(() => {
  const fetchDoctorInfo = async () => {
    try {
      const res = await axiosInstance.get(`/doctors/${doctorId}`);

      setDoctorInfo({
        name: `Dr. ${res.data.first_name} ${res.data.last_name}`,
        specialization: res.data.specialization
      });
    } catch (error) {
      console.error('Error fetching doctor info:', error);
    }
  };
  fetchDoctorInfo();
}, [doctorId]);


  // Standard time slots (you can modify these as needed)
  const standardSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all appointments for this doctor on the selected date
        const response = await axiosInstance.get(
          `/appointments/doctor/${doctorId}?date=${selectedDate}`
        );

        // Ensure we have an array of appointments
        const appointments = Array.isArray(response.data) ? response.data : [];
        setBookedAppointments(appointments);

        // Generate time slots with status
        const bookedTimes = appointments.map(
          (appt) => appt.appointment_time.substring(0, 5) // Extract HH:MM format
        );

        const slotsWithStatus = standardSlots.map((time) => ({
          time,
          status: bookedTimes.includes(time) ? "booked" : "available",
        }));

        setTimeSlots(slotsWithStatus);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointment data. Please try again.");
        setTimeSlots(
          standardSlots.map((time) => ({ time, status: "available" }))
        );
        setBookedAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorId, selectedDate]);

  const handleBookAppointment = async (time) => {
    try {
      await axiosInstance.post(
        "/appointments",
        {
          doctorId,
          date: selectedDate,
          time: time + ":00", // Convert to full time format
          status: "Scheduled",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Refresh the appointments after booking
      const response = await axiosInstance.get(
        `/appointments/doctor/${doctorId}?date=${selectedDate}`
      );
      const appointments = Array.isArray(response.data) ? response.data : [];
      setBookedAppointments(appointments);

      // Update time slots status
      const bookedTimes = appointments.map((appt) =>
        appt.appointment_time.substring(0, 5)
      );

      setTimeSlots(
        standardSlots.map((time) => ({
          time,
          status: bookedTimes.includes(time) ? "booked" : "available",
        }))
      );

      alert(`Appointment booked for ${time} on ${selectedDate}`);
    } catch (error) {
      console.error("Booking failed:", error);
      alert(error.response?.data?.message || "Failed to book appointment");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    return timeString.substring(0, 5); // Format as HH:MM
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "booked":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "booked":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const availableCount = timeSlots.filter(
    (slot) => slot.status === "available"
  ).length;
  const totalSlots = timeSlots.length;
  const isFullyBooked = availableCount === 0;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-blue-600" />
          Appointment Availability
        </h1>
        <p className="text-gray-600">
          Check available time slots and book your appointment
        </p>
        {doctorInfo ? (
  <p className="font-bold text-gray-700 text-lg ld mt-2">
    {doctorInfo.name}
    {doctorInfo.specialization && (
      <span className="ml-2 text-gray-700">— {doctorInfo.specialization}</span>
    )}
  </p>
) : (
  <p className="text-gray-500 text-sm mt-1">Loading doctor information...</p>
)}

      </div>

      {/* Date selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Availability summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {formatDate(selectedDate)}
        </h2>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">
              Available:{" "}
              <span className="font-semibold text-green-600">
                {availableCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-gray-600">
              Booked:{" "}
              <span className="font-semibold text-red-600">
                {totalSlots - availableCount}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              Total Slots: <span className="font-semibold">{totalSlots}</span>
            </span>
          </div>
        </div>

        {isFullyBooked && (
          <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">
                All appointments are fully booked for this date. Please select
                another date.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Time slots grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Available Time Slots
        </h3>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading availability...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-100 border border-red-200 rounded-md">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {timeSlots.map((slot) => (
              <div
                key={slot.time}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${getStatusColor(
                  slot.status
                )} ${
                  slot.status === "available"
                    ? "hover:shadow-md cursor-pointer transform hover:scale-105"
                    : "cursor-not-allowed"
                }`}
                onClick={() =>
                  slot.status === "available" &&
                  handleBookAppointment(slot.time)
                }
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg">{slot.time}</span>
                  {getStatusIcon(slot.status)}
                </div>
                <div className="text-sm">
                  <span className="capitalize font-medium">
                    {slot.status === "available" ? "Available" : "Booked"}
                  </span>
                  {slot.status === "available" && (
                    <div className="mt-1 text-xs opacity-75">Click to book</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Legend */}
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
            <span className="text-sm text-gray-600">Available Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
            <span className="text-sm text-gray-600">Booked Slot</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentAvailability;
