import React from "react";
import { useNavigate } from "react-router-dom";
import "./SelectedMarks.css";

function SelectMarks() {
  const navigate = useNavigate();

  const handleInputQuestions = () => {
    navigate("/input-questions");
  };

  const handleCreatePaper = () => {
    navigate("/create-paper");
  };

  return (
    <div className="main-container">
      {/* Left Container for "Create Questions" */}
      <div className="marks-container">
        <h1>Create Questions</h1>
        <p>Add questions to the database for exams.</p>
        <button className="action-btn" onClick={handleInputQuestions}>
          Input Questions
        </button>
      </div>

      {/* Right Container for "Create Paper" */}
      <div className="marks-container">
        <h1>Create Paper</h1>
        <p>Generate a paper for exams using selected questions.</p>
        <button className="action-btn" onClick={handleCreatePaper}>
          Create Paper
        </button>
      </div>
    </div>
  );
}

export default SelectMarks;
