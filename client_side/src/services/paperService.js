import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/papers";

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
  throw error;
};

// ✅ API Calls
export const submitQuestion = async (questionData) => {
  try {
    const response = await axios.post(`${API_URL}/questions`, questionData, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const getMyPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/my-papers`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

export const getApprovalPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/view`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    handleAuthError(error);
  }
};

// ✅ Fetch available courses
export const getAvailableCourses = async () => {
  try {
    const response = await axios.get(`${API_URL}/courses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching courses:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch final preview of paper
export const getFinalPreview = async () => {
  try {
    const response = await axios.get(`${API_URL}/final-preview`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching final preview:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch general questions based on stream
export const fetchGeneralQuestions = async (stream) => {
  try {
    const response = await axios.get(`${API_URL}/general-questions/${stream}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching general questions:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Approve a paper (Admin)
export const approvePaper = async (paperId) => {
  try {
    const response = await axios.patch(`${API_URL}/${paperId}/approve`, {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error approving paper:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Reject a paper (Admin)
export const rejectPaper = async (paperId, reason) => {
  try {
    const response = await axios.patch(`${API_URL}/${paperId}/reject`, { rejectionReason: reason }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error rejecting paper:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch rejected papers (Teacher)
export const getRejectedPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/rejected`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching rejected papers:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch paper status (SuperAdmin Panel)
export const getStatusOfPapers = async () => {
  try {
    const response = await axios.get(`${API_URL}/status`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching paper status:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a paper (Teacher)
export const deletePaper = async (paperId) => {
  try {
    const response = await axios.delete(`${API_URL}/${paperId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting paper:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Fetch all questions from question pool
export const getQuestionPool = async () => {
  try {
    const response = await axios.get(`${API_URL}/question-pool`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching question pool:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete a question (Admin)
export const deleteQuestion = async (questionId) => {
  try {
    const response = await axios.delete(`${API_URL}/question/${questionId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting question:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Download paper as PDF
export const downloadPaper = async (paperId) => {
  try {
    const response = await axios.get(`${API_URL}/${paperId}/download`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Paper_${paperId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("❌ Error downloading paper:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Generate a question paper with course and custom subject
export const generateQuestionPaper = async (course, customSubject) => {
  try {
    const response = await axios.post(
      `${API_URL}/generate-paper`,
      { course, customSubject }, // Send both course and custom subject
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error generating question paper:", error.response?.data || error.message);
    throw error;
  }
};

