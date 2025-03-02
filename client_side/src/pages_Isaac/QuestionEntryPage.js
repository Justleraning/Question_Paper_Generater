import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQPContext } from "../Contexts/QPContext.js";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { 
  FaBold, FaItalic, FaUnderline, 
  FaAlignLeft, FaAlignCenter, FaAlignRight,
  FaImage, FaFont, FaEye, FaEdit, FaTimes, FaTrash,
  FaArrowLeft, FaArrowRight, FaSave, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";

const QuestionEntryPage = () => {
  const { subjectDetails, numUnits, marks, questions, setQuestions } = useQPContext();
  const subjectId = subjectDetails?.id;
  const [currentUnit, setCurrentUnit] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [unitId, setUnitId] = useState(null);
  const [isFetchingUnitId, setIsFetchingUnitId] = useState(true);
  const navigate = useNavigate();
  
  // State to track if the current question has been saved
  const [isCurrentQuestionSaved, setIsCurrentQuestionSaved] = useState(false);
  
  // State for preview modal
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  
  // State for delete confirmation modal
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);

  const totalQuestions = marks === 20 ? 40 : 60;
  const questionsPerUnit = Math.floor(totalQuestions / numUnits);
  const currentQuestions = questions?.[currentUnit - 1] || [];
  const subjectName = subjectDetails?.name || "Default Subject";
  const courseTitle = subjectDetails?.course || "Untitled Course";

  // Track completed questions count for the current unit
  const [completedQuestionsCount, setCompletedQuestionsCount] = useState(currentQuestions.length || 0);

  useEffect(() => {
    // Update completed questions count when unit changes or questions change
    const unitQuestions = questions?.[currentUnit - 1] || [];
    setCompletedQuestionsCount(unitQuestions.length);
  }, [currentUnit, questions]);

  useEffect(() => {
    let isMounted = true;

    if (questions.length === 0) {
        console.log("🚫 Skipping fetchUnitId because no questions have been entered yet.");
        setIsFetchingUnitId(false);
        return;
    }

    setIsFetchingUnitId(true);

    const fetchUnitId = async () => {
        try {
            console.log(`🔄 Fetching unit ID for Unit ${currentUnit}...`, subjectId);

            const response = await fetch("http://localhost:5000/api/units");

            if (!response.ok) {
                throw new Error(`❌ Failed to fetch units: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("📜 Fetched Units Data:", data);

            if (data.units && data.units.length > 0) {
                console.log(`🔍 Searching for Unit ${currentUnit} with subjectId:`, subjectId);

                const fetchedUnit = data.units.find(
                    u => u.name === `Unit ${currentUnit}` && u.subjectId === subjectId
                );

                if (fetchedUnit) {
                    setUnitId(fetchedUnit._id || fetchedUnit.unitId);
                    console.log(`✅ Successfully set Unit ID: ${fetchedUnit._id || fetchedUnit.unitId}`);
                } else {
                    console.warn(`⚠️ No matching unit found for "Unit ${currentUnit}"`);
                    setUnitId(null);
                }
            } else {
                console.warn("⚠️ No units found in API response.");
                setUnitId(null);
            }
        } catch (error) {
            console.error("❌ Error fetching unitId:", error);
            setUnitId(null);
        } finally {
            if (isMounted) {
                setIsFetchingUnitId(false);
            }
        }
    };

    fetchUnitId();

    return () => {
        isMounted = false;
    };
}, [currentUnit, questions.length, subjectId]);

  const [questionText, setQuestionText] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      TextAlign.configure({
        types: ["paragraph","heading"],
      }),
    ],
    content: questionText, 
    onUpdate: ({ editor }) => {
      setQuestionText(editor.getHTML()); 
      // Mark the question as unsaved when edited
      setIsCurrentQuestionSaved(false);
    },
  });

  const [correctOption, setCorrectOption] = useState("");
  const [options, setOptions] = useState({
    A: { type: "text", value: "" },
    B: { type: "text", value: "" },
    C: { type: "text", value: "" },
    D: { type: "text", value: "" },
  });

  const handleToggleOptionType = (key) => {
    setOptions({
      ...options,
      [key]: {
        type: options[key].type === "text" ? "image" : "text",
        value: options[key].value
      }
    });
    // Mark the question as unsaved when options are changed
    setIsCurrentQuestionSaved(false);
  };

  const handleOptionChange = (key, value) => {
    setOptions({
      ...options,
      [key]: { ...options[key], value }
    });
    // Mark the question as unsaved when options are changed
    setIsCurrentQuestionSaved(false);
  };

  const handleCorrectOptionChange = (option) => {
    setCorrectOption(option);
    // Mark the question as unsaved when correct option is changed
    setIsCurrentQuestionSaved(false);
  };

  const handleSaveQuestion = async () => {
    console.log("🔍 Checking subjectId before saving:", subjectId);

    if (!subjectId) {
      console.error("❌ Validation Failed: subjectId is missing!");
      alert("⚠️ Subject ID is missing. Please try again.");
      return;
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      alert("❌ Authentication failed: No token found in session.");
      return;
    }

    const cleanedQuestionText = editor.getText()?.trim() || "";
    if (!cleanedQuestionText) {
      alert("⚠️ Please enter a valid question.");
      return;
    }
    
    const formattedOptions = [
      options.A.value?.trim() || "",
      options.B.value?.trim() || "",
      options.C.value?.trim() || "",
      options.D.value?.trim() || "",
    ];

    if (!Array.isArray(formattedOptions) || formattedOptions.length !== 4 || formattedOptions.some(opt => opt === "")) {
        alert("⚠️ Please provide exactly 4 valid options.");
        return;
    }
    
    if (!["A", "B", "C", "D"].includes(correctOption)) {
      alert("⚠️ Please select a valid correct option (A, B, C, or D).");
      return;
    }

    // Create a new question object
    const newQuestion = {
      subjectId,
      text: cleanedQuestionText,
      options: [
        options.A.value?.trim() || "",
        options.B.value?.trim() || "",
        options.C.value?.trim() || "",
        options.D.value?.trim() || "",
      ],
      optionTypes: [
        options.A.type,
        options.B.type,
        options.C.type,
        options.D.type
      ],
      correctOption: correctOption.trim(),
      isImage: formattedOptions.some(opt => opt.startsWith("http")),
      index: currentQuestionIndex + 1,
      subject: subjectName || "Default Subject",
      courseName: courseTitle || "Untitled Course"
    };
    
    console.log("📤 Sending Question to API:", JSON.stringify(newQuestion, null, 2));

    try {
      // If we're editing an existing question, update the question
      if (editingQuestionIndex !== null && editingQuestionIndex < currentQuestions.length) {
        const updatedQuestions = [...questions];
        updatedQuestions[currentUnit - 1][editingQuestionIndex] = newQuestion;
        setQuestions(updatedQuestions);
        setEditingQuestionIndex(null);
        setIsCurrentQuestionSaved(true);
        return;
      }

      const response = await fetch("http://localhost:5000/api/questions-isaac", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(newQuestion),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to save question: ${errorText}`);
      }

      const data = await response.json();
      console.log("✅ Successfully saved question:", data.newQuestion);

      // Update the questions array in context to track progress
      const updatedQuestions = [...questions];
      if (!updatedQuestions[currentUnit - 1]) {
        updatedQuestions[currentUnit - 1] = [];
      }
      updatedQuestions[currentUnit - 1].push(newQuestion);
      setQuestions(updatedQuestions);
      
      // Update completed questions count
      setCompletedQuestionsCount(prev => prev + 1);
      
      // Mark the current question as saved
      setIsCurrentQuestionSaved(true);

    } catch (error) {
      console.error("❌ Error saving question:", error.message);
      alert(`❌ Failed to save question: ${error.message}`);
    }
  };

  const handleNextQuestion = () => {
    // Only proceed if the current question has been saved
    if (!isCurrentQuestionSaved) {
      alert("Please save the current question before proceeding to the next question.");
      return;
    }
    
    if (currentQuestionIndex < currentQuestions.length - 1) {
        // Navigate to an existing question
        const nextQuestion = currentQuestions[currentQuestionIndex + 1];
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        
        setQuestionText(nextQuestion.text || "");
        if (editor) {
          editor.commands.setContent(nextQuestion.text || "");
        }
        setCorrectOption(nextQuestion.correctOption || "");
        
        // Handle option types if they exist, otherwise default to text
        setOptions({
            A: { 
              type: nextQuestion.optionTypes?.[0] || "text", 
              value: nextQuestion.options?.[0] || "" 
            },
            B: { 
              type: nextQuestion.optionTypes?.[1] || "text", 
              value: nextQuestion.options?.[1] || "" 
            },
            C: { 
              type: nextQuestion.optionTypes?.[2] || "text", 
              value: nextQuestion.options?.[2] || "" 
            },
            D: { 
              type: nextQuestion.optionTypes?.[3] || "text", 
              value: nextQuestion.options?.[3] || "" 
            },
        });
        // Set this question as already saved since we're loading it from the context
        setIsCurrentQuestionSaved(true);
    } else {
        // Creating a new question
        setCurrentQuestionIndex(prev => prev + 1);
        
        // Reset all fields for a new question
        setQuestionText("");
        if (editor) {
          editor.commands.setContent("");
        }
        setCorrectOption("");
        setOptions({
          A: { type: "text", value: "" },
          B: { type: "text", value: "" },
          C: { type: "text", value: "" },
          D: { type: "text", value: "" },
        });
        // New question is not yet saved
        setIsCurrentQuestionSaved(false);
    }
  };

  const handlePreviousQuestion = () => {
    // Ask for confirmation if the current question is not saved
    if (!isCurrentQuestionSaved && questionText.trim() !== "" && 
        (options.A.value || options.B.value || options.C.value || options.D.value)) {
      const confirmMove = window.confirm("You have unsaved changes. Are you sure you want to navigate away?");
      if (!confirmMove) {
        return;
      }
    }
    
    if (currentQuestionIndex > 0) {
      const prevQuestion = currentQuestions[currentQuestionIndex - 1];
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      
      setQuestionText(prevQuestion.text || "");
      if (editor) {
        editor.commands.setContent(prevQuestion.text || "");
      }
      setCorrectOption(prevQuestion.correctOption || "");
      
      // Handle option types if they exist, otherwise default to text
      setOptions({
        A: { 
          type: prevQuestion.optionTypes?.[0] || "text", 
          value: prevQuestion.options?.[0] || "" 
        },
        B: { 
          type: prevQuestion.optionTypes?.[1] || "text", 
          value: prevQuestion.options?.[1] || "" 
        },
        C: { 
          type: prevQuestion.optionTypes?.[2] || "text", 
          value: prevQuestion.options?.[2] || "" 
        },
        D: { 
          type: prevQuestion.optionTypes?.[3] || "text", 
          value: prevQuestion.options?.[3] || "" 
        },
      });
      
      // Set this question as already saved since we're loading it from the context
      setIsCurrentQuestionSaved(true);
    }
  };

  const handleNextUnit = () => {
    // Only proceed if the current question has been saved or is empty
    if (!isCurrentQuestionSaved && questionText.trim() !== "" && 
        (options.A.value || options.B.value || options.C.value || options.D.value)) {
      const confirmMove = window.confirm("You have unsaved changes. Are you sure you want to navigate to the next unit?");
      if (!confirmMove) {
        return;
      }
    }
    
    if (currentUnit < numUnits) {
        setCurrentUnit(prevUnit => prevUnit + 1);
        setCurrentQuestionIndex(0);

        // Reset question fields when switching units
        setQuestionText("");
        if (editor) {
          editor.commands.setContent("");
        }
        setCorrectOption("");
        setOptions({
            A: { type: "text", value: "" },
            B: { type: "text", value: "" },
            C: { type: "text", value: "" },
            D: { type: "text", value: "" },
        });
        
        // New question in new unit is not yet saved
        setIsCurrentQuestionSaved(false);
    } else {
        navigate("/final-paper");
    }
  };

  // Function to handle editing a question from the preview
  const handleEditQuestion = (index) => {
    setEditingQuestionIndex(index);
    const questionToEdit = currentQuestions[index];
    
    // Load the question data into the form
    setQuestionText(questionToEdit.text || "");
    if (editor) {
      editor.commands.setContent(questionToEdit.text || "");
    }
    setCorrectOption(questionToEdit.correctOption || "");
    
    // Handle option types if they exist, otherwise default to text
    setOptions({
      A: { 
        type: questionToEdit.optionTypes?.[0] || "text", 
        value: questionToEdit.options?.[0] || "" 
      },
      B: { 
        type: questionToEdit.optionTypes?.[1] || "text", 
        value: questionToEdit.options?.[1] || "" 
      },
      C: { 
        type: questionToEdit.optionTypes?.[2] || "text", 
        value: questionToEdit.options?.[2] || "" 
      },
      D: { 
        type: questionToEdit.optionTypes?.[3] || "text", 
        value: questionToEdit.options?.[3] || "" 
      },
    });
    
    // Close the preview modal and update current question index
    setShowPreview(false);
    setCurrentQuestionIndex(index);
    
    // This question is considered "not saved" until the user saves the edits
    setIsCurrentQuestionSaved(false);
  };

  // Function to initiate question deletion (showing confirmation modal)
  const handleInitiateDelete = (index) => {
    setQuestionToDelete(index);
    setShowDeleteConfirmation(true);
  };

  // Function to confirm and delete a question
  const handleDeleteQuestion = async () => {
    if (questionToDelete === null) return;
    
    try {
      const token = sessionStorage.getItem("token");
      const questionId = currentQuestions[questionToDelete]._id;
      
      // If question has an ID, delete it from the backend
      if (questionId && token) {
        try {
          const response = await fetch(`http://localhost:5000/api/questions-isaac/${questionId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            console.warn(`Warning: Could not delete question from server: ${errorText}`);
            // Continue with client-side deletion even if server delete fails
          } else {
            console.log("✅ Question deleted from server successfully");
          }
        } catch (error) {
          console.warn("Warning: Error deleting from server, will still delete locally", error);
          // Continue with client-side deletion even if server delete fails
        }
      }
      
      // Update questions array to remove the deleted question
      const updatedQuestions = [...questions];
      updatedQuestions[currentUnit - 1] = [
        ...currentQuestions.slice(0, questionToDelete),
        ...currentQuestions.slice(questionToDelete + 1)
      ];
      
      setQuestions(updatedQuestions);
      
      // Update completed questions count
      setCompletedQuestionsCount(prev => prev - 1);
      
      // Reset state
      setShowDeleteConfirmation(false);
      setQuestionToDelete(null);
      
      // If we're editing this question, reset to a blank question
      if (currentQuestionIndex === questionToDelete) {
        setQuestionText("");
        if (editor) {
          editor.commands.setContent("");
        }
        setCorrectOption("");
        setOptions({
          A: { type: "text", value: "" },
          B: { type: "text", value: "" },
          C: { type: "text", value: "" },
          D: { type: "text", value: "" },
        });
        setIsCurrentQuestionSaved(false);
      } 
      // If we're editing a question that comes after the deleted one, adjust the index
      else if (currentQuestionIndex > questionToDelete) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
      
      console.log("✅ Question deleted successfully");
    } catch (error) {
      console.error("❌ Error deleting question:", error);
      alert("Failed to delete question. Please try again.");
    }
  };

  // Calculate progress percentage
  const progressPercentage = Math.min(100, (completedQuestionsCount / questionsPerUnit) * 100);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header with Subject Information */}
      <header className="bg-indigo-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{subjectName}</h1>
            <p className="text-indigo-200">{courseTitle}</p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center space-x-2">
            <span className="text-sm font-medium bg-indigo-800 py-1 px-3 rounded-full">
              {marks} Marks Paper
            </span>
            <span className="text-sm font-medium bg-indigo-800 py-1 px-3 rounded-full">
              {numUnits} Units
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* Unit Navigation and Progress */}
        <div className="mb-8 bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-800">
                Unit {currentUnit} of {numUnits}
              </h2>
              <p className="text-gray-600 mt-1">
                Question {currentQuestionIndex + 1} {currentQuestions.length > 0 ? `of ${currentQuestions.length + (isCurrentQuestionSaved ? 0 : 1)}` : ''}
              </p>
            </div>
            
            <div className="flex flex-col w-full md:w-64">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progress</span>
                <span>{completedQuestionsCount}/{questionsPerUnit} Questions</span>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {!isFetchingUnitId && unitId && (
            <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              <span className="mr-1 text-green-500">✓</span> Unit ID: {unitId}
            </div>
          )}
        </div>

        {/* Question Form */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {/* Form Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingQuestionIndex !== null ? 
                `Editing Question #${editingQuestionIndex + 1}` : 
                `Question Entry Form`
              }
            </h3>
          </div>
          
          <div className="p-6">
            {/* Question Text Section */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text
              </label>
              
              <div className="bg-gray-50 border border-gray-300 rounded-t-lg flex items-center p-2 space-x-1">
                <button 
                  onClick={() => editor?.chain().focus().toggleBold().run()} 
                  className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('bold') ? 'bg-gray-300 text-indigo-700' : 'text-gray-700'}`}
                  title="Bold"
                >
                  <FaBold size={16} />
                </button>
                <button 
                  onClick={() => editor?.chain().focus().toggleItalic().run()} 
                  className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive('italic') ? 'bg-gray-300 text-indigo-700' : 'text-gray-700'}`}
                  title="Italic"
                >
                  <FaItalic size={16} />
                </button>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <button 
                  onClick={() => editor?.chain().focus().setTextAlign("left").run()} 
                  className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive({ textAlign: 'left' }) ? 'bg-gray-300 text-indigo-700' : 'text-gray-700'}`}
                  title="Align Left"
                >
                  <FaAlignLeft size={16} />
                </button>
                <button 
                  onClick={() => editor?.chain().focus().setTextAlign("center").run()} 
                  className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive({ textAlign: 'center' }) ? 'bg-gray-300 text-indigo-700' : 'text-gray-700'}`}
                  title="Align Center"
                >
                  <FaAlignCenter size={16} />
                </button>
                <button 
                  onClick={() => editor?.chain().focus().setTextAlign("right").run()} 
                  className={`p-2 rounded hover:bg-gray-200 ${editor?.isActive({ textAlign: 'right' }) ? 'bg-gray-300 text-indigo-700' : 'text-gray-700'}`}
                  title="Align Right"
                >
                  <FaAlignRight size={16} />
                </button>
              </div>

              <EditorContent 
                editor={editor} 
                className="border border-t-0 border-gray-300 rounded-b-lg w-full p-4 min-h-40 max-h-80 overflow-y-auto bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
              />
            </div>

            {/* Options Section */}
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-800 mb-4">Answer Options</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["A", "B", "C", "D"].map((key) => (
                  <div key={key} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center">
                        <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-800 font-semibold flex items-center justify-center mr-2">
                          {key}
                        </span>
                        <span className="text-sm font-medium text-gray-700">Option {key}</span>
                      </label>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => handleToggleOptionType(key)} 
                          className={`p-1.5 rounded text-xs ${options[key].type === 'text' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                          title="Text Option"
                        >
                          <FaFont size={14} />
                        </button>
                        <button 
                          onClick={() => handleToggleOptionType(key)} 
                          className={`p-1.5 rounded text-xs ${options[key].type === 'image' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}
                          title="Image Option"
                        >
                          <FaImage size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="text"
                        value={options[key].value}
                        onChange={(e) => handleOptionChange(key, e.target.value)}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 pr-8"
                        placeholder={options[key].type === 'image' ? 'Enter image URL...' : 'Enter option text...'}
                      />
                      
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <input
                          id={`radio-${key}`}
                          type="radio"
                          value={key}
                          checked={correctOption === key}
                          onChange={() => handleCorrectOptionChange(key)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                      </div>
                    </div>
                    
                    {correctOption === key && (
                      <div className="absolute -right-3 -top-3 bg-green-500 text-white rounded-full p-1 shadow-lg z-10">
                        <FaCheckCircle size={18} />
                      </div>
                    )}
                    
                    {options[key].type === 'image' && options[key].value && (
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50 flex items-center justify-center">
                        <img 
                          src={options[key].value} 
                          alt={`Option ${key} preview`} 
                          className="max-h-20 object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x50?text=Invalid+Image+URL';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Correct Answer Legend */}
            <div className="mb-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center text-sm">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-gray-600">Select the radio button next to the correct answer option</span>
              </div>
            </div>

            {/* Question Status Indicator */}
            <div className="mb-6 flex items-center justify-center">
              {isCurrentQuestionSaved ? (
                <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                  <FaCheckCircle className="mr-2" />
                  <span className="font-medium">Question saved successfully</span>
                </div>
              ) : questionText.trim() !== "" ? (
                <div className="flex items-center text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                  <FaExclamationTriangle className="mr-2" />
                  <span className="font-medium">Question has unsaved changes</span>
                </div>
              ) : null}
            </div>
            </div>
          
          {/* Action Buttons */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex space-x-3">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FaArrowLeft className="mr-2" />
                Previous
              </button>
              
              <button 
                onClick={handleSaveQuestion} 
                disabled={isCurrentQuestionSaved}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FaSave className="mr-2" />
                Save Question
              </button>
              
              <button
                onClick={handleNextQuestion}
                disabled={!isCurrentQuestionSaved && questionText.trim() !== ""}
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                Next
                <FaArrowRight className="ml-2" />
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowPreview(true)}
                disabled={currentQuestions.length === 0}
                className="inline-flex items-center px-4 py-2 rounded-lg text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <FaEye className="mr-2" />
                Preview Unit
              </button>
              
              <button 
                onClick={handleNextUnit} 
                className="inline-flex items-center px-4 py-2 rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
              >
                {currentUnit < numUnits ? "Next Unit" : "Final Preview"}
                <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Unit Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800">Unit {currentUnit} Preview</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {currentQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <FaExclamationTriangle size={48} className="mb-4" />
                  <p className="text-lg">No questions added to this unit yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {currentQuestions.map((question, index) => (
                    <div key={index} className="border border-gray-200 rounded-xl shadow-sm overflow-hidden bg-white">
                      <div className="bg-indigo-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-medium text-indigo-800 flex items-center">
                          <span className="bg-indigo-100 text-indigo-800 h-6 w-6 rounded-full flex items-center justify-center mr-2 text-sm font-bold">
                            {index + 1}
                          </span>
                          <span>Question #{index + 1}</span>
                        </h3>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditQuestion(index)}
                            className="text-indigo-600 hover:text-indigo-800 bg-white p-2 rounded-full hover:bg-indigo-50 transition-colors border border-indigo-200"
                            title="Edit Question"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleInitiateDelete(index)}
                            className="text-red-600 hover:text-red-800 bg-white p-2 rounded-full hover:bg-red-50 transition-colors border border-red-200"
                            title="Delete Question"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-6 px-2 py-3 bg-gray-50 rounded-lg">
                          <div dangerouslySetInnerHTML={{ __html: question.text }} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {["A", "B", "C", "D"].map((opt, i) => (
                            <div 
                              key={opt} 
                              className={`p-3 border rounded-lg flex items-start space-x-3 ${
                                question.correctOption === opt 
                                  ? 'bg-green-50 border-green-300 ring-2 ring-green-200' 
                                  : 'bg-white hover:bg-gray-50'
                              }`}
                            >
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                                question.correctOption === opt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}>
                                {opt}
                              </div>
                              
                              <div className="flex-1">
                                {question.optionTypes && question.optionTypes[i] === 'image' ? (
                                  <div className="mt-2">
                                    <img 
                                      src={question.options[i]} 
                                      alt={`Option ${opt}`}
                                      className="max-h-24 object-contain mx-auto"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/160x90?text=Invalid+Image';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <span className="block pt-0.5">{question.options[i]}</span>
                                )}
                              </div>
                              
                              {question.correctOption === opt && (
                                <span className="text-green-600 flex-shrink-0">
                                  <FaCheckCircle size={18} />
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-between items-center">
              <span className="text-gray-600">
                Showing {currentQuestions.length} of {questionsPerUnit} questions
              </span>
              <button 
                onClick={() => setShowPreview(false)}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-red-50 p-6 border-b border-red-100">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-3 rounded-full text-red-600 mr-4">
                  <FaTrash size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Delete Question</h3>
              </div>
              
              <p className="text-gray-600">
                Are you sure you want to delete Question #{questionToDelete + 1}?
              </p>
            </div>
            
            <div className="p-6">
              <p className="mb-6 flex items-center text-red-600 bg-red-50 rounded-lg p-3">
                <FaExclamationTriangle className="mr-2" /> 
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteQuestion}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Delete Question
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default QuestionEntryPage;