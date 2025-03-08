import { useState } from "react";
import Sidebar from "./Sidebar.js";
import Navbar from "./Navbar.js";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ✅ Sidebar (fixed left) */}
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      {/* ✅ Main Area (Navbar + Page Content) */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">

        {/* ✅ Navbar (with toggle button inside) */}
        <Navbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        {/* ✅ Content Area (centred with breathing room under navbar) */}
        <div
          className="flex-1 overflow-auto flex justify-center"
          style={{
            marginTop: "4rem", // Navbar height
            paddingTop: "1rem", // Some space under navbar
            marginLeft: isSidebarOpen ? "16rem" : "4rem", // Space for sidebar
            marginRight: "0", // Ensure no right margin
            width: "calc(100vw - (16rem))", // Adjust width based on sidebar width
            transition: "margin-left 0.3s ease-in-out, width 0.3s ease-in-out",
          }}
        >
          <div className="w-full max-w-5xl">{children}</div> {/* Centres content */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;