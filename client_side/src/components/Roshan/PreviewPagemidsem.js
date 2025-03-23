import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Save, Edit, FileText, CheckCircle, Plus, Trash } from "lucide-react"; 
import ModalRosh from "./ModalRosh.js";

const PreviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    formattedQuestions = [], 
    selectedSubject = "N/A", 
    semester = "N/A", 
    selectedUnits = [],
    paper = null,
    id = null
  } = location.state || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [savedPaperId, setSavedPaperId] = useState(id);
  const [apiUrl, setApiUrl] = useState("http://localhost:5000/api/papers/save");
  
  useEffect(() => {
    // Log initialized data for debugging
    console.log("Component Initialized with:", {
      selectedSubject,
      semester,
      unitsCount: selectedUnits.length,
      formattedQuestionsCount: formattedQuestions.length,
      apiUrl
    });
  }, []);
  
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

  // Helper function to try all possible endpoints
  const tryAllEndpoints = async (paperData) => {
    const possibleEndpoints = [
      "http://localhost:5000/api/papers/save", 
      "http://localhost:5000/save",
      "http://localhost:5000/api/questions/save"
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Trying endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paperData)
        });
        
        if (response.ok) {
          console.log(`Success with endpoint: ${endpoint}`);
          setApiUrl(endpoint);
          return { success: true, response };
        } else {
          console.log(`Failed with endpoint: ${endpoint}, status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error with endpoint ${endpoint}:`, error);
      }
    }
    
    return { success: false, message: "All endpoints failed" };
  };

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

  const handleSaveToBackend = async () => {
    setIsLoading(true);
    
    try {
      // Get all valid (non-empty) questions
      let allQuestions = [];
      
      // Collect all unique units
      const uniqueUnits = new Set();
      
      Object.entries(questionsData).forEach(([unit, questions]) => {
        // Add this unit to the set of unique units
        uniqueUnits.add(unit);
        
        questions.forEach(q => {
          // Skip empty questions
          if (!q.text || q.text.trim() === '') return;
          
          // Create properly formatted question
          allQuestions.push({
            text: q.text.trim(),
            marks: parseInt(q.marks) || 2,
            image: q.image || null,
            unit: unit
          });
        });
      });
      
      if (allQuestions.length === 0) {
        throw new Error("No valid questions to save. Please add at least one question with text.");
      }
      
      // Convert the Set to an Array
      const unitsArray = Array.from(uniqueUnits);
      
      // Create a paper title using the subject and semester
      const paperTitle = `${selectedSubject} - ${semester}`;
      
      // Get the first unit from the questions
      const firstUnit = allQuestions[0].unit || "1";
      
      // Create the data object exactly as we see in the MongoDB records
      const paperData = {
        // Required top-level fields matching exactly what we see in the database
        text: paperTitle,
        marks: 100,
        subject: selectedSubject,
        unit: firstUnit, // Keep for compatibility
        units: unitsArray, // Add the array of all unique units
        semester: semester,
        
        // Questions array
        questions: allQuestions
      };
      
      console.log("Sending data to backend:", JSON.stringify(paperData, null, 2));
      
      // Use the endpoint that matches what we see in server.js
      const response = await fetch("http://localhost:5000/api/papers/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paperData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Server responded with ${response.status}: ${errorText}`);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(`Server error: ${errorData.error || errorData.message || "Unknown error"}`);
        } catch (e) {
          throw new Error(`Server error: ${errorText || response.statusText}`);
        }
      }
      
      const responseData = await response.json();
      console.log("Success response:", responseData);
      
      // Store the ID from the response for navigation
      if (responseData._id) {
        setSavedPaperId(responseData._id);
        console.log("Paper saved with ID:", responseData._id);
      }
      
      alert("✅ Paper saved successfully!");
    } catch (error) {
      console.error("Error saving paper:", error);
      alert(`Error saving paper: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFinalPaper = async () => {
    try {
      
      // Open modal after saving
      setModalOpen(true);
    } catch (error) {
      console.error("❌ Error finalizing paper:", error);
      alert("Error finalizing paper: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleViewPaper = () => {
    // Close modal
    setModalOpen(false);
    
    // Use the savedPaperId if available, otherwise fall back to id prop
    const paperId = savedPaperId || id;
    
    if (paperId) {
      navigate(`/viewpaper/${paperId}`); // Navigate to ViewPaper.js with the paper ID
    } else {
      console.warn("No paper ID available for navigation");
      alert("⚠️ Please save the paper");
    }
  };

  // Find the correct index for a question in the combined list
  const getQuestionNumber = (unit, questionIndex, markValue) => {
    const questionsWithSameMarks = questionsData[unit].filter(q => q.marks === markValue);
    return questionsWithSameMarks.findIndex(q => q === questionsData[unit][questionIndex]) + 1;
  };

  return (
    <div className="min-h-screen bg-amber-200 py-6 px-4 font-sans">
      <div className="w-32 h-20 flex-inline text-red-800 p-1 bg-orange-200 rounded-md border border-red-200 font-semibold text-center text-sm mb-6 ml-auto">
        <span className="flex items-center gap-3">    
          NOTE: <br></br>THIS IS THE FINAL PREVIEW
          </span>
        </div>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-black text-center mb-6 font-sans drop-shadow-md">
          Preview Questions
        </h2>

        {/* Modal Component */}
        <ModalRosh 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          title="Paper Finalized Successfully!"
        >
          <div className="text-center p-4">
            <p className="mb-6 text-gray-700">
              Your question paper has been saved successfully. You can now view the final paper for approval.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={handleViewPaper}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <span>View Paper</span> 
                <span className="text-xl">➔</span>
              </button>
            </div>
          </div>
        </ModalRosh>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-1 text-center">BCA - {semester}</h3>
          <h4 className="text-lg text-gray-700">{selectedSubject}</h4>
        </div>

        {/* Question Units */}
        {Object.entries(questionsData).map(([unit, questions]) => (
          <div key={unit} className="mb-8 bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4 text-center">
              Unit {unit}
            </h3>

            {/* Part A - 2 Marks Questions */}
            <div className="mb-6">
              <h4 className="text-red-600 font-semibold bg-gray-100 p-2 rounded-md mb-3 text-center">
                Part A - 2 Marks Questions
              </h4>
              
              <div className="space-y-2">
                {questions
                  .filter(q => q.marks === '2')
                  .map((q, index) => {
                    const questionIndex = questionsData[unit].findIndex(question => question === q);
                    const questionNumber = getQuestionNumber(unit, questionIndex, '2');
                    
                    return (
                      <div key={index} className="p-3 border-b border-gray-200 text-left">
                        {isEditing ? (
                          <div className="flex flex-col w-full">
                            <input
                              value={typeof q.text === 'string' && !q.text.startsWith('<') ? q.text : ''}
                              onChange={(e) => handleQuestionChange(unit, questionIndex, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                            />
                            
                            <button 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this question?")) {
                                  setQuestionsData(prev => ({
                                    ...prev,
                                    [unit]: prev[unit].filter((_, i) => i !== questionIndex)
                                  }));
                                }
                              }}
                              className="self-end flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                              title="Delete question"
                            >
                              <Trash size={15}/>
                            </button>
                          </div>
                        ) : (
                          <div className="text-sm">
                            <span className="font-semibold text-base">Q{questionNumber}:</span>{' '}
                            <span dangerouslySetInnerHTML={{ __html: q.text }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              
              {isEditing && (
                <button 
                  onClick={() => handleAddQuestion(unit, '2')} 
                  className="mt-1 px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors text-sm text-center"
                  title="Add 2 mark question"
                >
                  <Plus size={16}/>
                </button>
              )}
            </div>

            {/* Part B - 4 Marks Questions */}
            <div className="mt-6">
              <h4 className="text-blue-600 font-semibold bg-gray-100 p-2 rounded-md mb-3 text-center">
                Part B - 4 Marks Questions
              </h4>
              
              <div className="space-y-4">
                {questions
                  .filter(q => q.marks === '4')
                  .map((q, index) => {
                    const questionIndex = questionsData[unit].findIndex(question => question === q);
                    const questionNumber = getQuestionNumber(unit, questionIndex, '4');
                    
                    return (
                      <div key={index} className="p-3 border-b border-gray-200 text-left">
                        {isEditing ? (
                          <div className="flex flex-col w-full">
                            <textarea
                              value={typeof q.text === 'string' && !q.text.startsWith('<') ? q.text : ''}
                              onChange={(e) => handleQuestionChange(unit, questionIndex, e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-md mb-2 text-sm"
                              rows={3}
                            />
                            
                            <div className="mb-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageChange(unit, questionIndex, e.target.files[0])}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              />
                            </div>
                            
                            <button 
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this question?")) {
                                  setQuestionsData(prev => ({
                                    ...prev,
                                    [unit]: prev[unit].filter((_, i) => i !== questionIndex)
                                  }));
                                }
                              }}
                              className="self-end flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                              title="Delete question"
                            >
                              <Trash size={15}/>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div className="text-sm">
                              <span className="font-semibold text-base">Q{questionNumber}:</span>{' '}
                              <span dangerouslySetInnerHTML={{ __html: q.text }} />
                            </div>
                            
                            {q.image && (
                              <img 
                                src={q.image} 
                                alt="Question diagram" 
                                className="mt-2 max-h-40 object-contain border border-gray-200 rounded-md" 
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              
              {isEditing && (
                <button 
                  onClick={() => handleAddQuestion(unit, '4')} 
                  className="mt-1 px-3 py-1 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors text-sm text-center"
                  title="Add 4 mark question"
                >
                <Plus size={15}/>
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {isEditing ? (
            <>
              <button 
                onClick={handleCancel} 
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-md transition-colors"
              >
                Cancel
              </button>

              <button 
                onClick={handleSaveToBackend} 
                disabled={isLoading} 
                className={`px-4 py-2 bg-blue-600 text-white rounded-md border border-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 shadow-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isLoading ? "Saving..." : (
                  <span className="flex items-center gap-2">
                    Save Changes <Save size={18} />
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handleEdit} 
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 shadow-md transition-colors"
              >
                <span className="flex items-center gap-2">
                  Edit Questions <Edit size={18} />
                </span>
              </button>
              
              <button 
                onClick={handleSaveToBackend} 
                disabled={isLoading} 
                className={`px-4 py-2 bg-blue-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isLoading ? "Saving..." : (
                  <span className="flex items-center gap-2">
                    Save Draft <CheckCircle size={18} />
                  </span>
                )}
              </button>
            </>
          )}

          <button 
            onClick={handleFinalPaper} 
            disabled={isLoading}
            className={`px-4 py-2 bg-green-600 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-700'}`}
          >
            {isLoading ? "Processing..." : (
              <span className="flex items-center gap-2">
                Final Paper <FileText size={18} />
              </span>
            )}
          </button>
        </div>
        
        {/* Warning Message */}
        <div className="bg-red-100 text-red-800 p-3 rounded-md border border-red-200 font-semibold text-center mb-6">
          ⚠️ WARNING: MOVING BACK TO THE PREVIOUS PAGE CAN CAUSE YOU TO LOSE EVERYTHING ⚠️ 
        </div>
      </div>
    </div>
  );
};

export default PreviewPage;