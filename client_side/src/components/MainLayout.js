import { useState } from "react";
import Sidebar from "./Sidebar.js";
import Navbar from "./Navbar.js";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen">
      {/* ✅ Sidebar (Remains Fixed) */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* ✅ Content Wrapper */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* ✅ Fixed Navbar */}
        <Navbar isSidebarOpen={isSidebarOpen} />

        {/* ✅ Content - Prevents covering under Navbar */}
        <div 
          className="transition-all duration-300 ease-in-out w-full px-12 py-12 flex flex-col items-start"
          style={{
            marginLeft: isSidebarOpen ? "14rem" : "5rem",  // Sidebar push effect
            transition: "margin-left 0.3s ease-in-out",
            marginTop: "5rem",  // Push content slightly down to prevent covering
            minHeight: "calc(100vh - 5rem)",  // Ensures full height remains
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
