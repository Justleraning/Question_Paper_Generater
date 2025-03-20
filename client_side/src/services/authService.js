import axios from "axios";

// ✅ Use process.env for CRA (Create React App)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const AUTH_API_URL = `${API_URL}/auth`;

console.log("🔍 Backend API URL (AuthService):", AUTH_API_URL); // Debugging

// ✅ Helper: Get Auth Headers - changed to use sessionStorage
const getToken = () => sessionStorage.getItem("token") || null;
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Handle Unauthorized Requests (Auto Logout)
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    console.warn("⚠️ Unauthorized request. Logging out...");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/login"; // Force logout
  }
  console.error("❌ API Error:", error.response?.data || error.message);
  throw error;
};

// ✅ Request Password Reset
export const requestPasswordReset = async (resetForm) => {
  try {
    console.log("🔄 Sending Reset Request:", resetForm);
    const response = await axios.post(`${AUTH_API_URL}/request-reset`, resetForm);
    console.log("✅ Reset Request Response:", response.data);
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

// ✅ Login Request - Updated to store user info in sessionStorage
export const loginUser = async (credentials) => {
  try {
    console.log(`🔍 API Call: POST ${AUTH_API_URL}/login with`, credentials);
    const response = await axios.post(`${AUTH_API_URL}/login`, credentials);
    console.log("✅ API Response:", response.data);
    
    // Store user data and token in sessionStorage
    if (response.data && response.data.token) {
      sessionStorage.setItem("token", response.data.token);
      
      // Store the entire user object
      sessionStorage.setItem("user", JSON.stringify(response.data));
      
      console.log("✅ User data saved to sessionStorage:", response.data);
    }
    
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const getResetRequests = async () => {
  try {
    const response = await axios.get(`${AUTH_API_URL}/reset-requests`, { headers: authHeaders() });

    const requests = response.data;
    const user = JSON.parse(sessionStorage.getItem("user"));

    if (!user || !user.role) {
      console.error("🚨 No valid user found!");
      return [];
    }

    // ✅ Filter reset requests based on role
    let filteredRequests = [];

    if (user.role === "SuperAdmin") {
      filteredRequests = requests.filter(req => req.role === "Admin"); // SuperAdmin sees only Admins' requests
    } else if (user.role === "Admin") {
      filteredRequests = requests.filter(req => req.role === "Teacher"); // Admin sees only Teachers' requests
    } else {
      console.warn("🚨 Unauthorized access to reset requests!");
      return [];
    }

    console.log("✅ Filtered Reset Requests:", filteredRequests);
    return filteredRequests;
  } catch (error) {
    handleAuthError(error);
  }
};

// ✅ Approve Reset Request (Admin/SuperAdmin)
export const approveResetRequest = async (username) => {
  try {
    console.log(`🔄 Approving Reset for: ${username}`);

    const response = await axios.patch(
      `${AUTH_API_URL}/reset-password`,  // ✅ Correct endpoint
      { username },
      { headers: authHeaders() }
    );

    console.log("✅ Reset Request Approved:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error Approving Reset:", error.response?.data || error.message);
    handleAuthError(error);
  }
};

// ✅ Change Password Before Login (User provides username + old password)
export const changePasswordBeforeLogin = async (changeForm) => {
  try {
    const response = await axios.post(`${AUTH_API_URL}/change-password-before-login`, changeForm);
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

// ✅ Change Password After Login (Requires Authorization)
export const changePasswordAfterLogin = async (changeForm) => {
  try {
    const response = await axios.patch(`${AUTH_API_URL}/change-password`, changeForm, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

// ✅ Check User's Reset Request Status
export const checkResetRequestStatus = async (username) => {
  try {
    const response = await axios.get(`${AUTH_API_URL}/reset-requests/${username}`);
    return response.data;
  } catch (error) {
    return { status: "No Request" }; // If no request exists
  }
};