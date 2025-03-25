import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./CreateQuestion.css";

function CreateQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Subject options for lookup
  const SUBJECT_OPTIONS = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
    { code: "DAV02", name: "Power BI"},
  ];
  
  // State for subject details
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [defaultPart, setDefaultPart] = useState("A");
  
  // State for questions
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
  
  // Loading and error states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize from URL params on component mount
  useEffect(() => {
    // Parse URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const subjectCodeParam = queryParams.get('subjectCode');
    const partParam = queryParams.get('part');
    
    // Set subject code if present in URL
    if (subjectCodeParam) {
      setSubjectCode(subjectCodeParam);
      
      // Look up subject name based on subject code
      const subject = SUBJECT_OPTIONS.find(s => s.code === subjectCodeParam);
      if (subject) {
        setSubjectName(subject.name);
      }
    }
    
    // Set default part if present in URL
    if (partParam) {
      setDefaultPart(partParam);
      
      // Update the first question's part
      setQuestions(prevQuestions => 
        prevQuestions.map((q, idx) => 
          idx === 0 ? { ...q, part: `Part ${partParam}` } : q
        )
      );
    }
  }, [location.search]);

  // Handle Bloom Level Change
  const handleBloomLevelChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, bloomLevel: value } : q)));
  };

  // Handle Unit Change
  const handleUnitChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, unit: value } : q)));
  };

  // Handle Part Change
  const handlePartChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, part: value } : q)));
  };

  // Handle Question Text Change
  const handleQuestionChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text: value } : q)));
  };
  
  // Handle Marks Change
  const handleMarksChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, marks: parseInt(value) || 2 } : q)));
  };

  // Handle Image Source Change
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

  // Handle Image Upload
  const handleImageUpload = (id, file) => {
    setQuestions(questions.map((q) => 
      q.id === id 
        ? { ...q, questionImage: file, questionImageUrl: "" } 
        : q
    ));
  };

  // Handle Image URL Input
  const handleImageUrlChange = (id, url) => {
    setQuestions(questions.map((q) => 
      q.id === id 
        ? { ...q, questionImageUrl: url, questionImage: null } 
        : q
    ));
  };

  // Delete Image
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

  // Delete Question
  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Add New Question
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

  // Validate a question
  const validateQuestion = (question) => {
    if (!question.bloomLevel) return "Bloom Level is required";
    if (!question.unit) return "Unit is required";
    if (!question.text) return "Question text is required";
    return null;
  };

  // Save Questions to Database & Redirect to Question Pool
  const handleSaveQuestions = async () => {
    // Validate all questions first
    for (const question of questions) {
      const validationError = validateQuestion(question);
      if (validationError) {
        alert(`Validation error: ${validationError}`);
        return;
      }
    }
    
    setSaving(true);
    setError(null);
    
    // Track saved questions to return to QuestionPool
    const savedQuestions = [];
    
    try {
      // Save each question individually
      for (const question of questions) {
        // Create FormData for image upload
        const formData = new FormData();
        
        // Add question data to FormData
        formData.append('subjectCode', subjectCode);
        formData.append('part', question.part.replace('Part ', '')); // Extract part letter (A, B, C)
        formData.append('question', question.text);
        formData.append('bloomLevel', question.bloomLevel);
        formData.append('unit', question.unit);
        formData.append('marks', question.marks || 2);
        
        // Handle image (URL or file)
        if (question.imageSource === 'url' && question.questionImageUrl) {
          formData.append('imageUrl', question.questionImageUrl);
        } else if (question.imageSource === 'upload' && question.questionImage) {
          formData.append('questionImage', question.questionImage);
        }
        
        // Save question to database
        const response = await axios.post('/api/endsem-questions/questions', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log("Question saved:", response.data);
        savedQuestions.push(response.data.question);
      }
      
    
      
      // Navigate back to question pool
      navigate(`/question-pool?subjectCode=${encodeURIComponent(subjectCode)}&part=${defaultPart}`, { 
        state: { 
          updatedQuestions: savedQuestions
        }
      });
      
    } catch (err) {
      console.error("Error saving questions:", err);
      setError(err.response?.data?.message || err.message || "Failed to save questions");
      alert(`Error: ${err.response?.data?.message || err.message || "Failed to save questions"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="din4-outer-container">
      <div className="din4-inner-container">
        <h1 className="din4-page-title">Create Questions</h1>
        
        {/* Subject and Subject Code Display */}
        <div className="din4-subject-info">
          <div className="din4-subject-code">
            <label>Subject Code:</label>
            <input 
              type="text" 
              value={subjectCode} 
              readOnly 
            />
          </div>
          <div className="din4-subject-name">
            <label>Subject Name:</label>
            <input 
              type="text" 
              value={subjectName} 
              readOnly 
            />
          </div>
        </div>

        {error && <div className="din4-error-message">{error}</div>}

        {questions.map((q) => (
          <div key={q.id} className="din4-question-container">
            <button className="din4-delete-btn" onClick={() => deleteQuestion(q.id)}>✖</button>
              
            {/* Bloom Level, Unit, Part and Marks Dropdowns */}
            <div className="din4-dropdown-group-container">
              {/* Bloom Level Dropdown */}
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

              {/* Unit Dropdown */}
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

              {/* Part Dropdown */}
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
              
              {/* Marks Dropdown */}
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

            {/* Question Input */}
            <label className="din4-label">Type Question:</label>
            <textarea 
              className="din4-question-input" 
              placeholder="Enter your question here..." 
              value={q.text} 
              onChange={(e) => handleQuestionChange(q.id, e.target.value)} 
            />

            {/* Image Upload Options */}
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

              {/* Image Preview */}
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
    </div>
  );
}

export default CreateQuestion;