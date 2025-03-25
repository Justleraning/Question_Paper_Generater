import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./EditQuestion.css";

// Constants
const BLOOM_OPTIONS = [
  "Remember L1", "Understand L1", "Apply L2", 
  "Analyze L2", "Evaluate L3", "Create L3"
];

const UNIT_OPTIONS = ["1", "2", "3", "4", "5"];

const SUBJECT_OPTIONS = [
  { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
  { code: "CA 3233", name: "Java Programming" },
  { code: "CA 3244", name: "Python Basics" },
  { code: "DAV02", name: "Power BI"},
];

function EditQuestion() {
  const navigate = useNavigate();
  const location = useLocation();

  // State for filters (from QuestionPool)
  const [filters, setFilters] = useState({
    subjectCode: "",
    part: "",
    bloomType: "",
    unit: ""
  });

  // State for questions list (from QuestionPool)
  const [subjectName, setSubjectName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for editing panel (from CreateQuestion)
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Initialize filters from URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const subjectCode = queryParams.get('subjectCode');
    const part = queryParams.get('part');
    
    const updatedFilters = {...filters};
    if (subjectCode) updatedFilters.subjectCode = subjectCode;
    if (part) updatedFilters.part = part;
    
    setFilters(updatedFilters);
    
    // Find and set the subject name based on the code
    if (subjectCode) {
      const subject = SUBJECT_OPTIONS.find(s => s.code === subjectCode);
      setSubjectName(subject ? subject.name : "");
    }
  }, [location.search]);

  // Fetch Questions
  const fetchQuestions = useCallback(async () => {
    // Only fetch if we have the required filters
    if (!filters.subjectCode || !filters.part) {
      return;
    }
    
    // Construct query parameters
    const { subjectCode, part, bloomType, unit } = filters;
    
    // Prepare query params
    const params = {
      subjectCode,
      part,
      ...(bloomType && { bloomLevel: bloomType }),
      ...(unit && { unit })
    };

    try {
      setLoading(true);
      setError(null);

      console.log("Fetching questions with params:", params);

      // Fixed: Remove trailing slash in API endpoint
      const response = await axios.get("/api/endsem-questions", { params });

      // Update questions
      const fetchedQuestions = response.data?.questions || [];
      console.log("Fetched questions:", fetchedQuestions);
      setQuestions(fetchedQuestions);

      // Reset expanded state for new questions
      const newExpandedState = fetchedQuestions.reduce((acc, question) => {
        acc[question._id] = false;
        return acc;
      }, {});
      setExpandedQuestions(newExpandedState);

    } catch (err) {
      // Comprehensive error handling
      const errorMessage = 
        err.response?.data?.message || 
        err.message || 
        "Failed to fetch questions";
      
      console.error("Question fetch error:", err);
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Trigger fetch on filter changes
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Toggle question expansion
  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Render expanded question content (from QuestionPool)
  const renderQuestionContent = (question) => {
    const isExpanded = expandedQuestions[question._id];
    
    if (!isExpanded) return null;

    return (
      <div className="din5-expanded-content">
        {/* Full Text */}
        {question.fullText && <p>{question.fullText}</p>}

        {/* MCQ Options */}
        {question.questionType === "mcq" && (
          <ul className="din5-mcq-options">
            {question.options?.map((option, i) => (
              <li key={i}>{option}</li>
            ))}
          </ul>
        )}

        {/* MCQ Image Options */}
        {question.questionType === "mcq-image" && (
          <div className="din5-mcq-image-options">
            {question.options?.map((option, i) => (
              <div key={i} className="din5-mcq-image-option">
                <img 
                  src={option.image} 
                  alt={option.text || `Option ${i + 1}`} 
                />
                {option.text && <p>{option.text}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Question Image */}
        {question.imageUrl && (
          <div className="din5-question-image-container">
            <img 
              src={question.imageUrl} 
              alt="Question visual" 
              className="din5-question-image" 
              onError={(e) => {
                console.error("Image failed to load:", e);
                e.target.src = "/placeholder-image.png"; // Fallback image
                e.target.alt = "Image failed to load";
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // Open edit panel for a question
  const handleEditClick = (question) => {
    // Format the question for editing
    const formattedQuestion = {
      id: question._id,
      bloomLevel: question.bloomLevel,
      unit: question.unit,
      part: `Part ${question.part}`,
      text: question.question,
      imageSource: question.imageUrl ? "url" : "upload",
      questionImage: null,
      questionImageUrl: question.imageUrl || "",
      marks: question.marks || 2
    };
    
    setEditingQuestion(formattedQuestion);
    setShowEditPanel(true);
  };

  // Close edit panel
  const handleCloseEditPanel = () => {
    setShowEditPanel(false);
    setEditingQuestion(null);
    setSaveError(null);
  };

  // Handle changes in edit panel
  const handleEditChange = (field, value) => {
    if (!editingQuestion) return;
    
    setEditingQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle image upload in edit panel
  const handleImageUpload = (file) => {
    if (!editingQuestion) return;
    
    setEditingQuestion(prev => ({
      ...prev,
      questionImage: file,
      questionImageUrl: "",
      imageSource: "upload"
    }));
  };

  // Handle image URL change in edit panel
  const handleImageUrlChange = (url) => {
    if (!editingQuestion) return;
    
    setEditingQuestion(prev => ({
      ...prev,
      questionImageUrl: url,
      questionImage: null,
      imageSource: "url"
    }));
  };

  // Delete image in edit panel
  const handleDeleteImage = () => {
    if (!editingQuestion) return;
    
    setEditingQuestion(prev => ({
      ...prev,
      questionImage: null,
      questionImageUrl: "",
      imageSource: "upload"
    }));
  };

  // Save edited question
  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    
    // Validate question
    if (!editingQuestion.bloomLevel) {
      alert("Bloom Level is required");
      return;
    }
    if (!editingQuestion.unit) {
      alert("Unit is required");
      return;
    }
    if (!editingQuestion.text) {
      alert("Question text is required");
      return;
    }
    
    setSaving(true);
    setSaveError(null);
    
    try {
      // Create FormData for image upload
      const formData = new FormData();
      
      // Add question data to FormData
      formData.append('subjectCode', filters.subjectCode);
      formData.append('part', editingQuestion.part.replace('Part ', '')); // Extract part letter (A, B, C)
      formData.append('question', editingQuestion.text);
      formData.append('bloomLevel', editingQuestion.bloomLevel);
      formData.append('unit', editingQuestion.unit);
      formData.append('marks', editingQuestion.marks || 2);
      
      // Handle image (URL or file)
      if (editingQuestion.imageSource === 'url' && editingQuestion.questionImageUrl) {
        formData.append('image', editingQuestion.questionImageUrl);
      } else if (editingQuestion.imageSource === 'upload' && editingQuestion.questionImage) {
        formData.append('questionImage', editingQuestion.questionImage);
      }
      
      // Save question to database
      const response = await axios.put(`/api/endsem-questions/questions/${editingQuestion.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log("Question updated:", response.data);
      
      
      
      // Close edit panel and refresh questions
      setShowEditPanel(false);
      setEditingQuestion(null);
      fetchQuestions();
      
    } catch (err) {
      console.error("Error updating question:", err);
      setSaveError(err.response?.data?.message || err.message || "Failed to update question");
      alert(`Error: ${err.response?.data?.message || err.message || "Failed to update question"}`);
    } finally {
      setSaving(false);
    }
  };
 
  // Handle filter changes
const handleFilterChange = (field, value) => {
  setFilters(prev => ({
    ...prev,
    [field]: value
  }));
};

  // Delete question
  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete question from database
      await axios.delete(`/api/endsem-questions/questions/${questionId}`);
      
     
      
      // Close edit panel if open and refresh questions
      if (editingQuestion && editingQuestion.id === questionId) {
        setShowEditPanel(false);
        setEditingQuestion(null);
      }
      
      fetchQuestions();
      
    } catch (err) {
      console.error("Error deleting question:", err);
      alert(`Error: ${err.response?.data?.message || err.message || "Failed to delete question"}`);
    } finally {
      setLoading(false);
    }
  };

  // Filter questions based on search term
  const filteredQuestions = questions.filter(question => 
    question.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (question.fullText && question.fullText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="din5-question-pool-container">
      <h1>Edit Questions</h1>

      {/* Filters Section (from QuestionPool) */}
      <div className="din5-header-container">
        {/* Display subject information */}
        <div className="din5-subject-info">
          <div className="din5-display-box">
            <label>Subject Code:</label>
            <div className="din5-display-value">{filters.subjectCode}</div>
          </div>
          
          <div className="din5-display-box">
            <label>Subject Name:</label>
            <div className="din5-display-value">{subjectName}</div>
          </div>
        </div>
        
        <div className="din5-filters-row">
          {/* Part Dropdown */}
          <div className="din5-dropdown-group">
            <label>Part:</label>
            <select 
              className="din5-dropdown" 
              value={filters.part} 
              onChange={(e) => handleFilterChange('part', e.target.value)}
            >
              <option value="A">Part A</option>
              <option value="B">Part B</option>
              <option value="C">Part C</option>
            </select>
          </div>

          {/* Bloom Type Dropdown */}
          <div className="din5-dropdown-group">
            <label>Bloom Type:</label>
            <select 
              className="din5-dropdown" 
              value={filters.bloomType} 
              onChange={(e) => handleFilterChange('bloomType', e.target.value)}
            >
              <option value="">All</option>
              {BLOOM_OPTIONS.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Unit Dropdown */}
          <div className="din5-dropdown-group">
            <label>Unit:</label>
            <select 
              className="din5-dropdown" 
              value={filters.unit} 
              onChange={(e) => handleFilterChange('unit', e.target.value)}
            >
              <option value="">All</option>
              {UNIT_OPTIONS.map((u, index) => (
                <option key={index} value={u}>Unit {u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="din5-search-container">
        <input
          type="text"
          className="din5-search-input"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading and Error Handling */}
      {loading && <p className="din5-loading">Loading questions...</p>}
      {error && <p className="din5-error">{error}</p>}

      {/* Question List */}
      <div className="din5-question-pool">
        <h2>Questions: {filteredQuestions.length}</h2>
        <div className="din5-questions-box">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question, index) => (
              <div key={question._id} className="din5-question">
                {/* Question Header */}
                <div className="din5-question-header">
                  <div className="din5-question-info">
                    <span className="din5-question-text">
                      {index + 1}. {question.question}
                    </span>
                    <span className="din5-question-meta">
                      (Unit {question.unit} - {question.bloomLevel})
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="din5-question-actions">
                    <button 
                      className="din5-edit-btn" 
                      onClick={() => handleEditClick(question)}
                      title="Edit Question"
                    >
                      ✏️
                    </button>
                    <button 
                      className="din5-delete-btn" 
                      onClick={() => handleDeleteQuestion(question._id)}
                      title="Delete Question"
                    >
                      🗑️
                    </button>
                    {(question.fullText || 
                      question.options || 
                      question.hasImage || 
                      question.imageUrl) && (
                      <button 
                        className="din5-expand-btn" 
                        onClick={() => toggleExpand(question._id)}
                        title={expandedQuestions[question._id] ? "Collapse" : "Expand"}
                      >
                        {expandedQuestions[question._id] ? "🔼" : "🔽"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {renderQuestionContent(question)}
              </div>
            ))
          ) : (
            <p className="din5-no-questions">
              {loading ? "Loading..." : searchTerm ? "No matching questions found." : "No questions available."}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="din5-button-group">
        <button 
          className="din5-action-btn" 
          onClick={() => navigate(`/create-question?subjectCode=${encodeURIComponent(filters.subjectCode)}&part=${filters.part}`)}
        >
          Create New Question
        </button>
        <button 
          className="din5-action-btn" 
          onClick={() => navigate(`/question-pool?subjectCode=${encodeURIComponent(filters.subjectCode)}&part=${filters.part}`)}
        >
          Back to Question Pool
        </button>
      </div>

      {/* Floating Edit Panel (similar to CreateQuestion) */}
      {showEditPanel && editingQuestion && (
        <div className="din5-edit-panel-overlay">
          <div className="din5-edit-panel">
            <button className="din5-close-btn" onClick={handleCloseEditPanel}>✖</button>
            <h2 className="din5-panel-title">Edit Question</h2>
            
            {saveError && <div className="din5-error-message">{saveError}</div>}
            
            <div className="din5-dropdown-group-container">
              {/* Bloom Level Dropdown */}
              <div className="din5-dropdown-group">
                <label className="din5-label">Bloom Level:</label>
                <select 
                  className="din5-dropdown" 
                  value={editingQuestion.bloomLevel} 
                  onChange={(e) => handleEditChange('bloomLevel', e.target.value)}
                >
                  <option value="">Select Bloom Level</option>
                  <option value="Remember L1">Remember L1</option>
                  <option value="Understand L1">Understand L1</option>
                  <option value="Apply L2">Apply L2</option>
                  <option value="Analyze L2">Analyze L2</option>
                  <option value="Evaluate L3">Evaluate L3</option>
                  <option value="Create L3">Create L3</option>
                </select>
              </div>

              {/* Unit Dropdown */}
              <div className="din5-dropdown-group">
                <label className="din5-label">Unit:</label>
                <select 
                  className="din5-dropdown" 
                  value={editingQuestion.unit} 
                  onChange={(e) => handleEditChange('unit', e.target.value)}
                >
                  <option value="">Select Unit</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              {/* Part Dropdown */}
              <div className="din5-dropdown-group">
                <label className="din5-label">Part:</label>
                <select 
                  className="din5-dropdown" 
                  value={editingQuestion.part} 
                  onChange={(e) => handleEditChange('part', e.target.value)}
                >
                  <option value="Part A">Part A</option>
                  <option value="Part B">Part B</option>
                  <option value="Part C">Part C</option>
                </select>
              </div>
              
              {/* Marks Dropdown */}
              <div className="din5-dropdown-group">
                <label className="din5-label">Marks:</label>
                <select 
                  className="din5-dropdown" 
                  value={editingQuestion.marks} 
                  onChange={(e) => handleEditChange('marks', parseInt(e.target.value))}
                >
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="10">10</option>
                </select>
              </div>
            </div>

            {/* Question Input */}
            <label className="din5-label">Question Text:</label>
            <textarea 
              className="din5-question-input" 
              placeholder="Enter your question here..." 
              value={editingQuestion.text} 
              onChange={(e) => handleEditChange('text', e.target.value)} 
            />

            {/* Image Upload Options */}
            <div className="din5-image-upload-container">
              <label className="din5-label">Image Source:</label>
              <select 
                className="din5-image-source-dropdown" 
                value={editingQuestion.imageSource} 
                onChange={(e) => handleEditChange('imageSource', e.target.value)}
              >
                <option value="upload">Upload Image</option>
                <option value="url">Image URL</option>
              </select>

              {editingQuestion.imageSource === "upload" ? (
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(e.target.files[0])} 
                />
              ) : (
                <input 
                  type="text" 
                  placeholder="Paste Image URL" 
                  value={editingQuestion.questionImageUrl}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                />
              )}

              {/* Image Preview */}
              {(editingQuestion.questionImage || editingQuestion.questionImageUrl) && (
                <div className="din5-image-preview-frame">
                  <img 
                    src={
                      editingQuestion.questionImage 
                        ? URL.createObjectURL(editingQuestion.questionImage) 
                        : editingQuestion.questionImageUrl
                    } 
                    alt="Uploaded" 
                  />
                  <button 
                    className="din5-delete-image-btn" 
                    onClick={handleDeleteImage}
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>

            <button 
              className="din5-save-btn" 
              onClick={handleSaveQuestion}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Question"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditQuestion;