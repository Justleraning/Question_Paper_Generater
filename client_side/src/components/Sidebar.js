import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiChevronRight } from "react-icons/fi"; 
import { FaUser, FaTasks, FaUsers, FaKey, FaFileAlt, FaSignOutAlt, FaCheckCircle, FaBook } from "react-icons/fa"; 
import { HiOutlineClipboardDocument, HiOutlineAcademicCap, HiOutlineBookOpen } from "react-icons/hi2";
import { LuBriefcase } from "react-icons/lu";

const Sidebar = ({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isHovered = false, 
  setIsHovered = () => {} 
}) => {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState({});

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

  const toggleSubMenu = (key) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Determine sidebar width based on open state, hover state, and manual toggle
  const getSidebarWidth = () => {
    if (isSidebarOpen) return "w-64";  // Reduced from w-72 to w-64
    if (isHovered) return "w-64";      // Reduced from w-72 to w-64
    return "w-16";                     // Reduced from w-20 to w-16
  };

  // Open syllabus link in new tab
  const openSyllabus = () => {
    window.open("https://www.sju.edu.in/uploads/userfiles/ComputerScience-Syllabus-for-BCA.pdf", "_blank");
  };

  return (
    <aside 
      className={`h-screen bg-gradient-to-b from-gray-800 to-gray-700 text-white fixed top-0 left-0 transition-all duration-300 ease-in-out z-50 shadow-xl
        ${getSidebarWidth()} flex flex-col overflow-hidden`}
      onMouseEnter={() => !isSidebarOpen && setIsHovered(true)}
      onMouseLeave={() => !isSidebarOpen && setIsHovered(false)}
    >
      <div className="flex items-center justify-start p-[0.8rem] border-b border-gray-600">
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
              isOpen={isSidebarOpen || isHovered} 
              onClick={() => navigate("/dashboard")} 
              isActive={location.pathname === "/dashboard"}
            />

            {authState.user?.role === "Teacher" && (
              <>
                <NavItemGroup label="Paper Management" isOpen={isSidebarOpen || isHovered}>
                  <NavItem 
                    icon={<FaTasks />} 
                    label="Status of Paper" 
                    isOpen={isSidebarOpen || isHovered} 
                    onClick={() => navigate("/status-of-paper")} 
                    isActive={location.pathname === "/status-of-paper"}
                  />
                  
                  <NavItemWithSubmenu
                    icon={<FaFileAlt />}
                    label="My Papers"
                    isOpen={isSidebarOpen || isHovered}
                    isExpanded={expandedItems["myPapers"]}
                    toggleExpand={() => toggleSubMenu("myPapers")}
                    isActive={location.pathname.startsWith("/mypapers")}
                  >
                    <SubNavItem
                      icon={<HiOutlineClipboardDocument />}
                      label="Entrance Exam"
                      isOpen={isSidebarOpen || isHovered}
                      onClick={() => navigate("/entrance-exam")}
                      isActive={location.pathname === "/entrance-exam"}
                    />
                    <SubNavItem
                      icon={<HiOutlineAcademicCap />}
                      label="Mid-Semester"
                      isOpen={isSidebarOpen || isHovered}
                      onClick={() => navigate("/midsemester")}
                      isActive={location.pathname === "/midsemester"}
                    /> 
                    <SubNavItem
                        icon={<HiOutlineBookOpen />}
                        label="End-Semester"
                        isOpen={isSidebarOpen || isHovered}
                        onClick={() => navigate("/end-semester")}
                        isActive={location.pathname === "/end-semester"}
                    />
                    <SubNavItem
                      icon={<LuBriefcase />}
                      label="Open Electives"
                      isOpen={isSidebarOpen || isHovered}
                      onClick={() => navigate("/open-electives")}
                      isActive={location.pathname === "/open-electives"}
                    />
                  </NavItemWithSubmenu>
                  
                </NavItemGroup>
              </>
            )}

            {(authState.user?.role === "Admin" || authState.user?.role === "SuperAdmin") && (
              <>
                <NavItemGroup label="Administration" isOpen={isSidebarOpen || isHovered}>
                  <NavItem 
                    icon={<FaUsers />} 
                    label="Add/Remove Users" 
                    isOpen={isSidebarOpen || isHovered} 
                    onClick={() => navigate("/manage-users")} 
                    isActive={location.pathname === "/manage-users"}
                  />
                  <NavItem 
                    icon={<FaKey />} 
                    label="View Reset Requests" 
                    isOpen={isSidebarOpen || isHovered} 
                    onClick={() => navigate("/view-reset-requests")} 
                    isActive={location.pathname === "/view-reset-requests"}
                  />
                  <NavItem 
  icon={<FaCheckCircle />} 
  label="Paper Approvals" 
  isOpen={isSidebarOpen || isHovered} 
  onClick={() => navigate("/paper-approval-types")} 
  isActive={location.pathname === "/paper-approval-types" || location.pathname.startsWith("/paper-approvals")}
/>
                </NavItemGroup>
              </>
            )}
          </ul>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-600 space-y-3">
        {/* Syllabus Button */}
        <button 
          className="flex items-center justify-center space-x-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 p-3 rounded-md transition-all w-full shadow-md"
          onClick={openSyllabus}
        >
          <FaBook className="text-green-100" />
          {(isSidebarOpen || isHovered) && <span className="font-medium">Syllabus</span>}
        </button>
        
        {/* Logout Button */}
        <button 
          className="flex items-center justify-center space-x-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 p-3 rounded-md transition-all w-full shadow-md"
          onClick={logout}
        >
          <FaSignOutAlt className="text-red-100" />
          {(isSidebarOpen || isHovered) && <span className="font-medium">Logout</span>}
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

// Nav item with submenu
const NavItemWithSubmenu = ({ icon, label, isOpen, isExpanded, toggleExpand, isActive, children }) => {
  return (
    <div className="relative">
      <div 
        className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-200
          ${isActive 
            ? "bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-300 shadow-sm" 
            : "hover:bg-gray-700/50 text-gray-300 hover:text-white"}`}
        onClick={toggleExpand}
      >
        <div className="flex items-center space-x-3">
          <span className={`flex-shrink-0 ${isActive ? "text-blue-300" : ""}`}>{icon}</span>
          {isOpen && (
            <span className="whitespace-nowrap overflow-hidden font-medium">
              {label}
            </span>
          )}
        </div>
        {isOpen && (
          <span>
            {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
          </span>
        )}
      </div>
      
      {isExpanded && isOpen && (
        <div className="pl-7 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

// Sub nav item component
const SubNavItem = ({ icon, label, isOpen, onClick, isActive }) => {
  return (
    <div 
      className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-all duration-200
        ${isActive 
          ? "bg-gray-700/50 text-white" 
          : "hover:bg-gray-600/30 text-gray-300 hover:text-white"}`}
      onClick={onClick}
    >
      <span className="flex-shrink-0 text-lg">{icon}</span>
      {isOpen && (
        <span className="whitespace-nowrap overflow-hidden text-sm">
          {label}
        </span>
      )}
    </div>
  );
};

export default Sidebar;