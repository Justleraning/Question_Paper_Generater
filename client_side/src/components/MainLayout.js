import { useState } from "react";
import Sidebar from "./Sidebar.js";
import Navbar from "./Navbar.js";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {/* ✅ Sidebar (Remains Fixed) */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* ✅ Content Wrapper */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* ✅ Fixed Navbar */}
        <Navbar isSidebarOpen={isSidebarOpen} />

        {/* ✅ Content - Push down below Navbar */}
        <div 
          className="p-6 transition-all duration-300 ease-in-out"
          style={{
            marginLeft: isSidebarOpen ? "16rem" : "4rem", // Adjust Sidebar Width
            marginTop: "4rem", // ✅ Push content below Navbar
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
