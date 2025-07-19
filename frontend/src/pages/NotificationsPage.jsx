import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const userId = localStorage.getItem("linked_doctor_id") || localStorage.getItem("linked_patient_id") || localStorage.setItem("admin_user_id", "7");
;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get(`/notifications/${userId}`);
        setNotifications(res.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications found.</p>
      ) : (
        <div className="bg-white shadow rounded divide-y">
          {notifications.map((n) => (
            <div key={n.id} className={`p-4 ${!n.is_read ? "bg-gray-50" : ""}`}>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
