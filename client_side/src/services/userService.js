import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const USER_API_URL = `${API_BASE_URL}/users`;

// ✅ Ensure Token is Retrieved from Storage
const getToken = () => sessionStorage.getItem("token") || null;

// ✅ Helper for Headers
const authHeaders = () => {
  const token = getToken();
  if (!token) {
    console.warn("🚨 No token found! API request might fail.");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Handle Unauthorized Requests
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    console.warn("⚠️ Unauthorized request. Logging out...");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login"; // Force logout on token expiry
  }
  console.error("❌ API Error:", error.response?.data || error.message);
  throw error;
};

// ✅ Fetch Users (Ensuring SuperAdmin sees Admins & Admin sees Teachers)
export const getUsers = async () => {
  try {
    const response = await axios.get(`${USER_API_URL}/`, { headers: authHeaders() });
    console.log("✅ Users Fetched:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching users:", error.response?.data || error.message);
    handleAuthError(error);
  }
};

// ✅ Add a User
export const addUser = async (userData) => {
  try {
    console.log("📢 Sending Add User Request:", userData);
    const response = await axios.post(`${USER_API_URL}/add`, userData, { headers: authHeaders() });
    console.log("✅ User Added:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error adding user:", error.response?.data || error.message);
    handleAuthError(error);
  }
};

// ✅ Remove a User
export const removeUser = async (userId) => {
  try {
    const response = await axios.delete(`${USER_API_URL}/remove/${userId}`, { headers: authHeaders() });

    if (response.data.forceLogout) {
      console.warn("🚨 User was logged in! Triggering forced logout...");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      window.location.href = "/login"; // Redirect to login page
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error removing user:", error.response?.data || error.message);
    handleAuthError(error);
  }
};
