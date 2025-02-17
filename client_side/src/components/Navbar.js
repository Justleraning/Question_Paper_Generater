import { useAuth } from "../Contexts/AuthContext.js";

const Navbar = ({ isSidebarOpen }) => {
  const { authState } = useAuth();

  return (
    <div className={`bg-white shadow-md p-4 flex justify-between items-center transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
      {/* ✅ Title Moves Based on Sidebar State */}
      <h1 className="text-2xl font-bold text-gray-800">Question Paper Generator</h1>

      {/* ✅ Role Display on Right Side */}
      <p className="text-gray-600 text-sm md:text-lg">
        Logged in as: <strong>{authState.user?.role || "User"}</strong>
      </p>
    </div>
  );
};

export default Navbar;
