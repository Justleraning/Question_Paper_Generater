// Sidebar.js
import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { FiMenu, FiX } from "react-icons/fi"; 
import { FaUser, FaTasks, FaUsers, FaKey, FaFileAlt, FaSignOutAlt, FaCheckCircle } from "react-icons/fa"; 

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-shrink sidebar when navigating to a specific module
  useEffect(() => {
    // When a path changes (user navigates to a module)
    if (location.pathname !== "/dashboard") {
      // Shrink the sidebar
      setIsSidebarOpen(false);
    } else {
      // Expand on dashboard
      setIsSidebarOpen(true);
    }
  }, [location.pathname, setIsSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <aside 
      className={`h-screen bg-gradient-to-b from-gray-800 to-gray-700 text-white fixed top-0 left-0 transition-all duration-300 ease-in-out z-50 shadow-xl
        ${isSidebarOpen ? "w-72" : "w-20"} flex flex-col overflow-hidden`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-600">
        <button 
          className="text-gray-300 hover:text-white hover:bg-gray-700 p-2 rounded-full transition-all duration-200"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav>
          <ul className="space-y-1 px-3">
            <NavItem 
              icon={<FaUser />} 
              label="Dashboard" 
              isOpen={isSidebarOpen} 
              onClick={() => navigate("/dashboard")} 
              isActive={location.pathname === "/dashboard"}
            />

            {authState.user?.role === "Teacher" && (
              <>
                <NavItemGroup label="Paper Management" isOpen={isSidebarOpen}>
                  <NavItem 
                    icon={<FaTasks />} 
                    label="Status of Paper" 
                    isOpen={isSidebarOpen} 
                    onClick={() => navigate("/status-of-paper")} 
                    isActive={location.pathname === "/status-of-paper"}
                  />
                  <NavItem 
                    icon={<FaFileAlt />} 
                    label="My Papers" 
                    isOpen={isSidebarOpen} 
                    onClick={() => navigate("/mypapers")} 
                    isActive={location.pathname === "/mypapers"}
                  />
                  <NavItem 
                    icon={<FaFileAlt />} 
                    label="Rejected Papers" 
                    isOpen={isSidebarOpen} 
                    onClick={() => navigate("/rejected-papers")} 
                    isActive={location.pathname === "/rejected-papers"}
                  />
                </NavItemGroup>
              </>
            )}

            {(authState.user?.role === "Admin" || authState.user?.role === "SuperAdmin") && (
              <>
                <NavItemGroup label="Administration" isOpen={isSidebarOpen}>
                  <NavItem 
                    icon={<FaUsers />} 
                    label="Add/Remove Users" 
                    isOpen={isSidebarOpen} 
                    onClick={() => navigate("/manage-users")} 
                    isActive={location.pathname === "/manage-users"}
                  />
                  <NavItem 
                    icon={<FaKey />} 
                    label="View Reset Requests" 
                    isOpen={isSidebarOpen} 
                    onClick={() => navigate("/view-reset-requests")} 
                    isActive={location.pathname === "/view-reset-requests"}
                  />
                  <NavItem 
                    icon={<FaCheckCircle />} 
                    label="View Approval Papers" 
                    isOpen={isSidebarOpen} 
                    onClick={() => navigate("/view-approval-papers")} 
                    isActive={location.pathname === "/view-approval-papers"}
                  />
                </NavItemGroup>
              </>
            )}
          </ul>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-600">
        <button 
          className="flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 p-3 rounded-md transition-all w-full shadow-md"
          onClick={logout}
        >
          <FaSignOutAlt className="text-red-100" />
          {isSidebarOpen && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// Helper component for nav item groups
const NavItemGroup = ({ label, isOpen, children }) => {
  if (!isOpen) return children;
  
  return (
    <div className="mt-6 mb-2">
      <h3 className="text-xs uppercase tracking-wider text-gray-400 font-semibold px-3 mb-2">{label}</h3>
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
};

// Enhanced nav item component
const NavItem = ({ icon, label, isOpen, onClick, isActive }) => {
  const handleClick = () => {
    // Call the provided onClick handler
    onClick();
  };

  return (
    <li 
      className={`flex items-center space-x-3 p-3 rounded-md cursor-pointer transition-all duration-200
        ${isActive 
          ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-300 shadow-sm" 
          : "hover:bg-gray-700/50 text-gray-300 hover:text-white"}`}
      onClick={handleClick}
    >
      <span className={`flex-shrink-0 ${isActive ? "text-blue-300" : ""}`}>{icon}</span>
      {isOpen && (
        <span className="whitespace-nowrap overflow-hidden font-medium">
          {label}
        </span>
      )}
    </li>
  );
};

export default Sidebar;