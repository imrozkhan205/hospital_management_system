// src/App.js
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

// Import your pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Departments from './pages/Departments';
import MedicalRecords from './pages/MedicalRecords';
import AddAppointment from './pages/AddAppointment';
import AddDoctor from './pages/AddDoctor';
import AddPatient from './pages/AddPatient';
import AddMedicalRecord from './pages/AddMedicalRecord';

// Import layout components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Import axiosInstance for API calls
import { axiosInstance } from './lib/axios';

function App() {
  const [authUser, setAuthUser] = useState(null); // Stores { role: 'admin' } etc.
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    console.log('App.js useEffect: Checking auth status...');
    console.log('  Token found:', !!token);
    console.log('  Role:', role);

    if (token && role) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setAuthUser({ role });
    } else {
      setAuthUser(null);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.clear();
    delete axiosInstance.defaults.headers.common['Authorization'];
    setAuthUser(null);
    toast.success('Logged out successfully!');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {authUser ? (
        <div className="flex min-h-screen">
          <Sidebar authUserRole={authUser.role} />
          <div className="flex-1 flex flex-col">
            <Navbar handleLogout={handleLogout} authUserRole={authUser.role} />
            <main className="flex-grow p-6 bg-gray-50">
              <Routes>
                {/* Dashboard route: render based on role */}
                <Route path="/dashboard" element={
                  authUser.role === 'admin' ? <Dashboard />
                  : authUser.role === 'doctor' ? <DoctorDashboard />
                  : authUser.role === 'patient' ? <PatientDashboard />
                  : <Dashboard /> // fallback: default dashboard
                } />

                {/* Admin routes */}
                {authUser.role === 'admin' && (
                  <>
                    <Route path="/patients" element={<Patients />} />
                    <Route path="/patients/add" element={<AddPatient />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/doctors/add" element={<AddDoctor />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/appointments/add" element={<AddAppointment />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    <Route path="/medical-records/add" element={<AddMedicalRecord />} />
                  </>
                )}

                {/* Doctor routes */}
                {authUser.role === 'doctor' && (
                  <>
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/patients" element={<Patients />} />
                  </>
                )}

                {/* Patient routes */}
                {authUser.role === 'patient' && (
                  <>
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/doctors" element={<Doctors />} />
                  </>
                )}

                {/* Catch-all route */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // Routes for unauthenticated users
        <Routes>
          <Route path="/login" element={<LoginPage setAuthUser={setAuthUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;
