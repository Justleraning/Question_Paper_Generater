import React from "react";
import { useNavigate } from "react-router-dom";
import "./SelectedMarks.css";

function SelectMarks() {
  const navigate = useNavigate();

  const handleInputQuestions = () => {
    navigate("/input-questions");
  };

  const handleCreatePaper = () => {
    navigate("/exam-details");
  };

  return (
    <div className="din1-main-container">
      {/* Left Container for "Create Questions" */}
      <div className="din1-marks-container">
        <h1 className="din1-heading">Create Questions</h1>
        <p className="din1-description">Add questions to the database for exams.</p>
        <button className="din1-action-btn" onClick={handleInputQuestions}>
          Input Questions
        </button>
      </div>

      {/* Right Container for "Create Paper" */}
      <div className="din1-marks-container">
        <h1 className="din1-heading">Create Paper</h1>
        <p className="din1-description">Generate a paper for exams using selected questions.</p>
        <button className="din1-action-btn" onClick={handleCreatePaper}>
          Create Paper
        </button>
      </div>
    </div>
  );
}

export default SelectMarks;