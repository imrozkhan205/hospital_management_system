import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home, User, Stethoscope, Calendar, Folder, FileText,
  SidebarClose, SidebarOpen
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const role = localStorage.getItem('role');

  // Default admin links
  let links = [
    { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
    { to: "/patients", icon: <User size={18} />, label: "Patients" },
    { to: "/doctors", icon: <Stethoscope size={18} />, label: "Doctors" },
    { to: "/appointments", icon: <Calendar size={18} />, label: "Appointments" },
    { to: "/departments", icon: <Folder size={18} />, label: "Departments" },
    { to: "/medical-records", icon: <FileText size={18} />, label: "Medical Records" },
  ];

  if (role === 'doctor') {
    links = [
      { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
      { to: "/appointments", icon: <Calendar size={18} />, label: "My Appointments" },
      { to: "/patients", icon: <User size={18} />, label: "My Patients" },
    ];
  } else if (role === 'patient') {
    links = [
      { to: "/dashboard", icon: <Home size={18} />, label: "Dashboard" },
      { to: "/appointments", icon: <Calendar size={18} />, label: "My Appointments" },
      { to: "/doctors", icon: <Stethoscope size={18} />, label: "My Doctors" },
    ];
  }

  return (
    <aside
      className={`h-screen bg-white border-r p-4 transition-all duration-300 ease-in-out ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Toggle */}
      <div className="flex justify-between items-center mb-6">
        {!collapsed && (
          <h2 className="text-2xl font-bold text-purple-600">MediCare</h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 hover:text-purple-600 ml-3"
        >
          {collapsed ? <SidebarOpen size={20} /> : <SidebarClose size={20} />}
        </button>
      </div>

      {/* Links */}
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-lg transition ${
                isActive ? 'bg-indigo-100 text-indigo-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <span className="mr-3">{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
