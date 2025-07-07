import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Departments from './pages/Departments';
import MedicalRecords from './pages/MedicalRecords';
  import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

import { axiosInstance } from './lib/axios';
import AddDoctor from './pages/AddDoctor';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');

  if (token && username) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setAuthUser({ username });
  } else {
    setAuthUser(null);
  }

  setLoading(false);
}, []);


  const handleLogout = () => {
    localStorage.clear();
    delete axiosInstance.defaults.headers.common['Authorization'];
    setAuthUser(null);
    toast.success('Logged out');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Toaster />
      {authUser && (
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar handleLogout={handleLogout} />
            <main className="p-6">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/patients" element={<Patients />} />
                <Route path="/doctors" element={<Doctors />} />
                <Route path="/appointments" element={<Appointments />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/medical-records" element={<MedicalRecords />} />
                <Route path="*" element={<Navigate to="/dashboard" />} />
                <Route path="/doctors/add" element={<AddDoctor />} />

              </Routes>
            </main>
          </div>
        </div>
      )}

      {!authUser && (
        <Routes>
          <Route path="/login" element={<LoginPage setAuthUser={setAuthUser} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;
