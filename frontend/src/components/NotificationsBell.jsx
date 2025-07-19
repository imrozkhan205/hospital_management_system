import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { Link } from "react-router-dom";

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // create a ref

  const userId = localStorage.getItem("linked_doctor_id") || localStorage.getItem("linked_patient_id");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get(`/notifications/${userId}`);
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    fetchNotifications();
  }, [userId]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // ✅ Effect to close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleViewAll = async () => {
    try {
      await axiosInstance.put(`/notifications/mark-all-read/${userId}`);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setShowDropdown(!showDropdown)} className="relative">
        <Bell className="w-6 h-6 text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md overflow-hidden z-50">
          {notifications.length === 0 ? (
            <div className="p-4 text-gray-500">No notifications</div>
          ) : (
            notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`p-3 border-b ${!n.is_read ? "bg-gray-100" : ""}`}>
                <p className="text-sm">{n.message}</p>
                <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
              </div>
            ))
          )}
          <Link
            to="/notifications"
            onClick={handleViewAll}
            className="block text-center text-indigo-600 text-sm p-2 hover:bg-gray-50"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
