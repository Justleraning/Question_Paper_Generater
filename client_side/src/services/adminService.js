// adminService.js
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/admin";

// ✅ Fetch System Settings
export const getSystemSettings = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching system settings:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update System Settings
export const updateSystemSettings = async (settings) => {
  try {
    const response = await axios.patch(`${API_URL}/settings`, settings, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error updating system settings:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch All Users (SuperAdmin Only)
export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Remove a User (SuperAdmin Only)
export const removeUser = async (userId) => {
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error removing user:", error.response?.data || error.message);
    throw error;
  }
};
