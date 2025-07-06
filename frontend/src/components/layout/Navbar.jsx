import { LogOut } from "lucide-react";

const Navbar = ({ handleLogout }) => {
  return (
    <header className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
        🏥 Hospital Admin Panel
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
