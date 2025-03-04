import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LexicalEditor from "./LexicalEditor";
import FormattingPanel from "./FormattingPanel";

const QuestionEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSubject = "N/A", semester = "N/A", selectedUnits = [], questions = {} } = location.state || {}; 

  // Initialize state to always ensure at least one question per unit
  const [questionData, setQuestionData] = useState(() => {
    const initialData = {};
    selectedUnits.forEach(unit => {
      initialData[unit] = questions[unit] && questions[unit].length > 0 
        ? questions[unit] 
        : [{ text: "", marks: "2", image: null }];
    });
    return initialData;
  });

  const handleQuestionChange = (unit, index, newText) => {
    setQuestionData((prev) => ({
      ...prev,
      [unit]: prev[unit].map((q, i) => i === index ? { ...q, text: newText } : q),
    }));
  };

  const handleMarksChange = (unit, index, value) => {
    setQuestionData((prev) => ({
      ...prev,
      [unit]: prev[unit].map((q, i) => i === index ? { ...q, marks: value } : q),
    }));
  };

  const handleImageChange = (unit, index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionData((prev) => ({
          ...prev,
          [unit]: prev[unit].map((q, i) => i === index ? { ...q, image: e.target.result } : q),
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addQuestion = (unit) => {
    setQuestionData((prev) => ({
      ...prev,
      [unit]: [...prev[unit], { text: "", marks: "2", image: null }],
    }));
  };

  const handleReview = () => {
    const formattedQuestions = Object.entries(questionData).map(([unit, qns]) => ({
      unit,
      questions: qns.map((q) => ({
        text: q.text,
        marks: q.marks,
        image: q.image || null,
      })),
    }));

    navigate("/previewpage", { 
      state: { formattedQuestions, selectedSubject, semester, selectedUnits } 
    });
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily:"sans-serif", background: "#f2ef8d", padding: "20px" }}>
      
      <FormattingPanel />

      <div style={{ flexGrow: 1, padding: "20px", textAlign: "center" }}>
        <div style={{ marginBottom: "20px", border: "1px dotted black", backgroundColor: "white", padding: "10px" }}>
          <h2 style={{ color: "black" }}>BCA - {semester}</h2>
          <h3 style={{ color: "black" }}>{selectedSubject}</h3>
        </div>

        <h2 style={{ textAlign:"center", marginBottom: "20px", color: "black" }}>Add Questions</h2>
        <h4 style={{ textAlign: "center",marginBottom:"20px", color: "black" }}>(Minimum 19 questions)</h4>

        {selectedUnits.map((unit) => (
          <div key={unit} style={{ width: "60%", margin: "20px auto", padding: "20px", border: "2px solid #ddd", borderRadius: "10px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
            <h3 style={{ color: "#333" }}>Unit {unit}</h3>

            {/* Ensure at least one question input box is rendered */}
            {questionData[unit]?.length > 0 ? questionData[unit].map((q, index) => (
              <div key={index} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "10px" }}>
                
                {/* Lexical Editor */}
                <LexicalEditor 
                  onChange={(text) => handleQuestionChange(unit, index, text)}
                />

                {/* Marks Selection */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold", textAlign: "center" }}>Marks:</p>
                  <select
                    value={q.marks}
                    onChange={(e) => handleMarksChange(unit, index, e.target.value)}
                    style={{
                      padding: "10px",
                      borderRadius: "5px",
                      backgroundColor: "white",
                      border: "1px solid #ddd",
                      fontSize: "14.5px",
                    }}
                  >
                    <option value="2">2</option>
                    <option value="4">4</option>
                  </select>
                </div>

                {/* Image Upload for 4 Marks Questions */}
                {q.marks === "4" && (
                  <div style={{ marginTop: "10px" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(unit, index, e.target.files[0])}
                      style={{ marginBottom: "10px" }}
                    />
                    {q.image && (
                      <img
                        src={q.image}
                        alt="Uploaded"
                        style={{ width: "200px", height: "auto", borderRadius: "5px", border: "1px solid #ccc" }}
                      />
                    )}
                  </div>
                )}
              </div>
            )) : (
              // If no questions exist, force add one input
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "10px" }}>
                <LexicalEditor onChange={(text) => handleQuestionChange(unit, 0, text)} />
              </div>
            )}

            {/* Add Question Button */}
            <button
              onClick={() => addQuestion(unit)}
              style={{
                padding: "10px 15px",
                borderRadius: "50%",
                backgroundColor: "teal",
                color: "white",
                border: "none",
                cursor: "pointer",
                fontSize: "20px",
                marginTop: "10px",
              }}
            >
              +
            </button>
          </div>
        ))}

        {/* Confirm & Preview Button */}
        <button
          onClick={handleReview}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#3c2dde",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Confirm & Preview &#129094;
        </button>
      </div>
    </div>
  );
};

export default QuestionEntry;
