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

// FIX: Get Reset Requests - Return empty array instead of undefined
export const getResetRequests = async () => {
  try {
    console.log("🔍 Fetching reset requests...");
    const response = await axios.get(`${AUTH_API_URL}/reset-requests`, { 
      headers: authHeaders() 
    });
    
    console.log("✅ Raw API Response:", response);
    
    // Handle different possible response formats:
    // 1. If response.data is an array, use it directly
    // 2. If it's an object with a data/requests/results property, use that
    // 3. Otherwise return an empty array
    
    let requests = [];
    if (Array.isArray(response.data)) {
      requests = response.data;
    } else if (response.data && typeof response.data === 'object') {
      requests = response.data.requests || response.data.data || response.data.results || [];
    }
    
    console.log("🔍 Reset requests retrieved:", requests);
    
    // IMPORTANT: Don't filter the requests here - just return whatever the backend provided
    return requests;
  } catch (error) {
    console.error("❌ Error fetching reset requests:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    // Return empty array instead of undefined
    return [];
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

// MODIFIED: Change Password Before Login (User provides username + old password)
// Fix: Removed custom header causing CORS issues
export const changePasswordBeforeLogin = async (changeForm, options = {}) => {
  try {
    // Make the API call without custom headers to avoid CORS issues
    const response = await axios.post(
      `${AUTH_API_URL}/change-password-before-login`, 
      changeForm
    );
    
    // If noAlert option is set, suppress any alert and just return the data
    // The calling component will handle showing a custom dialog
    if (options.noAlert && response.data) {
      console.log("Password change successful:", response.data.message);
      return response.data;
    }
    
    // Otherwise, let the alert happen naturally
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