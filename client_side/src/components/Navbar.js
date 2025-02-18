import { useAuth } from "../Contexts/AuthContext.js";

const Navbar = ({ isSidebarOpen }) => {
  const { authState } = useAuth();

  return (
    <div className="bg-white shadow-md p-4 flex justify-between items-center fixed top-0 left-0 w-full z-40 h-16">
      {/* ✅ Adjust Title Margin Based on Sidebar */}
      <h1 className="text-2xl font-bold text-gray-800" style={{ marginLeft: isSidebarOpen ? "16rem" : "4rem" }}>
        Question Paper Generator
      </h1>

      {/* ✅ Role Display */}
      <p className="text-gray-600 text-sm md:text-lg">
        Logged in as: <strong>{authState.user?.role || "User"}</strong>
      </p>
    </div>
  );
};

export default Navbar;
