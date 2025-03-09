import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateQuestion.css";

function CreateQuestion() {
  const [subjectCode, setSubjectCode] = useState("CA 3222");
  const [subjectName, setSubjectName] = useState("C# AND DOT NET FRAMEWORK");
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      bloomType: "",
      unit: "",
      part: "Part A",
      text: "",
      imageSource: "upload", // Default image source
      questionImage: null,
      questionImageUrl: ""
    }
  ]);

  const navigate = useNavigate();

  // Handle Bloom Type Change
  const handleBloomTypeChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, bloomType: value } : q)));
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
        bloomType: "",
        unit: "",
        part: "Part A",
        text: "",
        imageSource: "upload",
        questionImage: null,
        questionImageUrl: ""
      }
    ]);
  };

  // Save Questions & Redirect to Question Pool
  const handleSaveQuestions = () => {
    console.log("Saved Questions:", questions);
    alert("Questions saved successfully!");
    navigate("/question-pool", { state: { updatedQuestions: questions } });
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
              onChange={(e) => setSubjectCode(e.target.value)} 
              readOnly 
            />
          </div>
          <div className="din4-subject-name">
            <label>Subject Name:</label>
            <input 
              type="text" 
              value={subjectName} 
              onChange={(e) => setSubjectName(e.target.value)} 
              readOnly 
            />
          </div>
        </div>

        {questions.map((q) => (
          <div key={q.id} className="din4-question-container">
            <button className="din4-delete-btn" onClick={() => deleteQuestion(q.id)}>✖</button>
              
            {/* Bloom Type, Unit, and Part Dropdowns */}
            <div className="din4-dropdown-group-container">
              {/* Bloom Type Dropdown */}
              <div className="din4-dropdown-group">
                <label className="din4-label">Bloom Type:</label>
                <select 
                  className="din4-dropdown" 
                  value={q.bloomType} 
                  onChange={(e) => handleBloomTypeChange(q.id, e.target.value)}
                >
                  <option value="">Select Bloom Type</option>
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
              <select 
                className="din4-image-source-dropdown"
                value={q.imageSource}
                onChange={(e) => handleImageSourceChange(q.id, e.target.value)}
              >
                <option value="upload">Upload Image</option>
                <option value="url">Paste URL</option>
              </select>

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
        <button className="din4-save-btn" onClick={handleSaveQuestions}>Save Questions</button>
      </div>
    </div>
  );
}

export default CreateQuestion;