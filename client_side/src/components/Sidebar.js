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
    <>
      {/* ✅ Sidebar */}
      <div className={`h-screen bg-gray-800 text-white fixed top-0 left-0 transition-all duration-300 ease-in-out z-50 ${isSidebarOpen ? "w-64" : "w-16"} flex flex-col p-4`}>
        
        {/* ✅ Sidebar Toggle Button in Sidebar */}
        <button 
          className="text-white bg-gray-800 p-2 rounded-md mb-4"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        {isSidebarOpen && <h2 className="text-xl font-bold mb-6 text-center">Question Paper Generator</h2>}

        <ul className="space-y-3">
          <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/dashboard")}>
            <FaUser />
            {isSidebarOpen && <span>Dashboard</span>}
          </li>

          {authState.user?.role === "Teacher" && (
            <>
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/status-of-paper")}>
                <FaTasks />
                {isSidebarOpen && <span>Status of Paper</span>}
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/mypapers")}>
                <FaFileAlt />
                {isSidebarOpen && <span>My Papers</span>}
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/rejected-papers")}>
                <FaFileAlt />
                {isSidebarOpen && <span>Rejected Papers</span>}
              </li>
            </>
          )}

          {(authState.user?.role === "Admin" || authState.user?.role === "SuperAdmin") && (
            <>
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/manage-users")}>
                 <FaUsers />
                 {isSidebarOpen && <span>Add/Remove Users</span>}
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/view-reset-requests")}>
                <FaKey />
                {isSidebarOpen && <span>View Reset Requests</span>}
              </li>
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/view-approval-papers")}>
                <FaCheckCircle />
                {isSidebarOpen && <span>View Approval Papers</span>}
              </li>
            </>
          )}

          <button className="mt-auto flex items-center space-x-2 bg-red-500 p-2 rounded-md hover:bg-red-600 transition-all duration-200 ease-in-out w-full justify-center" onClick={logout}>
            <FaSignOutAlt />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
