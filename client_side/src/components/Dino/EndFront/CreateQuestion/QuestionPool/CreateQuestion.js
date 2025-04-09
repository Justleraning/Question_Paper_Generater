import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./CreateQuestion.css";

function CreateQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const SUBJECT_OPTIONS = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
    { code: "DAV02", name: "Power BI"},
  ];
  
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [defaultPart, setDefaultPart] = useState("A");
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      bloomLevel: "",
      unit: "",
      part: "Part A",
      text: "",
      imageSource: "upload",
      questionImage: null,
      questionImageUrl: "",
      marks: 2
    }
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  // New state for success modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const subjectCodeParam = queryParams.get('subjectCode');
    const partParam = queryParams.get('part');
    
    if (subjectCodeParam) {
      setSubjectCode(subjectCodeParam);
      const subject = SUBJECT_OPTIONS.find(s => s.code === subjectCodeParam);
      if (subject) {
        setSubjectName(subject.name);
      }
    }
    
    if (partParam) {
      setDefaultPart(partParam);
      setQuestions(prevQuestions => 
        prevQuestions.map((q, idx) => 
          idx === 0 ? { ...q, part: `Part ${partParam}` } : q
        )
      );
    }
  }, [location.search]);

  const handleBloomLevelChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, bloomLevel: value } : q)));
  };

  const handleUnitChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, unit: value } : q)));
  };

  const handlePartChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, part: value } : q)));
  };

  const handleQuestionChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text: value } : q)));
  };
  
  const handleMarksChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, marks: parseInt(value) || 2 } : q)));
  };

  const handleImageSourceChange = (id, source) => {
    setQuestions(questions.map((q) => 
      q.id === id 
        ? { 
            ...q, 
            imageSource: source, 
            questionImage: source === "upload" ? q.questionImage : null,
            questionImageUrl: source === "url" ? q.questionImageUrl : ""
          } 
        : q
    ));
  };

  const handleImageUpload = (id, file) => {
    setQuestions(questions.map((q) => 
      q.id === id 
        ? { ...q, questionImage: file, questionImageUrl: "" } 
        : q
    ));
  };

  const handleImageUrlChange = (id, url) => {
    setQuestions(questions.map((q) => 
      q.id === id 
        ? { ...q, questionImageUrl: url, questionImage: null } 
        : q
    ));
  };

  const handleDeleteImage = (id) => {
    setQuestions(questions.map((q) => 
      q.id === id 
        ? { 
            ...q, 
            questionImage: null, 
            questionImageUrl: "", 
            imageSource: "upload" 
          } 
        : q
    ));
  };

  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        bloomLevel: "",
        unit: "",
        part: `Part ${defaultPart}`,
        text: "",
        imageSource: "upload",
        questionImage: null,
        questionImageUrl: "",
        marks: 2
      }
    ]);
  };

  const validateQuestion = (question) => {
    if (!question.bloomLevel) return "Bloom Level is required";
    if (!question.unit) return "Unit is required";
    if (!question.text) return "Question text is required";
    return null;
  };

  const handleBackClick = () => {
    if (questions.length > 0 && questions.some(q => q.text.trim() !== "")) {
      setShowConfirmation(true);
    } else {
      navigate(-1);
    }
  };

  const handleConfirmBack = () => {
    setShowConfirmation(false);
    navigate(-1);
  };

  const handleCancelBack = () => {
    setShowConfirmation(false);
  };

  const handleSaveQuestions = async () => {
    for (const question of questions) {
      const validationError = validateQuestion(question);
      if (validationError) {
        alert(`Validation error: ${validationError}`);
        return;
      }
    }
    
    setSaving(true);
    setError(null);
    const savedQuestions = [];
    
    try {
      for (const question of questions) {
        const formData = new FormData();
        formData.append('subjectCode', subjectCode);
        formData.append('part', question.part.replace('Part ', ''));
        formData.append('question', question.text);
        formData.append('bloomLevel', question.bloomLevel);
        formData.append('unit', question.unit);
        formData.append('marks', question.marks || 2);
        
        if (question.imageSource === 'url' && question.questionImageUrl) {
          formData.append('imageUrl', question.questionImageUrl);
        } else if (question.imageSource === 'upload' && question.questionImage) {
          formData.append('questionImage', question.questionImage);
        }
        
        const response = await axios.post('/api/endsem-questions/questions', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log("Question saved:", response.data);
        savedQuestions.push(response.data.question);
      }
      
      // Show success modal with the count of saved questions
      setSavedCount(savedQuestions.length);
      setShowSuccessModal(true);
      
    } catch (err) {
      console.error("Error saving questions:", err);
      setError(err.response?.data?.message || err.message || "Failed to save questions");
      alert(`Error: ${err.response?.data?.message || err.message || "Failed to save questions"}`);
    } finally {
      setSaving(false);
    }
  };

  // Handle Okay button click in success modal
  const handleSuccessOkay = () => {
    setShowSuccessModal(false);
    navigate(`/question-pool?subjectCode=${encodeURIComponent(subjectCode)}&part=${defaultPart}`, { 
      state: { updatedQuestions: questions }
    });
  };

  return (
    <div className="din4-outer-container">
      <div className="din4-inner-container">
        <div className="din4-header">
          <h1 className="din4-page-title">Create Questions</h1>
          <button className="din4-back-btn" onClick={handleBackClick}>← Back</button>
        </div>
        
        <div className="din4-subject-info">
          <div className="din4-subject-code">
            <label>Subject Code:</label>
            <input type="text" value={subjectCode} readOnly />
          </div>
          <div className="din4-subject-name">
            <label>Subject Name:</label>
            <input type="text" value={subjectName} readOnly />
          </div>
        </div>

        {error && <div className="din4-error-message">{error}</div>}

        {questions.map((q) => (
          <div key={q.id} className="din4-question-container">
            <button className="din4-delete-btn" onClick={() => deleteQuestion(q.id)}>✖</button>
            <div className="din4-dropdown-group-container">
              <div className="din4-dropdown-group">
                <label className="din4-label">Bloom Level:</label>
                <select 
                  className="din4-dropdown" 
                  value={q.bloomLevel} 
                  onChange={(e) => handleBloomLevelChange(q.id, e.target.value)}
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
              <div className="din4-dropdown-group">
                <label className="din4-label">Unit:</label>
                <select 
                  className="din4-dropdown" 
                  value={q.unit} 
                  onChange={(e) => handleUnitChange(q.id, e.target.value)}
                >
                  <option value="">Select Unit</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
              <div className="din4-dropdown-group">
                <label className="din4-label">Part:</label>
                <select 
                  className="din4-dropdown" 
                  value={q.part} 
                  onChange={(e) => handlePartChange(q.id, e.target.value)}
                >
                  <option value="Part A">Part A</option>
                  <option value="Part B">Part B</option>
                  <option value="Part C">Part C</option>
                </select>
              </div>
              <div className="din4-dropdown-group">
                <label className="din4-label">Marks:</label>
                <select 
                  className="din4-dropdown" 
                  value={q.marks} 
                  onChange={(e) => handleMarksChange(q.id, e.target.value)}
                >
                  <option value="2">2</option>
                  <option value="4">4</option>
                  <option value="10">10</option>
                </select>
              </div>
            </div>    
            <label className="din4-label">Type Question:</label>
            <textarea 
              className="din4-question-input" 
              placeholder="Enter your question here..." 
              value={q.text} 
              onChange={(e) => handleQuestionChange(q.id, e.target.value)} 
            />
            <div className="din4-image-upload-container">
              <label className="din4-label">Upload Image:</label>
              {q.imageSource === "upload" ? (
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => handleImageUpload(q.id, e.target.files[0])} 
                />
              ) : (
                <input 
                  type="text" 
                  placeholder="Paste Image URL" 
                  value={q.questionImageUrl}
                  onChange={(e) => handleImageUrlChange(q.id, e.target.value)}
                />
              )}
              {(q.questionImage || q.questionImageUrl) && (
                <div className="din4-image-preview-frame">
                  <img 
                    src={
                      q.questionImage 
                        ? URL.createObjectURL(q.questionImage) 
                        : q.questionImageUrl
                    } 
                    alt="Uploaded" 
                  />
                  <button 
                    className="din4-delete-image-btn" 
                    onClick={() => handleDeleteImage(q.id)}
                  >
                    ✖
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <button className="din4-add-btn" onClick={addNewQuestion}>+ Add Question</button>
        <button 
          className="din4-save-btn" 
          onClick={handleSaveQuestions}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Questions"}
        </button>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="din4-modal-overlay">
          <div className="din4-modal-content">
            <h3>Unsaved Changes</h3>
            <p>Any unsaved questions will not be saved. Are you sure you want to go back?</p>
            <div className="din4-modal-buttons">
              <button 
                className="din4-modal-btn din4-modal-cancel" 
                onClick={handleCancelBack}
              >
                No, Stay Here
              </button>
              <button 
                className="din4-modal-btn din4-modal-confirm" 
                onClick={handleConfirmBack}
              >
                Yes, Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="din4-modal-overlay">
          <div className="din4-modal-content">
            <h3 style={{ color: '#2ecc71' }}>Questions Saved</h3>
            <p>{savedCount} question{savedCount !== 1 ? 's' : ''} saved successfully!</p>
            <div className="din4-modal-buttons">
              <button 
                className="din4-modal-btn din4-modal-confirm" 
                style={{ backgroundColor: '#2ecc71', border: '1px solid #27ae60' }}
                onClick={handleSuccessOkay}
              >
                Okay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateQuestion;