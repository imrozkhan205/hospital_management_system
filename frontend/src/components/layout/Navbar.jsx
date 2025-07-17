// src/components/layout/Navbar.js
import { LogOut, UserRound } from "lucide-react";

// Receive authUserRole as a prop
const Navbar = ({ handleLogout, authUserRole }) => {
  // Use the prop directly
  let title = "Hospital Admin Panel";
  if (authUserRole === 'doctor') title = "Doctor Panel";
  else if (authUserRole === 'patient') title = "Patient Panel";

  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="flex gap-2 text-2xl font-bold text-gray-800 tracking-tight">
        <UserRound className="mt-1"/>
        {title}
      </h1>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-md transition duration-200 shadow-sm"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </header>
  );
};

export default Navbar;