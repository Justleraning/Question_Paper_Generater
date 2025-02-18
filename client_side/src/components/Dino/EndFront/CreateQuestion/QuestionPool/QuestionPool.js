import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./QuestionPool.css";

function QuestionPool() {
  const navigate = useNavigate();

  // State Variables
  const [subjectCode, setSubjectCode] = useState("CA 3222");
  const [subjectName, setSubjectName] = useState("C# AND DOT NET FRAMEWORK");
  const [selectedPart, setSelectedPart] = useState("A");
  const [bloomType, setBloomType] = useState("");
  const [unit, setUnit] = useState("");
  const [questions, setQuestions] = useState([]);

  // Bloom's Taxonomy Options
  const bloomOptions = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];

  // Unit Options
  const unitOptions = ["1", "2", "3", "4", "5"];

  // Subject Options
  const subjectOptions = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
  ];

  // Dummy Data for Questions
  const dummyQuestions = useMemo(() => ({
    "CA 3222": {
      A: [
        { bloom: "Remember", question: "What is AWS?", unit: "1" },
        { bloom: "Analyze", question: "Explain features of C#.", unit: "2" },
        { bloom: "Understand", question: "Explain polymorphism in C#.", unit: "3" },
        { bloom: "Apply", question: "Write a C# program for a calculator.", unit: "4" },
        { bloom: "Evaluate", question: "Discuss the advantages of C#.", unit: "5" },
      ],
      B: [
        { bloom: "Understand", question: "What is .NET Framework?", unit: "2" },
        { bloom: "Evaluate", question: "Discuss garbage collection in C#.", unit: "3" },
      ],
      C: [
        { bloom: "Apply", question: "Write a program using C# classes.", unit: "1" },
      ],
    },
    "CA 3233": {
      A: [
        { bloom: "Remember", question: "What is Java?", unit: "1" },
        { bloom: "Analyze", question: "Explain JVM architecture.", unit: "2" },
      ],
    },
  }), []);

  // Filtering Questions Based on Selected Criteria
  useEffect(() => {
    const filteredQuestions =
      dummyQuestions[subjectCode]?.[selectedPart]?.filter(
        (q) => (!bloomType || q.bloom === bloomType) && (!unit || q.unit === unit)
      ) || [];
    setQuestions(filteredQuestions);
  }, [subjectCode, selectedPart, bloomType, unit, dummyQuestions]);

  // Handle Subject Selection
  const handleSubjectChange = (e) => {
    const selectedCode = e.target.value;
    const selectedSubject = subjectOptions.find((subject) => subject.code === selectedCode);
    setSubjectCode(selectedCode);
    setSubjectName(selectedSubject ? selectedSubject.name : "");
  };

  // Navigation Handlers
  const handleCreateQuestion = () => navigate("/create-question");
  const handleEditQuestion = () => navigate("/edit-question");

  return (
    <div className="question-pool-container">
      <h1>Question Pool</h1>
      <div className="header-container">
        {/* Subject Code Dropdown */}
        <div className="dropdown-group">
          <label>Subject Code:</label>
          <input list="subjectList" className="dropdown" value={subjectCode} onChange={handleSubjectChange} />
          <datalist id="subjectList">
            {subjectOptions.map((subject, index) => (
              <option key={index} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </datalist>
        </div>

        {/* Subject Name ReadOnly Input */}
        <div className="dropdown-group">
          <label>Subject Name:</label>
          <input type="text" className="dropdown" value={subjectName} readOnly />
        </div>

        {/* Part Dropdown */}
        <div className="dropdown-group">
          <label>Part:</label>
          <select className="dropdown" value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {/* Bloom Type Dropdown */}
        <div className="dropdown-group">
          <label>Bloom Type:</label>
          <select className="dropdown" value={bloomType} onChange={(e) => setBloomType(e.target.value)}>
            <option value="">All</option>
            {bloomOptions.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Unit Dropdown (NEW) */}
        <div className="dropdown-group">
          <label>Unit:</label>
          <select className="dropdown" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">All</option>
            {unitOptions.map((u, index) => (
              <option key={index} value={u}>Unit {u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question Pool Display */}
      <div className="question-pool">
        <h2>Questions:</h2>
        <div className="questions-box">
          {questions.length > 0 ? (
            questions.map((q, index) => (
              <div key={index} className="question">
                {q.question} <span className="bloom">({q.bloom} - Unit {q.unit})</span>
              </div>
            ))
          ) : (
            <p>No questions available for the selected filters.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="button-group">
        <button className="action-btn" onClick={handleCreateQuestion}>Create Question</button>
        <button className="action-btn" onClick={handleEditQuestion}>Edit Questions</button>
      </div>
    </div>
  );
}

export default QuestionPool;
