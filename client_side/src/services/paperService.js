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


//dashboard papers for entrance features

export const getMyPapers = async (filters = {}) => {
  try {
    // Build query parameters for filtering
    const queryParams = new URLSearchParams();
    
    if (filters.courseName) {
      queryParams.append('courseName', filters.courseName);
    }
    
    if (filters.customSubjectName) {
      queryParams.append('customSubjectName', filters.customSubjectName);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/my-papers${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const deletePaper = async (paperId) => {
  try {
    const response = await axios.delete(`${API_URL}/papers/${paperId}`, { headers: authHeaders() });
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

export const sendPaperForApproval = async (paperId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${paperId}/send-for-approval`, 
      {}, 
      { headers: authHeaders() }
    );
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};
export const rejectPaper = async (paperId, comments) => {
  try {
    if (!comments) {
      throw new Error('Rejection reason is required');
    }
    
    const response = await axios.patch(
      `${API_URL}/${paperId}/reject`, 
      { comments }, 
      { headers: authHeaders() }
    );
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


//dashboard papers features


//courses
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

//courses


//questionentry

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
      questionId: question.questionId || null,
      index: question.index, // Keep index for backward compatibility
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

export const getQuestionById = async (questionId) => {
  try {
    const response = await axios.get(`${API_URL}/questions/get-by-id`, {
      headers: authHeaders(),
      params: { questionId }, // Only need questionId now
    });
    
    console.log("📥 Backend response for fetched question:", response.data);

    if (!response.data || response.data.question === undefined) {
      console.warn("⚠️ No question found with this ID. Returning empty form.");
      return { question: "", options: [], correctOption: null };
    }

    return response.data;
  } catch (error) {
    console.error("❌ Error fetching question by ID:", error.response?.data || error.message);
    return { question: "", options: [], correctOption: null }; // ✅ Return empty if no question found
  }
};

// ✅ LEGACY: Keep for backward compatibility
export const getQuestionByIndex = async (courseName, subjectName, index) => {
  try {
    console.warn("⚠️ DEPRECATED: getQuestionByIndex is being phased out. Use getQuestionById instead.");
    const response = await axios.get(`${API_URL}/questions/get`, {
      headers: authHeaders(),
      params: { courseName, subject: subjectName, index }, // ✅ Ensure index is sent
    });
    
    console.log("📥 Backend response for fetched question by index:", response.data);

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
//questionentry

//finalpreview
/**
 * Fetches all questions for all subjects in a course
 * @param {string} courseName - The name of the course
 * @param {string} subjectName - The name of the subject (optional)
 * @returns {Promise<Array>} - Array of question objects
 */
export const getAllQuestions = async (courseName, subject) => {
  try {
    const response = await axios.get(`${API_URL}/questions/all`, {
      params: { courseName, subject }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

// ✅ NEW FUNCTIONS (Converted from fetch to axios & matching existing patterns)

/**
 * Deletes all questions for a course after the paper is finalized
 * @param {string} courseName - The name of the course
 * @returns {Promise<Object>} - Response data from the API
 */
export const deleteAllQuestionsForCourse = async (courseName) => {
  try {
    console.log(`🗑️ Deleting all questions for course: ${courseName}`);
    
    const response = await axios.delete(
      `${API_URL}/questions/delete/${encodeURIComponent(courseName)}`, 
      { headers: authHeaders() }
    );
    
    console.log("✅ Questions deleted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting questions:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Saves the completed paper to user's account
 * @param {Object} paperData - The complete paper data object
 * @returns {Promise<Object>} - Response data from the API
 */
export const saveCompletedPaper = async (paperData) => {
  try {
    console.log("📤 Saving completed paper:", JSON.stringify(paperData, null, 2));
    
    // Use the new OpenPapers endpoint for MCQ papers
    const response = await axios.post(
      `${API_URL}/openpapers`, 
      paperData, 
      { 
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("✅ Paper saved successfully:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error saving paper:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Generates and saves the answer key for a paper
 * @param {Object} answerKeyData - The answer key data object
 * @returns {Promise<Object>} - Response data from the API
 */
export const saveAnswerKey = async (answerKeyData) => {
  try {
    console.log("📤 Saving answer key:", JSON.stringify(answerKeyData, null, 2));
    
    const response = await axios.post(
      `${API_URL}/save-answer-key`, 
      answerKeyData, 
      { headers: authHeaders() }
    );
    
    console.log("✅ Answer key saved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving answer key:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

//finalpreview

//genreal question feature

export const fetchGeneralQuestions = async (stream) => {
  try {
    const response = await axios.get(`${API_URL}/general-questions/${stream}`, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

// ✅ OPEN PAPERS FUNCTIONS

/**
 * Gets all open papers
 * @returns {Promise<Array>} - Array of open papers
 */
export const getAllOpenPapers = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/openpapers`, 
      { headers: authHeaders() }
    );
    
    console.log("✅ Fetched open papers:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching open papers:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Gets an open paper by ID
 * @param {string} paperId - The ID of the paper to fetch
 * @returns {Promise<Object>} - Paper data object
 */
export const getOpenPaperById = async (paperId) => {
  try {
    const response = await axios.get(
      `${API_URL}/openpapers/${paperId}`, 
      { headers: authHeaders() }
    );
    
    console.log("✅ Fetched open paper:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching open paper:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Gets open papers by subject
 * @param {string} subjectId - The ID of the subject
 * @returns {Promise<Array>} - Array of open papers for the subject
 */
export const getOpenPapersBySubject = async (subjectId) => {
  try {
    const response = await axios.get(
      `${API_URL}/openpapers/subject/${subjectId}`, 
      { headers: authHeaders() }
    );
    
    console.log("✅ Fetched open papers by subject:", response.data);
    return response.data.data;
  } catch (error) {
    console.error("❌ Error fetching open papers by subject:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Deletes an open paper
 * @param {string} paperId - The ID of the paper to delete
 * @returns {Promise<Object>} - Response data
 */
export const deleteOpenPaper = async (paperId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/openpapers/${paperId}`, 
      { headers: authHeaders() }
    );
    
    console.log("✅ Deleted open paper:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting open paper:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Saves an HTML snapshot of a paper
 * @param {string} paperId - The ID of the paper
 * @param {string} htmlContent - The HTML content to save
 * @returns {Promise<Object>} - Response data
 */
export const saveOpenPaperHtmlSnapshot = async (paperId, htmlContent) => {
  try {
    const response = await axios.post(
      `${API_URL}/openpapers/${paperId}/snapshot`, 
      { htmlContent }, 
      { 
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("✅ Saved HTML snapshot:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error saving HTML snapshot:", error.response?.data || error.message);
    return handleAuthError(error);
  }
};

/**
 * Saves a new paper
 * @param {Object} paperData - The paper data to be saved
 * @returns {Promise<Object>} - Response data from the API
 */
export const savePaper = async (paperData) => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(
      `${API_URL}/papers/saves`, 
      paperData, 
      { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("✅ Paper saved successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Detailed error saving paper:", 
      error.response ? JSON.stringify(error.response.data, null, 2) : error.message
    );
    
    return { 
      success: false, 
      message: error.response?.data?.message || error.message,
      error: error.response?.data?.error || {}
    };
  }
};


// Add this function to your paperService.js file

/**
 * Update the status of a paper
 * @param {string} paperId - The ID of the paper to update
 * @param {string} newStatus - The new status to set (Draft, Submitted, Approved, Rejected)
 * @param {string} rejectionReason - Optional reason for rejection
 * @returns {Promise<Object>} The updated paper data
 */
// Fix for the updatePaperStatus function
export const updatePaperStatus = async (paperId, newStatus, rejectionReason = null) => {
  try {
    const payload = { 
      status: newStatus,
      // Include timestamps based on status
      ...(newStatus === 'Submitted' && { submittedAt: new Date().toISOString() }),
      ...(newStatus === 'Approved' && { approvedAt: new Date().toISOString() }),
      ...(rejectionReason && { rejectionReason }),
    };
    
    console.log(`📤 Updating paper status to ${newStatus}: ${paperId}`);
    
    // Ensure the API endpoint is correctly formed with the base URL
    const response = await axios.patch(
      `${API_URL}/openpapers/${paperId}/status`, 
      payload,
      { 
        headers: {
          ...authHeaders(),
          'Content-Type': 'application/json'
        } 
      }
    );
    
    console.log("✅ Status updated successfully:", response.data);
    return response.data.data || response.data;
  } catch (error) {
    console.error("❌ Error updating paper status:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
    } else if (error.request) {
      console.error("No response received:", error.request);
    }
    return handleAuthError(error);
  }
};

export const getPendingPapers = async (filters = {}) => {
  try {
    // Build query parameters for filtering
    const queryParams = new URLSearchParams();
    
    if (filters.courseName) {
      queryParams.append('courseName', filters.courseName);
    }
    
    if (filters.customSubjectName) {
      queryParams.append('customSubjectName', filters.customSubjectName);
    }
    
    const queryString = queryParams.toString();
    const url = `${API_URL}/pending${queryString ? `?${queryString}` : ''}`;
    
    const response = await axios.get(url, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const approvePaper = async (paperId, comments = '') => {
  try {
    const response = await axios.patch(
      `${API_URL}/${paperId}/approve`, 
      { comments }, 
      { headers: authHeaders() }
    );
    return response.data;
  } catch (error) {
    return handleAuthError(error);
  }
};

export const updatePaper = async (paperId, paperData) => {
  try {
    const response = await fetch(`/api/papers/${paperId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paperData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating paper:', error);
    return { success: false, message: 'Failed to update paper' };
  }
};

/**
 * Update the questions for a specific paper
 * @param {string} paperId - The ID of the paper to update
 * @param {Array} questions - Array of question objects
 * @returns {Promise<Object>} - Response from the server
 */
export const updatePaperQuestions = async (paperId, questions) => {
  try {
    // Use the correct API_URL and match your other functions' pattern
    const response = await axios.put(
      `${API_URL}/papers/${paperId}/questions`, 
      { questions }, 
      { headers: authHeaders() } // Use your existing authHeaders function
    );
    
    console.log("✅ Questions updated successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating paper questions:", error.response?.data || error.message);
    return handleAuthError(error); // Use your existing error handler
  }
};