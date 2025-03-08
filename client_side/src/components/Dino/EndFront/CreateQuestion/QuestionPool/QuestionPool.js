import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./QuestionPool.css";

// Constants
const BLOOM_OPTIONS = [
  "Remember", "Understand", "Apply", 
  "Analyze", "Evaluate", "Create"
];

const UNIT_OPTIONS = ["1", "2", "3", "4", "5"];

const SUBJECT_OPTIONS = [
  { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
  { code: "CA 3233", name: "Java Programming" },
  { code: "CA 3244", name: "Python Basics" },
];

function QuestionPool() {
  const navigate = useNavigate();
  const location = useLocation();

  // State Management
  const [filters, setFilters] = useState({
    subjectCode: "",
    part: "",
    bloomType: "",
    unit: ""
  });

  const [subjectName, setSubjectName] = useState("");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Render expanded question content
  const renderQuestionContent = (question) => {
    const isExpanded = expandedQuestions[question._id];
    
    if (!isExpanded) return null;

    return (
      <div className="din3-expanded-content">
        {/* Full Text */}
        {question.fullText && <p>{question.fullText}</p>}

        {/* MCQ Options */}
        {question.questionType === "mcq" && (
          <ul className="din3-mcq-options">
            {question.options?.map((option, i) => (
              <li key={i}>{option}</li>
            ))}
          </ul>
        )}

        {/* MCQ Image Options */}
        {question.questionType === "mcq-image" && (
          <div className="din3-mcq-image-options">
            {question.options?.map((option, i) => (
              <div key={i} className="din3-mcq-image-option">
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
        {question.image && (
          <img 
            src={question.image} 
            alt="Question" 
            className="din3-question-image" 
          />
        )}
      </div>
    );
  };

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="din3-question-pool-container">
      <h1>Question Pool</h1>

      {/* Filters Section */}
      <div className="din3-header-container">
        {/* Display subject information */}
        <div className="din3-subject-info">
          <div className="din3-display-box">
            <label>Subject Code:</label>
            <div className="din3-display-value">{filters.subjectCode}</div>
          </div>
          
          <div className="din3-display-box">
            <label>Subject Name:</label>
            <div className="din3-display-value">{subjectName}</div>
          </div>
        </div>
        
        <div className="din3-filters-row">
          {/* Part Dropdown */}
          <div className="din3-dropdown-group">
            <label>Part:</label>
            <select 
              className="din3-dropdown" 
              value={filters.part} 
              onChange={(e) => handleFilterChange('part', e.target.value)}
            >
              <option value="A">Part A</option>
              <option value="B">Part B</option>
              <option value="C">Part C</option>
            </select>
          </div>

          {/* Bloom Type Dropdown */}
          <div className="din3-dropdown-group">
            <label>Bloom Type:</label>
            <select 
              className="din3-dropdown" 
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
          <div className="din3-dropdown-group">
            <label>Unit:</label>
            <select 
              className="din3-dropdown" 
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

      {/* Loading and Error Handling */}
      {loading && <p className="din3-loading">Loading questions...</p>}
      {error && <p className="din3-error">{error}</p>}

      {/* Question List */}
      <div className="din3-question-pool">
        <h2>Questions:</h2>
        <div className="din3-questions-box">
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <div key={question._id} className="din3-question">
                {/* Question Header */}
                <div className="din3-question-header">
                  <div className="din3-question-info">
                    <span className="din3-question-text">
                      {index + 1}. {question.question}
                    </span>
                    <span className="din3-question-meta">
                      (Unit {question.unit} - {question.bloomLevel})
                    </span>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  {(question.fullText || 
                    question.options || 
                    question.image) && (
                    <button 
                      className="din3-expand-btn" 
                      onClick={() => toggleExpand(question._id)}
                    >
                      {expandedQuestions[question._id] ? "🔼" : "🔽"}
                    </button>
                  )}
                </div>

                {/* Expanded Content */}
                {renderQuestionContent(question)}
              </div>
            ))
          ) : (
            <p className="din3-no-questions">
              {loading ? "Loading..." : "No questions available."}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="din3-button-group">
        <button 
          className="din3-action-btn" 
          onClick={() => navigate("/create-question")}
        >
          Create Question
        </button>
        <button 
          className="din3-action-btn" 
          onClick={() => navigate("/edit-question")}
        >
          Edit Questions
        </button>
      </div>
    </div>
  );
}

export default QuestionPool;