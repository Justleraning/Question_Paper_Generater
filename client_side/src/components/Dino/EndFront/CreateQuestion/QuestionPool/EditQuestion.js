import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./EditQuestion.css";

function EditQuestion() {
  const location = useLocation();
  const navigate = useNavigate();

  // Fetching questions (dummy for now, later from DB)
  const initialQuestions = location.state?.updatedQuestions || [
    { id: 1, text: "What is Java?", bloomType: "Understand", questionType: "Descriptive", images: { questionImage: null } },
    { id: 2, text: "What is OOP?", bloomType: "Apply", questionType: "MCQ", options: ["Object Oriented Programming", "Object Offering Program", "Only On Paper", "None"], images: { questionImage: null, optionImages: [null, null, null, null] } },
    { id: 3, text: "What is Python used for?", bloomType: "Apply", questionType: "Descriptive", images: { questionImage: null } }
  ];

  const [questions, setQuestions] = useState(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Start Editing a Question
  const handleEditQuestion = (id) => {
    const questionToEdit = questions.find(q => q.id === id);
    setEditingQuestion({ ...questionToEdit });
  };

  // Handle Question Text Change
  const handleQuestionChange = (value) => {
    setEditingQuestion({ ...editingQuestion, text: value });
  };

  // Handle Image Upload
  const handleImageUpload = (file, type, optionIndex = null) => {
    if (type === "question") {
      setEditingQuestion({ ...editingQuestion, images: { ...editingQuestion.images, questionImage: file } });
    } else if (type === "option" && optionIndex !== null) {
      const updatedOptionImages = [...editingQuestion.images.optionImages];
      updatedOptionImages[optionIndex] = file;
      setEditingQuestion({ ...editingQuestion, images: { ...editingQuestion.images, optionImages: updatedOptionImages } });
    }
  };

  // Handle Save Question Changes
  const handleSaveQuestion = () => {
    setQuestions(questions.map(q => (q.id === editingQuestion.id ? editingQuestion : q)));
    setEditingQuestion(null);
    alert("Question saved successfully!");
  };

  // Cancel Editing
  const handleCancelEdit = () => {
    setEditingQuestion(null);
  };

  return (
    <div className="edit-question-container">
      <h1 className="page-title">Edit Questions</h1>

      {editingQuestion ? (
        <div className="edit-form">
          <h3>Editing Question</h3>
          <textarea className="edit-textbox" value={editingQuestion.text} onChange={(e) => handleQuestionChange(e.target.value)} />

          {editingQuestion.images.questionImage && (
            <div className="image-preview">
              <img src={URL.createObjectURL(editingQuestion.images.questionImage)} alt="Uploaded" />
              <button className="delete-image-btn" onClick={() => handleImageUpload(null, "question")}>Remove Image</button>
            </div>
          )}

          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e.target.files[0], "question")} />

          <div className="edit-buttons">
            <button className="save-btn" onClick={handleSaveQuestion}>Save</button>
            <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="question-list">
          {questions.map((q) => (
            <div key={q.id} className="question-box">
              <p><strong>{q.bloomType}</strong> - {q.text}</p>
              <button className="edit-btn" onClick={() => handleEditQuestion(q.id)}>✏️</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EditQuestion;
