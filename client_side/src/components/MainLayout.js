import { useState } from "react";
import Sidebar from "./Sidebar.js";
import Navbar from "./Navbar.js";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Determine the effective sidebar width
  const getSidebarWidth = () => {
    if (isSidebarOpen) return "16rem"; // Full open width
    if (isSidebarHovered) return "16rem"; // Hovered width
    return "4rem"; // Closed width
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar with hover state */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isHovered={isSidebarHovered}
        setIsHovered={setIsSidebarHovered}
      />

      {/* Main Area (Navbar + Page Content) */}
      <div 
        className="flex-1 flex flex-col transition-all duration-300 ease-in-out"
        style={{
          marginLeft: getSidebarWidth(),
          width: `calc(100vw - ${getSidebarWidth()})`,
        }}
      >
        {/* Navbar */}
        <Navbar 
          isSidebarOpen={isSidebarOpen} 
          isHovered={isSidebarHovered}
        />

        {/* Content Area */}
        <div
          className="flex-1 overflow-auto flex justify-center"
          style={{
            marginTop: "calc(5rem + 1cm)", // Navbar height plus 1cm
            paddingTop: "1rem", // Some space under navbar
            height: "calc(100vh - 5rem - 1cm)", // Subtract navbar height and 1cm
            transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
          }}
        >
          <div className="w-full max-w-5xl">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;