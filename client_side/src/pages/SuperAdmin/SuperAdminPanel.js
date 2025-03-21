import { useEffect, useState } from "react";
import { getUsers, removeUser } from "../../services/userService.js";
import { getStatusOfPapers } from "../../services/paperService.js";
import Sidebar from "../../components/Sidebar.js";
import Navbar from "../../components/Navbar.js";

const SuperAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // ✅ Sidebar state

  useEffect(() => {
    fetchUsers();
    fetchPapers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchPapers = async () => {
    try {
      const data = await getStatusOfPapers();
      setPapers(data);
    } catch (error) {
      console.error("Error fetching papers:", error);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await removeUser(userId);
      fetchUsers(); // ✅ Refresh user list after deletion
    } catch (error) {
      console.error("Error removing user:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
      <div className={`flex-1 flex flex-col bg-gray-100 transition-all duration-300 ease-in-out ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        <Navbar isSidebarOpen={isSidebarOpen} />
        <div className="p-6">
          <h1 className="text-3xl font-bold">Super Admin Panel</h1>

          {/* ✅ User Management Section */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold">Manage Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user._id} className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">{user.fullName}</h2>
                    <p className="text-gray-600">Role: <strong>{user.role}</strong></p>
                    {user.role !== "SuperAdmin" && (
                      <button
                        className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                        onClick={() => handleRemoveUser(user._id)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No users found.</p>
              )}
            </div>
          </div>

          {/* ✅ Paper Approval Status Section */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold">Paper Approval Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
              {papers.length > 0 ? (
                papers.map((paper) => (
                  <div key={paper._id} className="bg-white p-4 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold">{paper.course}</h2>
                    <p className="text-gray-600">Status: <strong>{paper.status}</strong></p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No papers found.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
