import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./EditQuestion.css"; // Keep the original import

function EditQuestion() {
  const location = useLocation();
  const navigate = useNavigate();

  // State Variables
  const [subjectCode, setSubjectCode] = useState("CA 3222");
  const [selectedPart, setSelectedPart] = useState("A");
  const [bloomType, setBloomType] = useState("");
  const [unit, setUnit] = useState("");
  const [questions, setQuestions] = useState([]);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  // Constants
  const bloomOptions = ["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"];
  const unitOptions = ["1", "2", "3", "4", "5"];
  const subjectOptions = [
    { code: "CA 3222", name: "C# AND DOT NET FRAMEWORK" },
    { code: "CA 3233", name: "Java Programming" },
    { code: "CA 3244", name: "Python Basics" },
  ];

  // Dummy data remains the same
  const dummyQuestions = {
    "CA 3222": {
      A: [
        { id: 1, bloom: "Remember", question: "What is AWS?", unit: "1" },
        { id: 2, bloom: "Analyze", question: "Explain features of C#.", unit: "2" },
        { id: 3, bloom: "Understand", question: "Explain polymorphism in C#.", unit: "3" },
        { id: 4, bloom: "Apply", question: "Write a C# program for a calculator.", unit: "4" },
        { id: 5, bloom: "Evaluate", question: "Discuss the advantages of C#.", unit: "5" },
        {
          id: 6, bloom: "Remember", question: "What is OOP?", unit: "1", type: "mcq",
          options: ["Object-Oriented Process", "Object-Oriented Programming", "Object Programming", "Object orienting Programming"]
        },
        {
          id: 7, bloom: "Understand", question: "Identify this logo.", unit: "2", type: "mcq-image",
          options: [
            { text: "", image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
            { text: "", image: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
            { text: "", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Accenture_logo.svg/640px-Accenture_logo.svg.png" },
            { text: "", image: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" }
          ]
        },
        { id: 8, bloom: "Apply", question: "Write a program for Factorial using recursion.", unit: "3", image: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Recursion_example_factorial.png" },
        { id: 9, bloom: "Create", question: "Identify this programming language.", unit: "4", image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" }
      ],
      B: [
        { id: 10, bloom: "Remember", question: "What is Cloud Computing?", unit: "1" },
        { id: 11, bloom: "Apply", question: "Create a simple inheritance example in C#.", unit: "2" }
      ],
      C: [
        { id: 12, bloom: "Evaluate", question: "Compare C# with Java.", unit: "5" },
        { id: 13, bloom: "Create", question: "Design a database schema for an e-commerce application.", unit: "4" }
      ]
    },
    "CA 3233": {
      A: [
        { id: 14, bloom: "Remember", question: "What is JVM?", unit: "1" },
        { id: 15, bloom: "Apply", question: "Write a Java program to demonstrate polymorphism.", unit: "3" }
      ]
    },
    "CA 3244": {
      A: [
        { id: 16, bloom: "Understand", question: "Explain list comprehension in Python.", unit: "2" },
        { id: 17, bloom: "Create", question: "Create a Python program for data visualization.", unit: "5" }
      ]
    }
  };

  // Logic functions remain the same
  useEffect(() => {
    const filteredQuestions = dummyQuestions[subjectCode]?.[selectedPart]?.filter(
      (q) => (!bloomType || q.bloom === bloomType) && (!unit || q.unit === unit)
    ) || [];

    setQuestions(filteredQuestions);
  }, [subjectCode, selectedPart, bloomType, unit]);

  const toggleExpand = (index) => {
    setExpandedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const needsExpand = (question) => {
    return question.type === "mcq" || question.type === "mcq-image" || question.image;
  };

  const renderQuestionButtons = (question, index) => {
    return (
      <div className="din5-question-actions">
        {needsExpand(question) ? (
          <button className="din5-expand-btn" onClick={() => toggleExpand(index)}>
            {expandedQuestions[index] ? "🔼" : "🔽"}
          </button>
        ) : (
          <span style={{ width: "28px", display: "inline-block" }}></span>
        )}

        <button className="din5-edit-btn" onClick={() => openEditPanel(question)}>✏️</button>
        <button className="din5-delete-btn" onClick={() => deleteQuestion(question.id)}>🗑️</button>
      </div>
    );
  };

  const openEditPanel = (question) => {
    setEditingQuestion({ ...question });
    setIsEditPanelOpen(true);
  };

  const closeEditPanel = () => {
    setIsEditPanelOpen(false);
    setEditingQuestion(null);
  };

  const handleQuestionChange = (value) => {
    setEditingQuestion((prev) => ({ ...prev, question: value }));
  };

  const handleBloomTypeChange = (value) => {
    setEditingQuestion((prev) => ({ ...prev, bloom: value }));
  };

  const handleUnitChange = (value) => {
    setEditingQuestion((prev) => ({ ...prev, unit: value }));
  };

  const handleOptionChange = (index, value) => {
    setEditingQuestion((prev) => {
      if (prev.type === "mcq") {
        const newOptions = [...prev.options];
        newOptions[index] = value;
        return { ...prev, options: newOptions };
      } else if (prev.type === "mcq-image") {
        const newOptions = [...prev.options];
        newOptions[index] = { ...newOptions[index], text: value };
        return { ...prev, options: newOptions };
      }
      return prev;
    });
  };

  const handleImageUpload = (file, type, optionIndex = null) => {
    if (type === "question") {
      setEditingQuestion((prev) => ({ ...prev, image: URL.createObjectURL(file) }));
    } else if (type === "option" && optionIndex !== null) {
      setEditingQuestion((prev) => {
        const newOptions = [...prev.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], image: URL.createObjectURL(file) };
        return { ...prev, options: newOptions };
      });
    }
  };

  const handleDeleteImage = (type, optionIndex = null) => {
    if (type === "question") {
      setEditingQuestion((prev) => ({ ...prev, image: null }));
    } else if (type === "option" && optionIndex !== null) {
      setEditingQuestion((prev) => {
        const newOptions = [...prev.options];
        newOptions[optionIndex] = { ...newOptions[optionIndex], image: null };
        return { ...prev, options: newOptions };
      });
    }
  };

  const saveQuestion = () => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => q.id === editingQuestion.id ? editingQuestion : q)
    );
    closeEditPanel();
  };

  const saveAllChanges = () => {
    console.log("All questions saved:", questions);
    alert("All changes saved successfully!");
    navigate("/question-pool", { state: { updatedQuestions: questions } });
  };

  const deleteQuestion = (id) => {
    setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
  };

  // Updated JSX with prefixed class names
  return (
    <div className="din5-edit-question-container">
      <h1>Edit Questions</h1>

      {/* Header Filters */}
      <div className="din5-header-container">
        {/* Subject Code */}
        <div className="din5-dropdown-group">
          <label>Subject Code:</label>
          <input list="subjectList" className="din5-dropdown" value={subjectCode} onChange={(e) => setSubjectCode(e.target.value)} />
          <datalist id="subjectList">
            {subjectOptions.map((subject, index) => (
              <option key={index} value={subject.code}>{subject.name}</option>
            ))}
          </datalist>
        </div>

        {/* Part Dropdown */}
        <div className="din5-dropdown-group">
          <label>Part:</label>
          <select className="din5-dropdown" value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)}>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        {/* Bloom Type Dropdown */}
        <div className="din5-dropdown-group">
          <label>Bloom Type:</label>
          <select className="din5-dropdown" value={bloomType} onChange={(e) => setBloomType(e.target.value)}>
            <option value="">All</option>
            {bloomOptions.map((type, index) => (
              <option key={index} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Unit Dropdown */}
        <div className="din5-dropdown-group">
          <label>Unit:</label>
          <select className="din5-dropdown" value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="">All</option>
            {unitOptions.map((u, index) => (
              <option key={index} value={u}>Unit {u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Question List */}
      <div className="din5-question-list">
        {questions.length > 0 ? (
          questions.map((q, index) => (
            <div key={q.id} className="din5-question-item">
              <div className="din5-question-header">
                <div className="din5-question-info">
                  <span className="din5-question-text">{index + 1}. {q.question}</span>
                  <span className="din5-question-meta"> (Unit {q.unit} - {q.bloom}) </span>
                </div>
                {renderQuestionButtons(q, index)}
              </div>

              {/* Expanded Content */}
              {expandedQuestions[index] && (
                <div className="din5-expanded-content">
                  {q.type === "mcq" && (
                    <ul className="din5-mcq-options-list">
                      {q.options.map((option, i) => (
                        <li key={i}>{option}</li>
                      ))}
                    </ul>
                  )}

                  {q.type === "mcq-image" && (
                    <div className="din5-mcq-image-options">
                      {q.options.map((option, i) => (
                        <div key={i} className="din5-mcq-image-option">
                          <img src={option.image} alt={option.text || `Option ${i + 1}`} />
                          <p>{option.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.image && (
                    <div className="din5-question-image-container">
                      <img src={q.image} alt="Question" className="din5-question-image" />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="din5-no-questions">No questions available for the selected criteria.</p>
        )}
      </div>

      {/* Save All Changes Button */}
      <button className="din5-save-all-btn" onClick={saveAllChanges}>Save All Changes</button>

      {/* Edit Panel */}
      {isEditPanelOpen && (
        <div className="din5-edit-panel-overlay">
          <div className="din5-edit-panel">
            <button className="din5-close-panel-btn" onClick={closeEditPanel}>✖</button>
            <h2>Edit Question</h2>

            <div className="din5-edit-form">
              {/* Bloom Type & Unit Dropdowns */}
              <div className="din5-header-container">
                {/* Bloom Type Dropdown */}
                <div className="din5-dropdown-group">
                  <label>Bloom Type:</label>
                  <select
                    className="din5-dropdown"
                    value={editingQuestion?.bloom || ""}
                    onChange={(e) => handleBloomTypeChange(e.target.value)}
                  >
                    {bloomOptions.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Unit Dropdown */}
                <div className="din5-dropdown-group">
                  <label>Unit:</label>
                  <select
                    className="din5-dropdown"
                    value={editingQuestion?.unit || ""}
                    onChange={(e) => handleUnitChange(e.target.value)}
                  >
                    {unitOptions.map((u, index) => (
                      <option key={index} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="din5-form-group">
                <label>Question:</label>
                <textarea
                  className="din5-question-textarea"
                  value={editingQuestion?.question || ""}
                  onChange={(e) => handleQuestionChange(e.target.value)}
                />
              </div>

              {/* Question Image */}
              {(editingQuestion?.image || editingQuestion?.type === undefined) && (
                <div className="din5-form-group">
                  <label>Question Image:</label>
                  <div className="din5-image-upload-container">
                    {editingQuestion?.image && (
                      <div className="din5-image-preview-frame">
                        <img src={editingQuestion.image} alt="Question" />
                        <button
                          className="din5-delete-image-btn"
                          onClick={() => handleDeleteImage("question")}
                        >
                          ✖
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], "question")}
                    />
                  </div>
                </div>
              )}

              {/* MCQ Options */}
              {editingQuestion?.type === "mcq" && (
                <div className="din5-form-group">
                  <label>MCQ Options:</label>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="din5-mcq-option-input">
                      <label>Option {index + 1}:</label>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* MCQ Image Options */}
              {editingQuestion?.type === "mcq-image" && (
                <div className="din5-form-group">
                  <label>MCQ Options with Images:</label>
                  {editingQuestion.options.map((option, index) => (
                    <div key={index} className="din5-mcq-image-option-edit">
                      <div className="din5-mcq-option-text">
                        <label>Option {index + 1} Text:</label>
                        <input
                          type="text"
                          value={option.text || ""}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                        />
                      </div>
                      <div className="din5-mcq-option-image">
                        <label>Option {index + 1} Image:</label>
                        <div className="din5-image-upload-container">
                          {option.image && (
                            <div className="din5-image-preview-frame">
                              <img src={option.image} alt={`Option ${index + 1}`} />
                              <button
                                className="din5-delete-image-btn"
                                onClick={() => handleDeleteImage("option", index)}
                              >
                                ✖
                              </button>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e.target.files[0], "option", index)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save Button */}
              <button className="din5-save-question-btn" onClick={saveQuestion}>
                Save Question
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditQuestion;