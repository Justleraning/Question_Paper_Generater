import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

console.log("🔍 Backend API URL (PaperService):", API_URL); // Debugging

// ✅ Get Token Securely
const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn("🚨 No token found, request may fail!");
    return null;
  }
  return token;
};

// ✅ Headers Helper Function
const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Handle Unauthorized Requests
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    console.warn("⚠️ Unauthorized request. Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // Force logout
  }
  console.error("❌ API Error:", error.response?.data || error.message);
  return null;
};

// ✅ Restore Missing Functions

export const getFinalPreview = async () => {
  try {
    const response = await axios.get(`${API_URL}/final-preview`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const fetchGeneralQuestions = async (stream) => {
  try {
    const response = await axios.get(`${API_URL}/general-questions/${stream}`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const getMyPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-papers`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const deletePaper = async (paperId) => {
  try {
    const response = await axios.delete(`${API_URL}/${paperId}`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const getApprovalPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/view`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const approvePaper = async (paperId) => {
  try {
    const response = await axios.patch(`${API_URL}/${paperId}/approve`, {}, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const rejectPaper = async (paperId, reason) => {
  try {
    const response = await axios.patch(`${API_URL}/${paperId}/reject`, { rejectionReason: reason }, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const getStatusOfPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const getRejectedPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/rejected`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

// ✅ Existing Functions (Kept)
export const getAvailableCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses`, { headers: authHeaders() });

    // Debugging Logs
    console.log("✅ API Response - Available Courses:", response.data);

    if (!Array.isArray(response.data)) {
      throw new Error("Invalid API response format: Expected an array.");
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching courses:", error.response?.data || error.message);
    return []; // Ensure it returns an empty array instead of crashing
  }
};


export const generateQuestionPaper = async (courseId, customSubject) => {
  try {
    const response = await axios.post(
      `${API_URL}/generate-paper`,
      { courseId, customSubject },
      { headers: authHeaders() }
    );
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/courses/${courseId}`, { headers: authHeaders() });
    return response.data || null;
  } catch (error) {
    console.error("❌ Error fetching course:", error.response?.data || error.message);
    return null;
  }
};

export const saveQuestions = async (course, subject, questions) => {
  try {
    const response = await axios.post(`${API_URL}/questions`, { course, subject, questions }, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    console.error("❌ Error saving questions:", error.response?.data || error.message);
    return null;
  }
};
