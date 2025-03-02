import { FaBars } from "react-icons/fa";

const Navbar = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-white shadow-md flex items-center justify-between px-4 z-50">
      {/* ✅ Sidebar Toggle Button (Always visible inside navbar) */}
      <button
        className="text-gray-700 text-2xl"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* ✅ Title - centered if needed */}
      <h1 className="text-xl font-bold flex-1 text-center">
        Question Paper Generator
      </h1>

      {/* ✅ Role Display */}
      <p className="text-gray-600 text-sm">
        Logged in as: <strong>Teacher</strong>
      </p>
    </div>
  );
};

export default Navbar;
