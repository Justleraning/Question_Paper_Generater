import { useEffect, useState, useCallback } from "react";
import { getUsers, addUser, removeUser } from "../../services/userService.js";
import { useAuth } from "../../Contexts/AuthContext.js";

const ManageUsers = () => {
  const { authState } = useAuth();
  const [users, setUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", fullName: "" });

  // ✅ Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const allUsers = await getUsers();
      if (!allUsers || allUsers.length === 0) {
        setUsers([]);
        return;
      }

      // ✅ Ensure correct filtering
      const filteredUsers =
        authState.user?.role === "SuperAdmin"
          ? allUsers.filter((user) => user.role === "Admin")
          : allUsers.filter((user) => user.role === "Teacher");

      setUsers(filteredUsers);
    } catch (error) {
      console.error("❌ Error fetching users:", error);
    }
  }, [authState.user?.role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Handle Removing a User
  const handleRemoveUser = async (userId) => {
    try {
      const response = await removeUser(userId);
      console.log("🚨 Remove User Response:", response);

      if (response.forceLogout) {
        console.warn("🚨 Removed user was logged in! They will see a logout pop-up.");
      } else {
        fetchUsers();
      }
    } catch (error) {
      console.error("❌ Error removing user:", error);
    }
  };

  // ✅ Handle Adding a User
  const handleAddUser = async () => {
    if (!newUser.username.trim() || !newUser.fullName.trim()) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      console.log("📢 Sending Add User Request:", newUser);
      const response = await addUser({
        username: newUser.username.trim(),
        fullName: newUser.fullName.trim(),
        password: newUser.username.trim(),
        role: authState.user?.role === "Admin" ? "Teacher" : "Admin",
      });

      console.log("✅ Add User API Response:", response);
      if (response && response.user) {
        setUsers((prevUsers) => [...prevUsers, response.user]);
      } else {
        console.warn("⚠️ Add User API did not return a user object.");
      }

      setShowAddModal(false);
      setNewUser({ username: "", fullName: "" });
    } catch (error) {
      console.error("❌ Error adding user:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Error adding user.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Manage Users</h1>

      {/* ✅ Add User Button */}
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setShowAddModal(true)}
      >
        Add {authState.user?.role === "Admin" ? "Teacher" : "Admin"}
      </button>

      {/* ✅ User List */}
      <div className="mt-6">
        {users.length === 0 ? (
          <p className="text-gray-600">No users found.</p>
        ) : (
          <ul className="space-y-4">
            {users.map((user) => (
              <li key={user._id} className="p-4 bg-white shadow-md flex justify-between items-center">
                <div>
                  <h2 className="font-bold">{user.fullName}</h2>
                  <p className="text-gray-600">Username: {user.username}</p>
                </div>
                <button
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleRemoveUser(user._id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Add New User</h2>

            <label className="block">Full Name:</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={newUser.fullName}
              onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
            />

            <label className="block">Username:</label>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />

            <div className="flex justify-end space-x-4">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                onClick={handleAddUser}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
