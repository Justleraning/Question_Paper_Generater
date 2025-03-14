import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formattedQuestions = [], selectedSubject = "N/A", semester = "N/A", selectedUnits = [] } = location.state || {};
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize question data from the formatted questions
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
  
  // Keep a copy of the original data for cancellation
  const [originalQuestionsData, setOriginalQuestionsData] = useState(JSON.parse(JSON.stringify(questionsData)));

  // Handlers for question modifications
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

  // Edit mode handlers
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
    navigate("/mainp");
  };

  // Backend interaction
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
        navigate("/mainp");
      } else {
        throw new Error("Failed to save questions");
      }
    } catch (error) {
      console.error(error);
      alert("❌ Error saving questions. Please try again.");
    } finally {
      setIsLoading(false);
      setIsEditing(false); // Exit edit mode after saving
    }
  };

  // Find the correct index for a question in the combined list
  const getQuestionNumber = (unit, questionIndex, markValue) => {
    const questionsWithSameMarks = questionsData[unit].filter(q => q.marks === markValue);
    return questionsWithSameMarks.findIndex(q => q === questionsData[unit][questionIndex]) + 1;
  };

  return (
    <div style={{ 
      flexGrow: 1, 
      padding: '20px', 
      textAlign: 'center', 
      fontFamily:'sans-serif',  
      background: "linear-gradient( #091979, #0059ff)",
        minHeight: '100vh'
      }}>
        <h2 style={{ 
          marginBottom: '20px', 
          color: 'white', 
          fontFamily:'verdana',
          fontSize: '26px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>Preview Questions</h2>

        <div style={{
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
          <h3 style={{ 
            color: '#333', 
            margin: '0 0 5px 0',
            fontSize: '20px'
          }}>BCA - {semester}</h3>
          <h4 style={{ 
            color: '#444', 
            margin: '0',
            fontSize: '18px'
          }}>{selectedSubject}</h4>
        </div>

        {Object.entries(questionsData).map(([unit, questions]) => (
          <div key={unit} style={{ 
            marginBottom: '30px', 
            padding: '20px', 
            border: '2px solid #ddd', 
            borderRadius: '10px', 
            backgroundColor: '#f9f9f9', 
            textAlign: 'center',
            boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              color: '#333', 
              textAlign: 'center',
              borderBottom: '1px solid #ddd',
              paddingBottom: '8px',
              marginBottom: '15px',
              fontSize: '20px'
            }}>Unit {unit}</h3>

            {/* Part A - 2 Marks Questions */}
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ 
                color: '#d9534f', 
                textAlign: 'center', 
                fontSize: '15px', 
                fontWeight:'bold',
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>Part A - 2 Marks Questions</h4>
              
              {questions
                .filter(q => q.marks === '2')
                .map((q, index) => {
                  // Get the actual question number for this mark category
                  const questionIndex = questionsData[unit].findIndex(question => question === q);
                  const questionNumber = getQuestionNumber(unit, questionIndex, '2');
                  
                  return (
                    <div key={index} style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #ddd', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '10px',
                      textAlign: 'left'
                    }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <input
                            value={typeof q.text === 'string' && !q.text.startsWith('<') ? q.text : ''}
                            onChange={(e) => handleQuestionChange(unit, questionIndex, e.target.value)}
                            style={{ 
                              flex: 1,
                              width: "95%",
                              padding: '8px', 
                              border: '1px solid #ccc', 
                              borderRadius: '5px',
                              marginBottom: '5px',
                              fontSize: '14px'
                            }}
                          />
                          
                          {/* Delete button if in edit mode */}
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this question?")) {
                                setQuestionsData(prev => ({
                                  ...prev,
                                  [unit]: prev[unit].filter((_, i) => i !== questionIndex)
                                }));
                              }
                            }}
                            style={{
                              alignSelf: 'flex-end',
                              padding: '3px 8px',
                              backgroundColor: "#dc3545",
                              color: "white",
                              display: 'flex',
                              fontSize: '18px',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                              borderRadius: "30%",
                            }}
                          >
                          &#10799;
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          margin: '0',
                          fontSize: '14px',
                          width: '100%'
                        }}>
                          <strong style={{fontSize: '15px'}}>Q{questionNumber}:</strong>{' '}
                          <span dangerouslySetInnerHTML={{ __html: q.text }} />
                        </div>
                      )}
                    </div>
                  );
                })}
                
              {isEditing && (
                <button 
                  onClick={() => handleAddQuestion(unit, '2')} 
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px 10px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    fontSize:'15px',
                    border: 'none',
                    borderRadius: '15px', 
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  + Add 2 Mark Question
                </button>
              )}
            </div>

            {/* Part B - 4 Marks Questions */}
            <div style={{ marginTop: '25px' }}>
              <h4 style={{ 
                color: '#0275d8', 
                textAlign: 'center', 
                fontSize: '15px', 
                fontWeight: 'bold',
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '5px',
                marginBottom: '10px'
              }}>Part B - 4 Marks Questions</h4>
              
              {questions
                .filter(q => q.marks === '4')
                .map((q, index) => {
                  // Get the actual question number for this mark category
                  const questionIndex = questionsData[unit].findIndex(question => question === q);
                  const questionNumber = getQuestionNumber(unit, questionIndex, '4');
                  
                  return (
                    <div key={index} style={{ 
                      padding: '10px', 
                      borderBottom: '1px solid #ddd', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '10px',
                      textAlign: 'left'
                    }}>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                          <input
                            value={typeof q.text === 'string' && !q.text.startsWith('<') ? q.text : ''}
                            onChange={(e) => handleQuestionChange(unit, questionIndex, e.target.value)}
                            style={{ 
                              flex: 1, 
                              width: "95%",
                              padding: '8px', 
                              border: '1px solid #ccc', 
                              borderRadius: '5px',
                              marginBottom: '5px',
                              fontSize: '15px'
                            }}
                          />
                          
                          {/* Image upload for 4-mark questions */}
                          <div style={{ marginTop: '5px', marginBottom: '5px' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(unit, questionIndex, e.target.files[0])}
                              style={{ 
                                display: 'block',
                                marginBottom: '5px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                          
                          {/* Delete button if in edit mode */}
                          <button 
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this question?")) {
                                setQuestionsData(prev => ({
                                  ...prev,
                                  [unit]: prev[unit].filter((_, i) => i !== questionIndex)
                                }));
                              }
                            }}
                            style={{
                              alignSelf: 'flex-end',
                              padding: '3px 8px',
                              backgroundColor: "#dc3545",
                              color: "white",
                              display: 'flex',
                              fontSize: '18px',
                              justifyContent: 'center',
                              alignItems: 'center',
                              cursor: 'pointer',
                              borderRadius: "30%",
                            }}
                          >
                          &#10799;
                          </button>
                        </div>
                      ) : (
                        <>
                          <div style={{
                            margin: '0',
                            fontSize: '14px',
                            width: '100%'
                          }}>
                            <strong style={{fontSize: '15px'}}>Q{questionNumber}:</strong>{' '}
                            <span dangerouslySetInnerHTML={{ __html: q.text }} />
                          </div>
                          
                          {q.image && (
                            <img 
                              src={q.image} 
                              alt="Question diagram" 
                              style={{ 
                                maxWidth: '200px', 
                                maxHeight: '150px', 
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                margin: '5px 0'
                              }} 
                            />
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                
              {isEditing && (
                <button 
                  onClick={() => handleAddQuestion(unit, '4')} 
                  style={{ 
                    marginTop: '10px', 
                    padding: '8px 10px', 
                    backgroundColor: '#ff5733', 
                    color: 'white', 
                    fontSize: '15px', 
                    border: 'none',
                    borderRadius: '15px', 
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                >
                  + Add 4 Mark Question
                </button>
              )}
            </div>
          </div>
        ))}

        <div style={{ marginBottom: '30px' }}>
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel} 
                style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#d9534f', 
                  color: 'white', 
                  borderRadius: '5px', 
                  fontSize:'16px', 
                  border: 'none',
                  cursor: 'pointer', 
                  marginRight: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Cancel
              </button>

              <button 
                onClick={handleSaveToBackend} 
                disabled={isLoading} 
                style={{ 
                  padding: '10px 15px', 
                  backgroundColor: '#ff5733', 
                  color: 'white', 
                  border: '1px dotted black', 
                  borderRadius: '5px', 
                  cursor: isLoading ? 'not-allowed' : 'pointer', 
                  fontSize: '16px', 
                  marginRight: '10px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? "Saving..." : "Confirm & Save ✅"}
              </button>
            </>
          ) : (
            <button 
              onClick={handleEdit} 
              style={{ 
                padding: '10px 15px', 
                backgroundColor: '#f6da08', 
                color: 'black', 
                fontSize:'16px', 
                borderRadius: '5px', 
                border: 'none',
                cursor: 'pointer', 
                marginRight:'10px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              Edit
            </button>
          )}

          <button 
            onClick={handleSaveToBackend} 
            disabled={isLoading} 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#f92e00', 
              color: 'white', 
              borderRadius: '5px', 
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer', 
              fontSize: '16px',
              marginRight: '10px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? "Saving..." : "Save All ✔"}
          </button>

          <button 
            onClick={handleFinalPaper} 
            style={{ 
              padding: '10px 15px', 
              backgroundColor: '#16ac13', 
              color: 'white', 
              borderRadius: '5px', 
              border: 'none',
              cursor: 'pointer', 
              fontSize: '16px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            Final Paper 📄
          </button>
        </div>
        
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px',
          borderRadius: '5px',
          border: '1px solid #f5c6cb',
          marginTop: '20px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ⚠️ WARNING: MOVING BACK TO THE PREVIOUS PAGE CAN CAUSE YOU TO LOSE EVERYTHING ⚠️
        </div>
      </div>
  );
};

export default PreviewPage;