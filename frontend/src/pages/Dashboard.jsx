import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { User, Stethoscope, Calendar, FileText } from 'lucide-react';
import { axiosInstance } from '../lib/axios';

const Dashboard = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [p, d, a, r] = await Promise.all([
          axiosInstance.get('/api/patients'),
          axiosInstance.get('/api/doctors'),
          axiosInstance.get('/api/appointments'),
          axiosInstance.get('/api/medical-records'),
        ]);
        setPatients(p.data);
        setDoctors(d.data);
        setAppointments(a.data);
        setRecords(r.data);
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
        console.error("Dashboard data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Data Transformations for Charts ---

  // Appointment Status
  const appointmentStatus = [
    { name: 'Scheduled', value: appointments.filter(a => a.status === 'scheduled').length },
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
  ].filter(item => item.value > 0); // Only show categories with data

  // Patient Gender Distribution
  const genderDistribution = [
    { name: 'Male', value: patients.filter(p => p.gender && p.gender.toLowerCase() === 'male').length },
    { name: 'Female', value: patients.filter(p => p.gender && p.gender.toLowerCase() === 'female').length },
    { name: 'Other', value: patients.filter(p => p.gender && p.gender.toLowerCase() === 'other').length },
  ].filter(item => item.value > 0); // Only show categories with data

  // Appointments per Day (Trend Data)
  const appointmentsPerDay = appointments.reduce((acc, curr) => {
    // Ensure appointment_date exists and is valid
    if (curr.appointment_date) {
      const date = new Date(curr.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {});

  // Sort trend data by date for better visualization
  const trendData = Object.entries(appointmentsPerDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));


  // --- Color Palettes ---
  // A more harmonious and accessible color palette
  const PIE_COLORS_1 = ['#4F46E5', '#A855F7', '#EC4899', '#F59E0B', '#10B981']; // Indigo, Purple, Pink, Amber, Emerald
  const PIE_COLORS_2 = ['#06B6D4', '#6D28D9', '#DB2777', '#FBBF24', '#059669']; // Cyan, Violet, Rose, Yellow, Green

  // Fallback for charts if no data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-gray-700">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg font-medium text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 lg:p-10 space-y-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">Overview Dashboard</h1>
      <p className="text-gray-600 text-lg -mt-4">
        A snapshot of your healthcare system's key metrics.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={<User className="text-purple-600" size={32} />}
          title="Total Patients"
          value={patients.length}
          description="Registered users"
        />
        <MetricCard
          icon={<Stethoscope className="text-indigo-600" size={32} />}
          title="Active Doctors"
          value={doctors.length}
          description="Healthcare professionals"
        />
        <MetricCard
          icon={<Calendar className="text-pink-600" size={32} />}
          title="Total Appointments"
          value={appointments.length}
          description="Scheduled and completed"
        />
        <MetricCard
          icon={<FileText className="text-yellow-500" size={32} />}
          title="Medical Records"
          value={records.length}
          description="Digitized patient history"
        />
      </div>

      <hr className="border-gray-200 my-8" />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Patient Gender Distribution */}
        <ChartCard title="Patient Gender Distribution">
          {genderDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`gender-cell-${index}`} fill={PIE_COLORS_1[index % PIE_COLORS_1.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} Patients`, name]} />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  layout="horizontal"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage />
          )}
        </ChartCard>

        {/* Appointment Status */}
        <ChartCard title="Appointment Status Breakdown">
          {appointmentStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={appointmentStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#82ca9d"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                >
                  {appointmentStatus.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={PIE_COLORS_2[index % PIE_COLORS_2.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} Appointments`, name]} />
                <Legend
                  align="center"
                  verticalAlign="bottom"
                  layout="horizontal"
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage />
          )}
        </ChartCard>
      </div>

      {/* Appointments Trend Chart */}
      <div className="grid grid-cols-1">
        <ChartCard title="Appointments Trend Over Time">
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value) => [`${value} Appointments`, 'Count']} />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
                <Bar
                  dataKey="count"
                  fill="#4F46E5" // A solid, appealing color for the bar chart
                  radius={[4, 4, 0, 0]} // Rounded corners for bars
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <NoDataMessage />
          )}
        </ChartCard>
      </div>
    </div>
  );
};

// --- Reusable Components for better structure and aesthetics ---

const MetricCard = ({ icon, title, value, description }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex items-start gap-4 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
    <div className="p-3 bg-gray-100 rounded-full flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-gray-400 text-xs mt-1">{description}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 flex flex-col h-full">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">{title}</h2>
    <div className="flex-grow flex items-center justify-center">
      {children}
    </div>
  </div>
);

const NoDataMessage = () => (
  <div className="text-center text-gray-500 py-10">
    <p className="text-lg font-medium">No data available to display.</p>
    <p className="text-sm mt-1">Check back later or add some entries.</p>
  </div>
);

export default Dashboard;