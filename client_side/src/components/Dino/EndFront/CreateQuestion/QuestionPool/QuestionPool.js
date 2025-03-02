import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./QuestionPool.css";

function QuestionPool() {
  const navigate = useNavigate();

  // State Variables
  const [subjectCode, setSubjectCode] = useState("CA 3222");
  const [selectedPart, setSelectedPart] = useState("A");
  const [bloomType, setBloomType] = useState("");
  const [unit, setUnit] = useState("");
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [questions, setQuestions] = useState([]);

  // Bloom's Taxonomy Options
  const bloomOptions = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
  const unitOptions = ["1", "2", "3", "4", "5"];

  // Sample Subjects
  const subjectOptions = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
  ];

  // Dummy Questions with MCQs & Images
  const dummyQuestions = useMemo(() => ({
    "CA 3222": {
      A: [
        { bloom: "Remember", question: "What is AWS?", unit: "1" },
        { bloom: "Analyze", question: "Explain features of C#.", unit: "2" },
        { bloom: "Understand", question: "Explain polymorphism in C#.", unit: "3" },
        { bloom: "Apply", question: "Write a C# program for a calculator.", unit: "4" },
        { bloom: "Evaluate", question: "Discuss the advantages of C#.", unit: "5" },
        {
          bloom: "Remember", question: "What is OOP?", unit: "1", type: "mcq",
          options: ["Object-Oriented Process", "Object-Oriented Programming", "Object Programming", "Object orienting Programming"]
        },
        {
          bloom: "Understand", question: "Identify this logo.", unit: "2", type: "mcq-image",
          options: [
            { image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
            { image: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
            { image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Accenture_logo.svg/640px-Accenture_logo.svg.png" },
            { image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" }
          ]
        },
        { bloom: "Apply", question: "Write a program for Factorial using recursion.", unit: "3", image: "/mnt/data/image.png" },
        { bloom: "Create", question: "Identify this programming language.", unit: "4", image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" }
      ],
    },
  }), []);

  // Filter questions based on selected criteria
  useEffect(() => {
    const filteredQuestions =
      dummyQuestions[subjectCode]?.[selectedPart]?.filter(
        (q) => (!bloomType || q.bloom === bloomType) && (!unit || q.unit === unit)
      ) || [];
    setQuestions(filteredQuestions);
  }, [subjectCode, selectedPart, bloomType, unit, dummyQuestions]);

  // Toggle Expand/Collapse
  const toggleExpand = (index) => {
    setExpandedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="din3-question-pool-container">
      <h1>Question Pool</h1>

      {/* Header Inputs */}
      <div className="din3-header-container">
        {/* Subject Code */}
        <div className="din3-dropdown-group">
          <label>Subject Code:</label>
          <input list="subjectList" className="din3-dropdown" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} />
          <datalist id="subjectList">
            {subjectOptions.map((subject, index) => (
              <option key={index} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </datalist>
        </div>

        {/* Part Dropdown */}
        <div className="din3-dropdown-group">
          <label>Part:</label>
          <select className="din3-dropdown" value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {/* Bloom Type Dropdown */}
        <div className="din3-dropdown-group">
          <label>Bloom Type:</label>
          <select className="din3-dropdown" value={bloomType} onChange={(e) => setBloomType(e.target.value)}>
            <option value="">All</option>
            {bloomOptions.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Unit Dropdown */}
        <div className="din3-dropdown-group">
          <label>Unit:</label>
          <select className="din3-dropdown" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">All</option>
            {unitOptions.map((u, index) => (
              <option key={index} value={u}>Unit {u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question List */}
      <div className="din3-question-pool">
        <h2>Questions:</h2>
        <div className="din3-questions-box">
          {questions.length > 0 ? (
            questions.map((q, index) => {
              const needsExpand = q.fullText || q.type === "mcq" || q.type === "mcq-image" || q.image;
              return (
                <div key={index} className="din3-question">
                  <div className="din3-question-header">
                    <div className="din3-question-info">
                      <span className="din3-question-text">{index + 1}. {q.question}</span>
                      <span className="din3-question-meta"> (Unit {q.unit} - {q.bloom}) </span>
                    </div>
                    {needsExpand && (
                      <button className="din3-expand-btn" onClick={() => toggleExpand(index)}>
                        {expandedQuestions[index] ? "🔼" : "🔽"}
                      </button>
                    )}
                  </div>
                  
                  {expandedQuestions[index] && (
                    <div className="din3-expanded-content">
                      {q.fullText && <p>{q.fullText}</p>}
                      {q.type === "mcq" && (
                        <ul>
                          {q.options.map((option, i) => (
                            <li key={i}>{option}</li>
                          ))}
                        </ul>
                      )}
                      {q.type === "mcq-image" && (
                        <div className="din3-mcq-image-options">
                          {q.options.map((option, i) => (
                            <div key={i} className="din3-mcq-image-option">
                              <img src={option.image} alt={option.text} />
                              <p>{option.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {q.image && <img src={q.image} alt="Question Image" className="din3-question-image" />}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p>No questions available.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="din3-button-group">
        <button className="din3-action-btn" onClick={() => navigate("/create-question")}>Create Question</button>
        <button className="din3-action-btn" onClick={() => navigate("/edit-question")}>Edit Questions</button>
      </div>
    </div>
  );
}

export default QuestionPool;