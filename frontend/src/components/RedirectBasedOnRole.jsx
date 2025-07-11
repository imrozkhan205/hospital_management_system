import { Navigate } from "react-router-dom";

const RedirectBasedOnRole = () => {
  const role = localStorage.getItem("role");

  if (role === 'admin') return <Navigate to="/admin" />;
  if (role === 'doctor') return <Navigate to="/doctor" />;
  if (role === 'patient') return <Navigate to="/patient" />;

  return <Navigate to="/login" />;
};

export default RedirectBasedOnRole;
