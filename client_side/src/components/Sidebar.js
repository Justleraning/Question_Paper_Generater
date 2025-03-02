// Sidebar.js
import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi"; 
import { FaUser, FaTasks, FaUsers, FaKey, FaFileAlt, FaSignOutAlt, FaCheckCircle } from "react-icons/fa"; 

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <aside 
      className={`h-screen bg-gray-800 text-white fixed top-0 left-0 transition-all duration-300 ease-in-out z-50 
        ${isSidebarOpen ? "w-64" : "w-16"} flex flex-col overflow-hidden`}
    >
      <div className="flex items-center justify-between p-4">
        {isSidebarOpen && <h2 className="text-xl font-bold truncate">QPG System</h2>}
        
        <button 
          className="text-white hover:bg-gray-700 p-2 rounded-md"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          <NavItem 
            icon={<FaUser />} 
            label="Dashboard" 
            isOpen={isSidebarOpen} 
            onClick={() => navigate("/dashboard")} 
          />

          {authState.user?.role === "Teacher" && (
            <>
              <NavItem 
                icon={<FaTasks />} 
                label="Status of Paper" 
                isOpen={isSidebarOpen} 
                onClick={() => navigate("/status-of-paper")} 
              />
              <NavItem 
                icon={<FaFileAlt />} 
                label="My Papers" 
                isOpen={isSidebarOpen} 
                onClick={() => navigate("/mypapers")} 
              />
              <NavItem 
                icon={<FaFileAlt />} 
                label="Rejected Papers" 
                isOpen={isSidebarOpen} 
                onClick={() => navigate("/rejected-papers")} 
              />
            </>
          )}

          {(authState.user?.role === "Admin" || authState.user?.role === "SuperAdmin") && (
            <>
              <NavItem 
                icon={<FaUsers />} 
                label="Add/Remove Users" 
                isOpen={isSidebarOpen} 
                onClick={() => navigate("/manage-users")} 
              />
              <NavItem 
                icon={<FaKey />} 
                label="View Reset Requests" 
                isOpen={isSidebarOpen} 
                onClick={() => navigate("/view-reset-requests")} 
              />
              <NavItem 
                icon={<FaCheckCircle />} 
                label="View Approval Papers" 
                isOpen={isSidebarOpen} 
                onClick={() => navigate("/view-approval-papers")} 
              />
            </>
          )}
        </ul>
      </nav>
      
      <div className="p-4">
        <button 
          className="flex items-center justify-center space-x-2 bg-red-500 p-2 rounded-md hover:bg-red-600 transition-all w-full"
          onClick={logout}
        >
          <FaSignOutAlt />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// Helper component for nav items
const NavItem = ({ icon, label, isOpen, onClick }) => (
  <li 
    className="flex items-center space-x-2 hover:bg-gray-700 p-3 rounded-md cursor-pointer transition-colors"
    onClick={onClick}
  >
    <span className="flex-shrink-0">{icon}</span>
    {isOpen && <span className="whitespace-nowrap overflow-hidden">{label}</span>}
  </li>
);

export default Sidebar;