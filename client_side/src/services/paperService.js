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
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ✅ Handle Unauthorized Requests
const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    console.warn("⚠️ Unauthorized request. Logging out...");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
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

export const saveQuestion = async (courseName, subjectName, question) => {
  try {
    console.log("📤 Sending request to save question:", JSON.stringify(question, null, 2));

    // ✅ Fix the "options" structure before sending it
    const formattedOptions = question.options.map((opt) => ({
      type: opt.type || "Text",
      value: opt.value?.trim() || "", // Ensure "value" is always a string
    }));

    const payload = {
      courseName,
      subject: subjectName,
      question: question.question,
      options: formattedOptions, // Ensure options are formatted properly
      correctOption: question.correctOption,
      index: question.index,
    };

    console.log("📦 Final Payload Sent:", JSON.stringify(payload, null, 2));

    const response = await axios.post(`${API_URL}/questions`, payload, {
      headers: authHeaders(),
    });

    console.log("✅ Backend Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving question:", error.response?.data || error.message);
    return null;
  }
};





export const getQuestionByIndex = async (courseName, subjectName, index) => {
  try {
    const response = await axios.get(`${API_URL}/questions/get`, {
      headers: authHeaders(),
      params: { courseName, subject: subjectName, index }, // ✅ Ensure index is sent
    });
    
    console.log("📥 Backend response for fetched question:", response.data);

    if (!response.data || response.data.question === undefined) {
      console.warn("⚠️ No question found at index. Returning empty form.");
      return { question: "", options: [], correctOption: null };
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching question by index:", error.response?.data || error.message);
    return { question: "", options: [], correctOption: null }; // ✅ Return empty if no question found
  }
};
