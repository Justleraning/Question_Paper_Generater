import { useAuth } from "../Contexts/AuthContext.js"; 
import Sidebar from "../components/Sidebar.js";
import Navbar from "../components/Navbar.js";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useAuth(); // ✅ Use useAuth() instead of useContext(AuthContext)
  const navigate = useNavigate();

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {user?.fullName}!</p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="p-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition" onClick={() => navigate("/manage-users")}>Manage Users</button>
            <button className="p-4 bg-green-500 text-white rounded-md hover:bg-green-600 transition" onClick={() => navigate("/reset-requests")}>View Reset Requests</button>
            <button className="p-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition" onClick={() => navigate("/approve-papers")}>Approve Papers</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
