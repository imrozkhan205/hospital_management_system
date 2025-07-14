// src/App.js
import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
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
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import { axiosInstance } from './lib/axios';
import AllDoctors from './pages/AllDoctors';
import AppointmentAvailability from './pages/AppointmentAvailablity';

function App() {
  // authUser now stores { role: 'admin', id: 'someId' } etc.
  const [authUser, setAuthUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    // Get the linked_id from localStorage based on role
    const linkedDoctorId = localStorage.getItem('linked_doctor_id');
    const linkedPatientId = localStorage.getItem('linked_patient_id');

    console.log('App.js useEffect: Checking auth status...');
    console.log('   Token found:', !!token);
    console.log('   Role:', role);
    console.log('   Linked Doctor ID:', linkedDoctorId);
    console.log('   Linked Patient ID:', linkedPatientId);

    if (token && role) {
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      let userId = null;
      if (role === 'doctor' && linkedDoctorId) {
        userId = linkedDoctorId;
      } else if (role === 'patient' && linkedPatientId) {
        userId = linkedPatientId;
      }
      setAuthUser({ role, id: userId }); // Store the ID with the role
    } else {
      setAuthUser(null);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    localStorage.clear(); // Clears token, role, and any linked IDs
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
                  : authUser.role === 'doctor' ? <DoctorDashboard doctorId={authUser.id} /> // Pass doctorId
                  : authUser.role === 'patient' ? <PatientDashboard patientId={authUser.id} /> // Pass patientId
                  : <Dashboard /> // fallback: default dashboard for unknown roles
                } />

                {/* Admin routes */}
                {authUser.role === 'admin' && (
                  <>
                    <Route path="/patients" element={<Patients authUser={authUser} />} /> {/* Pass authUser */}
                    <Route path="/patients/add" element={<AddPatient />} />
                    <Route path="/doctors" element={<Doctors authUser={authUser} />} /> {/* Pass authUser */}
                    <Route path="/doctors/add" element={<AddDoctor />} />
                    <Route path="/appointments" element={<Appointments authUser={authUser} />} /> {/* Pass authUser */}
                    <Route path="/appointments/add" element={<AddAppointment />} />
                    <Route path="/departments" element={<Departments />} />
                    <Route path="/medical-records" element={<MedicalRecords />} />
                    <Route path="/medical-records/add" element={<AddMedicalRecord />} />
                  </>
                )}

                {/* Doctor routes */}
                {authUser.role === 'doctor' && (
                  <>
                    <Route path="/appointments" element={<Appointments authUser={authUser} />} /> {/* Pass authUser */}
                    <Route path="/patients" element={<Patients authUser={authUser} />} /> {/* Pass authUser, potentially for doctor's patients */}
                  </>
                )}

                {/* Patient routes */}
                {authUser.role === 'patient' && (
                  <>
                    <Route path="/appointments" element={<Appointments authUser={authUser} />} /> {/* Pass authUser */}
                    <Route path="/doctors" element={<Doctors authUser={authUser} />} /> {/* Pass authUser */}
                    <Route path='/all-doctors' element={<AllDoctors />} />
                    <Route path='/book-appointment/:doctorId' element={<AppointmentAvailability/>} />
                  </>
                )}

                {/* Catch-all route for authenticated users, redirects to dashboard */}
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </div>
      ) : (
        // Routes for unauthenticated users
        <Routes>
          <Route path="/login" element={<LoginPage setAuthUser={setAuthUser} />} />
          {/* Redirect any other path to login if not authenticated */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
  );
}

export default App;