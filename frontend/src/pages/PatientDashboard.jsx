import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

const PatientDashboard = () => {
  const patientId = localStorage.getItem('linked_patient_id');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axiosInstance.get(`/api/patients/${patientId}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [patientId]);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!stats) return <div className="p-6">Failed to load stats</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Patient Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Total Doctors Visited</p>
          <p className="text-3xl font-bold text-purple-600">{stats.totalDoctors}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Completed Appointments</p>
          <p className="text-3xl font-bold text-purple-600">{stats.apptStats.find(s => s.status === 'completed')?.count || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500">Pending Appointments</p>
          <p className="text-3xl font-bold text-purple-600">{stats.apptStats.find(s => s.status === 'pending')?.count || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Appointments by Type</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.typeStats}>
              <XAxis dataKey="appointment_type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#7e5bef" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2">Appointments Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stats.monthlyStats}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area dataKey="count" fill="#7e5bef" stroke="#7e5bef" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
