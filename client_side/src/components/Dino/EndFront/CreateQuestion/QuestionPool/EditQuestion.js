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
  const [searchTerm, setSearchTerm] = useState("");

  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Modal states
  const [showEditSuccessModal, setShowEditSuccessModal] = useState(false);
  const [showDeleteSuccessModal, setShowDeleteSuccessModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const subjectCode = queryParams.get('subjectCode');
    const part = queryParams.get('part');
    
    const updatedFilters = {...filters};
    if (subjectCode) updatedFilters.subjectCode = subjectCode;
    if (part) updatedFilters.part = part;
    
    setFilters(updatedFilters);
    
    if (subjectCode) {
      const subject = SUBJECT_OPTIONS.find(s => s.code === subjectCode);
      setSubjectName(subject ? subject.name : "");
    }
  }, [location.search]);

  const fetchQuestions = useCallback(async () => {
    if (!filters.subjectCode || !filters.part) return;
    
    const { subjectCode, part, bloomType, unit } = filters;
    const params = {
      subjectCode,
      part,
      ...(bloomType && { bloomLevel: bloomType }),
      ...(unit && { unit })
    };

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get("/api/endsem-questions", { params });
      const fetchedQuestions = response.data?.questions || [];
      setQuestions(fetchedQuestions);
      const newExpandedState = fetchedQuestions.reduce((acc, question) => {
        acc[question._id] = false;
        return acc;
      }, {});
      setExpandedQuestions(newExpandedState);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch questions";
      setError(errorMessage);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const toggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const renderQuestionContent = (question) => {
    const isExpanded = expandedQuestions[question._id];
    if (!isExpanded) return null;

    return (
      <div className="din5-expanded-content">
        {question.fullText && <p>{question.fullText}</p>}
        {question.questionType === "mcq" && (
          <ul className="din5-mcq-options">
            {question.options?.map((option, i) => (
              <li key={i}>{option}</li>
            ))}
          </ul>
        )}
        {question.questionType === "mcq-image" && (
          <div className="din5-mcq-image-options">
            {question.options?.map((option, i) => (
              <div key={i} className="din5-mcq-image-option">
                <img src={option.image} alt={option.text || `Option ${i + 1}`} />
                {option.text && <p>{option.text}</p>}
              </div>
            ))}
          </div>
        )}
        {question.imageUrl && (
          <div className="din5-question-image-container">
            <img 
              src={question.imageUrl} 
              alt="Question visual" 
              className="din5-question-image" 
              onError={(e) => { e.target.src = "/placeholder-image.png"; }}
            />
          </div>
        )}
      </div>
    );
  };

  const handleEditClick = (question) => {
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

  const handleCloseEditPanel = () => {
    setShowEditPanel(false);
    setEditingQuestion(null);
    setSaveError(null);
  };

  const handleEditChange = (field, value) => {
    if (!editingQuestion) return;
    setEditingQuestion(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (file) => {
    if (!editingQuestion) return;
    setEditingQuestion(prev => ({
      ...prev,
      questionImage: file,
      questionImageUrl: "",
      imageSource: "upload"
    }));
  };

  const handleImageUrlChange = (url) => {
    if (!editingQuestion) return;
    setEditingQuestion(prev => ({
      ...prev,
      questionImageUrl: url,
      questionImage: null,
      imageSource: "url"
    }));
  };

  const handleDeleteImage = () => {
    if (!editingQuestion) return;
    setEditingQuestion(prev => ({
      ...prev,
      questionImage: null,
      questionImageUrl: "",
      imageSource: "upload"
    }));
  };

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return;
    
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
      const formData = new FormData();
      formData.append('subjectCode', filters.subjectCode);
      formData.append('part', editingQuestion.part.replace('Part ', ''));
      formData.append('question', editingQuestion.text);
      formData.append('bloomLevel', editingQuestion.bloomLevel);
      formData.append('unit', editingQuestion.unit);
      formData.append('marks', editingQuestion.marks || 2);
      
      if (editingQuestion.imageSource === 'url' && editingQuestion.questionImageUrl) {
        formData.append('image', editingQuestion.questionImageUrl);
      } else if (editingQuestion.imageSource === 'upload' && editingQuestion.questionImage) {
        formData.append('questionImage', editingQuestion.questionImage);
      }
      
      const response = await axios.put(`/api/endsem-questions/questions/${editingQuestion.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log("Question updated:", response.data);
      setShowEditPanel(false);
      setEditingQuestion(null);
      setShowEditSuccessModal(true);
      fetchQuestions();
    } catch (err) {
      setSaveError(err.response?.data?.message || err.message || "Failed to update question");
      alert(`Error: ${err.response?.data?.message || err.message || "Failed to update question"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteQuestion = (questionId) => {
    setQuestionToDelete(questionId);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteQuestion = async () => {
    if (!questionToDelete) return;

    try {
      setLoading(true);
      await axios.delete(`/api/endsem-questions/questions/${questionToDelete}`);
      if (editingQuestion && editingQuestion.id === questionToDelete) {
        setShowEditPanel(false);
        setEditingQuestion(null);
      }
      fetchQuestions();
      setShowDeleteConfirmModal(false);
      setShowDeleteSuccessModal(true);
    } catch (err) {
      alert(`Error: ${err.response?.data?.message || err.message || "Failed to delete question"}`);
    } finally {
      setLoading(false);
      setQuestionToDelete(null);
    }
  };

  const cancelDeleteQuestion = () => {
    setShowDeleteConfirmModal(false);
    setQuestionToDelete(null);
  };

  const filteredQuestions = questions.filter(question => 
    question.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (question.fullText && question.fullText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleBackClick = () => {
    navigate(`/question-pool?subjectCode=${encodeURIComponent(filters.subjectCode)}&part=${filters.part}`);
  };

  const handleEditSuccessOkay = () => {
    setShowEditSuccessModal(false);
  };

  const handleDeleteSuccessOkay = () => {
    setShowDeleteSuccessModal(false);
  };

  return (
    <div className="din5-question-pool-container">
      <div className="din5-header">
        <h1>Edit Questions</h1>
        <button className="din5-back-btn" onClick={handleBackClick}>← Back</button>
      </div>

      <div className="din5-header-container">
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

      <div className="din5-search-container">
        <input
          type="text"
          className="din5-search-input"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading && <p className="din5-loading">Loading questions...</p>}
      {error && <p className="din5-error">{error}</p>}

      <div className="din5-question-pool">
        <h2>Questions: {filteredQuestions.length}</h2>
        <div className="din5-questions-box">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question, index) => (
              <div key={question._id} className="din5-question">
                <div className="din5-question-header">
                  <div className="din5-question-info">
                    <span className="din5-question-text">
                      {index + 1}. {question.question}
                    </span>
                    <span className="din5-question-meta">
                      (Unit {question.unit} - {question.bloomLevel})
                    </span>
                  </div>
                  <div className="din5-question-actions">
                    <button className="din5-edit-btn" onClick={() => handleEditClick(question)} title="Edit Question">✏️</button>
                    <button className="din5-delete-btn" onClick={() => handleDeleteQuestion(question._id)} title="Delete Question">🗑️</button>
                    {(question.fullText || question.options || question.hasImage || question.imageUrl) && (
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

      {showEditPanel && editingQuestion && (
        <div className="din5-edit-panel-overlay">
          <div className="din5-edit-panel">
            <button className="din5-close-btn" onClick={handleCloseEditPanel}>✖</button>
            <h2 className="din5-panel-title">Edit Question</h2>
            
            {saveError && <div className="din5-error-message">{saveError}</div>}
            
            <div className="din5-dropdown-group-container">
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

            <label className="din5-label">Question Text:</label>
            <textarea 
              className="din5-question-input" 
              placeholder="Enter your question here..." 
              value={editingQuestion.text} 
              onChange={(e) => handleEditChange('text', e.target.value)} 
            />

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
                  <button className="din5-delete-image-btn" onClick={handleDeleteImage}>✖</button>
                </div>
              )}
            </div>

            <button className="din5-save-btn" onClick={handleSaveQuestion} disabled={saving}>
              {saving ? "Saving..." : "Save Question"}
            </button>
          </div>
        </div>
      )}

      {/* Edit Success Modal */}
      {showEditSuccessModal && (
        <div className="din5-modal-overlay">
          <div className="din5-modal-content din5-success-modal-content">
            <h3>Question Edited Successfully</h3>
            <p>The question has been updated successfully.</p>
            <div className="din5-modal-buttons">
              <button className="din5-modal-btn din5-success-modal-btn" onClick={handleEditSuccessOkay}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Success Modal */}
      {showDeleteSuccessModal && (
        <div className="din5-modal-overlay">
          <div className="din5-modal-content din5-success-modal-content">
            <h3>Question Deleted Successfully</h3>
            <p>The question has been deleted successfully.</p>
            <div className="din5-modal-buttons">
              <button className="din5-modal-btn din5-success-modal-btn" onClick={handleDeleteSuccessOkay}>
                Okay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="din5-modal-overlay">
          <div className="din5-modal-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this question?</p>
            <div className="din5-modal-buttons">
              <button className="din5-modal-btn din5-modal-cancel" onClick={cancelDeleteQuestion}>
                Cancel
              </button>
              <button className="din5-modal-btn din5-modal-confirm" onClick={confirmDeleteQuestion}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditQuestion;