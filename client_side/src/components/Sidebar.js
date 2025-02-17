import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi"; 
import { FaUser, FaTasks, FaUsers, FaKey, FaFileAlt, FaSignOutAlt, FaCheckCircle } from "react-icons/fa"; 

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  // ✅ Move Hooks to the Top
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Prevents rendering if `setIsSidebarOpen` is missing
  if (typeof setIsSidebarOpen !== "function") {
    console.error("❌ setIsSidebarOpen is NOT a function! Check MainLayout.");
    return null; 
  }

  const toggleSidebar = () => {
    console.log("🔄 Sidebar Toggle Clicked!");
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen flex">
      {/* ✅ Sidebar Toggle Button */}
      <button 
        className="absolute top-4 left-4 text-white bg-gray-800 p-2 rounded-md z-50"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* ✅ Sidebar Container */}
      <div className={`h-screen bg-gray-800 text-white fixed transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-64" : "w-16"} p-4 flex flex-col`}>
        {isSidebarOpen && <h2 className="text-xl font-bold mb-6 text-center">Question Paper Generator</h2>}

        <ul className="space-y-3">
          {/* ✅ Dashboard */}
          <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/dashboard")}>
            <FaUser />
            {isSidebarOpen && <span>Dashboard</span>}
          </li>

          {/* ✅ Teacher Features */}
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

          {/* ✅ Admin & SuperAdmin Features */}
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
              <li className="flex items-center space-x-2 hover:bg-gray-700 p-2 rounded-md cursor-pointer" onClick={() => navigate("/status-of-paper")}>
                <FaTasks />
                {isSidebarOpen && <span>Status of Paper</span>}
              </li>
            </>
          )}

          {/* ✅ Logout Button */}
          <button className="mt-auto flex items-center space-x-2 bg-red-500 p-2 rounded-md hover:bg-red-600 transition-all duration-200 ease-in-out w-full justify-center" onClick={logout}>
            <FaSignOutAlt />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
