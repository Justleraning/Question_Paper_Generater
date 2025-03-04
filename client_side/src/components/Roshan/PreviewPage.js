import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import FormattingPanel from "./FormattingPanel";
import { useEditor } from "./EditorContext";
const extractTextFromLexical = (lexicalJson) => {
  try {
    if (typeof lexicalJson === "string" && !lexicalJson.includes('"root"')) {
      return lexicalJson;
    }

    const parsed = typeof lexicalJson === "string" ? JSON.parse(lexicalJson) : lexicalJson;
    if (parsed && parsed.root && parsed.root.children) {
      return parsed.root.children
        .flatMap(child => child.children || [])  
        .map(node => node.text || '')  
        .join(' ');  
    }
  } catch (error) {
    console.error("Error parsing Lexical JSON:", error);
  }
  return "";  
};

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formattedQuestions = [], selectedSubject = "N/A", semester = "N/A", selectedUnits = [] } = location.state || {};
  const { format } = useEditor();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [questionsData, setQuestionsData] = useState(
    formattedQuestions.reduce((acc, { unit, questions }) => {
      acc[unit] = questions.map(q => ({
        text: q.text || "",  
        marks: q.marks || "2",
        image: q.image || null
      }));
      return acc;
    }, {})
  );
  const [originalQuestionsData, setOriginalQuestionsData] = useState(JSON.parse(JSON.stringify(questionsData)));

  const handleQuestionChange = (unit, index, newText) => {
    setQuestionsData(prevState => ({
      ...prevState,
      [unit]: prevState[unit].map((q, i) => 
        i === index ? { ...q, text: newText } : q
      )
    }));
  };

  const handleAddQuestion = (unit, marks) => {
    setQuestionsData(prevState => ({
      ...prevState,
      [unit]: [...prevState[unit], { text: "", marks, image: null }]
    }));
  };

  const handleImageChange = (unit, index, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQuestionsData(prev => {
          const updated = JSON.parse(JSON.stringify(prev)); 
          updated[unit][index].image = e.target.result;
          return updated;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setOriginalQuestionsData(JSON.parse(JSON.stringify(questionsData))); 
    setIsEditing(true);
  };

  const handleCancel = () => {
    setQuestionsData(JSON.parse(JSON.stringify(originalQuestionsData))); 
    setIsEditing(false);
  };

  const handleFinalPaper = () => {
    console.log('Final Paper Process Initiated');
    navigate("/");
  };

  const handleSaveToBackend = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/save-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester,
          subject: selectedSubject,
          units: selectedUnits,
          questions: questionsData,
        }),
      });

      if (response.ok) {
        alert("✅ Questions saved successfully!");
        navigate("/");
      } else {
        throw new Error("Failed to save questions");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error saving questions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <FormattingPanel />

      <div style={{ flexGrow: 1, padding: '20px', textAlign: 'center', fontFamily:'verdana',  background: "linear-gradient( #091979, #0059ff)" }}>
        <h2 style={{ marginBottom: '20px', color: 'white', fontFamily:'verdana' }}>Preview Questions</h2>

        {Object.entries(questionsData).map(([unit, questions]) => (
          <div key={unit} style={{ marginBottom: '30px', padding: '20px', border: '2px solid #ddd', borderRadius: '10px', backgroundColor: '#f9f9f9', textAlign: 'center' }}>
            <h3 style={{ color: '#333', textAlign: 'center' }}>Unit {unit}</h3>

            {/* Part A - 2 Marks Questions */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ color: '#d9534f', textAlign: 'center', fontSize: '15px', fontWeight:'bold' }}>Part A - 2 Marks Questions</h4>
              {questions
                .filter(q => q.marks === '2')
                .map((q, index) => (
                  <div key={index} style={{ padding: '5px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionChange(unit, index, e.target.value)}
                        style={{ flex: 1, padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                    ) : (
                      <p style={{
                        fontWeight: format.bold ? "bold" : "normal",
                        fontStyle: format.italic ? "italic" : "normal",
                        textDecoration: format.underline ? "underline" : "none",
                      }}>
                        <strong>Q{index + 1}:</strong> {q.text}
                      </p>
                    )}
                  </div>
                ))}
              {isEditing && (
                <button onClick={() => handleAddQuestion(unit, '2')} style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#28a745', color: 'white', fontSize:'14px',borderRadius: '5px', cursor: 'pointer' }}>
                  ➕ Add 2 Mark Question
                </button>
              )}
            </div>

            {/* Part B - 4 Marks Questions */}
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ color: '#0275d8', textAlign: 'center', fontSize:'15px', fontWeight:'bold' }}>Part B - 4 Marks Questions</h4>
              {questions
                .filter(q => q.marks === '4')
                .map((q, index) => (
                  <div key={index} style={{ padding: '5px', borderBottom: '1px solid #ddd', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionChange(unit, index, e.target.value)}
                        style={{ flex: 1, padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }}
                      />
                    ) : (
                      <p style={{
                        fontWeight: format.bold ? "bold" : "normal",
                        fontStyle: format.italic ? "italic" : "normal",
                        textDecoration: format.underline ? "underline" : "none",
                      }}>
                        <strong>Q{index + 1}:</strong> {q.text}
                      </p>
                    )}
                  </div>
                ))}
              {isEditing && (
                <button onClick={() => handleAddQuestion(unit, '4')} style={{ marginTop: '10px', padding: '5px 10px', backgroundColor: '#ff5733', color: 'white', fontSize:'14px', borderRadius: '5px', cursor: 'pointer' }}>
                  ➕ Add 4 Mark Question
                </button>
              )}
            </div>
          </div>
        ))}

        {isEditing ? (
          <>
            <button onClick={handleCancel} style={{ padding: '10px 15px', backgroundColor: '#d9534f', color: 'white', borderRadius: '5px', fontSize:'16px' ,cursor: 'pointer', marginRight: '10px' }}>
              Cancel
            </button>

            <button onClick={handleSaveToBackend} disabled={isLoading} style={{ padding: '10px 15px', backgroundColor: '#ff5733', color: 'white', border: '1px dotted black', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', marginRight: '10px' }}>
              {isLoading ? "Saving..." : "Confirm & Save ✅"}
            </button>
          </>
        ) : (
          <button onClick={handleEdit} style={{ padding: '10px 15px', backgroundColor: '#f6da08', color: 'black', fontSize:'16px', borderRadius: '5px', cursor: 'pointer', marginRight:'10px' }}>
            Edit
          </button>
        )}

        <button onClick={handleSaveToBackend} disabled={isLoading} style={{ padding: '10px 15px', backgroundColor: '#f92e00', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
            {isLoading ? "Saving..." : "Save All ✔"}
        </button>

        <button onClick={handleFinalPaper} style={{ marginLeft: '10px', padding: '10px 15px', backgroundColor: '#16ac13', color: 'white', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
          Final Paper 📄
        </button>
        <h3>&#9888; MOVING BACK TO THE PREVIOUS PAGE CAN CAUSE TO LOSE EVERYTHINGs &#9888;</h3>
      </div>
    </div>
  );
};

export default PreviewPage;

