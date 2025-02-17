import { useState } from "react";
import Sidebar from "./Sidebar.js";
import Navbar from "./Navbar.js";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ Correctly manage sidebar state

  return (
    <div className="flex h-screen">
      {/* ✅ Ensure Sidebar receives state */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* ✅ Navbar and Content Adjust Dynamically */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Navbar isSidebarOpen={isSidebarOpen} />
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
