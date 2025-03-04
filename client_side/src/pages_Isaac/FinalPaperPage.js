import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQPContext } from '../Contexts/QPContext.js';
import randomizeQuestions from '../Utils/randomizeQuestions.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../assets/image.png';

const stripHtmlTags = (input) => {
  if (!input) return "__________";
  return input.replace(/<[^>]*>/g, "").trim();
};

const isImageUrl = (url) => {
  return /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))|data:image\//i.test(url);
};

const FinalPaperPage = () => {
  const { subjectDetails, questions, marks } = useQPContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [finalPaper, setFinalPaper] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [isPreview, setIsPreview] = useState(true);
  const paperRef = useRef(null);
  const currentDate = new Date().toLocaleDateString();
  
  // State for the editing modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    console.log("Current state:", {
      questionsFromContext: questions,
      finalPaperState: finalPaper,
      marksValue: marks,
      subjectDetailsValue: subjectDetails
    });
  }, [questions, finalPaper, marks, subjectDetails]);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEditModal(false);
      }
    };

    if (showEditModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEditModal]);

  // Filter questions to only include the current subject
  const filterQuestionsByCurrentSubject = (questionsArray) => {
    // If we don't have a subject ID, return an empty array
    if (!subjectDetails || !subjectDetails.id) {
      console.warn("⚠️ No subject ID available for filtering");
      return [];
    }
    
    // Filter questions to only include those matching the current subject ID
    return questionsArray.filter(question => {
      // Handle different possible ways the subject ID might be stored
      const questionSubjectId = 
        (question.subjectId && question.subjectId._id) || // If subjectId is an object with _id
        (question.subjectId && question.subjectId.id) ||  // If subjectId is an object with id
        question.subjectId ||                           // If subjectId is a direct ID string
        question.subject;                               // Alternative property name
        
      return questionSubjectId === subjectDetails.id;
    });
  };

  // Handle randomization of questions
  const handleRandomize = useCallback(() => {
    console.log("🔄 Randomizing Questions...");
    
    // Check if we already have questions in finalPaper
    let questionsToRandomize = finalPaper.length > 0 ? finalPaper : questions;
    
    // Make sure we're only working with questions for the current subject
    questionsToRandomize = filterQuestionsByCurrentSubject(questionsToRandomize);
    
    console.log("📜 Questions Before Randomization:", questionsToRandomize);
  
    if (!Array.isArray(questionsToRandomize) || questionsToRandomize.length === 0) {
      console.error("No questions available to randomize");
      alert("No questions available to randomize for the current subject. Please check the console for details.");
      return;
    }
  
    try {
      const randomizedPaper = randomizeQuestions(questionsToRandomize, marks === 20 ? 20 : 30);
      console.log("✅ Final Paper after Randomization:", randomizedPaper);
      
      if (randomizedPaper.length > 0) {
        setFinalPaper(randomizedPaper);
        
        const answers = randomizedPaper.map((q) => ({
          question: stripHtmlTags(q.text),
          correctOption: stripHtmlTags(q.correctOption),
        }));
        
        setCorrectAnswers(answers);
        console.log("✅ Answer Key:", answers);
      } else {
        console.warn("⚠️ Randomization returned empty array");
        alert("Randomization failed. Please check the console for details.");
      }
    } catch (error) {
      console.error("❌ Error during randomization:", error);
      alert("An error occurred during randomization. Please check the console for details.");
    }
  }, [questions, finalPaper, marks, subjectDetails]);

  // Load paper from state or randomize
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log("🔄 Fetching questions from backend...");
        // Use only the general endpoint that you have available
        const endpoint = "http://localhost:5000/api/questions-isaac/all";

        const response = await fetch(endpoint);

        if (!response.ok) {
          throw new Error(`Failed to fetch questions: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📜 Questions fetched from backend:", data);

        // Only process if we have valid data
        if (Array.isArray(data) && data.length > 0) {
          // Filter questions for the current subject on the frontend
          const filteredData = data.filter(question => {
            const questionSubjectId = 
              (question.subjectId && question.subjectId._id) || 
              (question.subjectId && question.subjectId.id) || 
              question.subjectId || 
              question.subject;
              
            return questionSubjectId === subjectDetails?.id;
          });
          
          if (filteredData.length === 0) {
            console.warn("⚠️ No questions found for the current subject:", subjectDetails);
            alert(`No questions found for subject: ${subjectDetails?.name || 'Unknown'}. Please add questions first.`);
            return;
          }
          
          const randomizedPaper = randomizeQuestions(filteredData, marks === 20 ? 20 : 30);
          setFinalPaper(randomizedPaper);
          setCorrectAnswers(
            randomizedPaper.map((q) => ({
              question: stripHtmlTags(q.text),
              correctOption: stripHtmlTags(q.correctOption),
            }))
          );
        } else {
          console.warn("⚠️ No questions found in database or invalid format:", data);
          alert("No questions found in database. Please add questions first.");
        }
      } catch (error) {
        console.error("❌ Error fetching questions:", error.message);
        alert(`Error fetching questions: ${error.message}`);
      }
    };
  
    // Clear existing questions when subject changes
    if (subjectDetails?.id) {
      setFinalPaper([]);
      setCorrectAnswers([]);
    }
  
    // If coming from another page, load previous data; otherwise, fetch
    if (location.state?.finalPaper && Array.isArray(location.state.finalPaper) && location.state.finalPaper.length > 0) {
      console.log("📝 Loading questions from previous state:", location.state.finalPaper);
      
      // Filter to ensure only questions from current subject are loaded
      const filteredPaper = filterQuestionsByCurrentSubject(location.state.finalPaper);
      setFinalPaper(filteredPaper);
      
      // Also filter the correct answers
      if (location.state.correctAnswers && Array.isArray(location.state.correctAnswers)) {
        const filteredAnswers = location.state.correctAnswers.slice(0, filteredPaper.length);
        setCorrectAnswers(filteredAnswers);
      } else {
        setCorrectAnswers([]);
      }
    } else if (Array.isArray(questions) && questions.length > 0) {
      console.log("📝 Using questions from context:", questions);
      
      // Filter to ensure only questions from current subject are used
      const filteredQuestions = filterQuestionsByCurrentSubject(questions);
      if (filteredQuestions.length > 0) {
        const randomizedPaper = randomizeQuestions(filteredQuestions, marks === 20 ? 20 : 30);
        setFinalPaper(randomizedPaper);
        setCorrectAnswers(
          randomizedPaper.map((q) => ({
            question: stripHtmlTags(q.text),
            correctOption: stripHtmlTags(q.correctOption),
          }))
        );
      } else {
        // If no filtered questions, fetch from backend
        fetchQuestions();
      }
    } else {
      console.log("📝 No questions in context or previous state, fetching from API...");
      fetchQuestions();
    }
  }, [location.state, marks, questions, subjectDetails]);

  // Open edit modal for a question
  const handleEditQuestion = (question, index) => {
    // Create a deep copy of the question to edit
    const questionCopy = JSON.parse(JSON.stringify(question));
    setEditingQuestion(questionCopy);
    setEditingIndex(index);
    setShowEditModal(true);
  };

  // Handle saving the edited question
  const handleSaveEdit = () => {
    if (editingIndex === null || !editingQuestion) return;
    
    const updatedPaper = [...finalPaper];
    updatedPaper[editingIndex] = editingQuestion;
    setFinalPaper(updatedPaper);
    
    // Update answer key if question text or correct option changed
    const updatedAnswers = [...correctAnswers];
    updatedAnswers[editingIndex] = {
      question: stripHtmlTags(editingQuestion.text),
      correctOption: stripHtmlTags(editingQuestion.correctOption),
    };
    setCorrectAnswers(updatedAnswers);
    
    // Close the modal
    setShowEditModal(false);
    setEditingQuestion(null);
    setEditingIndex(null);
  };

  // Handle option changes in edit form
  const handleOptionChange = (optionIndex, value) => {
    if (!editingQuestion) return;
    
    let updatedOptions;
    
    if (Array.isArray(editingQuestion.options)) {
      updatedOptions = [...editingQuestion.options];
      updatedOptions[optionIndex] = value;
    } else {
      updatedOptions = { ...editingQuestion.options };
      const key = String.fromCharCode(65 + optionIndex); // A, B, C, D
      updatedOptions[key] = value;
    }
    
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions
    });
  };

  // Update the correctOption in the editing form
  const handleCorrectOptionChange = (option) => {
    if (!editingQuestion) return;
    
    setEditingQuestion({
      ...editingQuestion,
      correctOption: option
    });
  };

  // Download PDF with multi-page support
  const handleDownloadPDF = () => {
    setIsPreview(false);
    setTimeout(() => {
      if (!paperRef.current) return;
      
      html2canvas(paperRef.current, { 
        scale: 2,
        logging: false,
        useCORS: true
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // A4 dimensions in mm
        const pdfWidth = 210;
        const pdfHeight = 297;
        
        // Calculate image dimensions
        const imgWidth = pdfWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add multi-page support - split if content exceeds A4 height
        let heightLeft = imgHeight;
        let position = 0;
        let pageNumber = 1;
        
        // First page
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
        
        // Additional pages if needed
        while (heightLeft > 0) {
          position = -pdfHeight * pageNumber;
          pageNumber++;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
        }
        
        pdf.save('Final_Question_Paper.pdf');
        setTimeout(() => setIsPreview(true), 500);
      });
    }, 100);
  };

  // Handle going back to previous action
  const handlePrevious = () => {
    // Check if there's history to go back to
    if (window.history.length > 1) {
      // Go back to previous page in history
      window.history.back();
    } else {
      // Fallback to direct navigation if no history
      navigate('/question-entry', { 
        state: { 
          finalPaper, 
          correctAnswers,
          fromFinalPaper: true,
          currentSubject: subjectDetails
        } 
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Main content with scrollable area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center">
        {finalPaper.length > 0 ? (
          <>
            <div
              ref={paperRef}
              className="w-full max-w-3xl border p-6 bg-white mb-6 shadow-md"
            >
              {/* Header with logo and registration box */}
              <div className="flex justify-between items-start mb-2">
                {/* Logo on left */}
                <div className="w-24 h-24">
                  <img src={logo} alt="University Logo" className="w-full h-full" />
                </div>
                
                {/* Registration box on right */}
                <div className="border border-gray-400 p-2 text-xs w-40">
                  <p className="font-medium">Registration Number:</p>
                  <p className="font-medium mt-1">Date & Session: {currentDate}</p>
                </div>
              </div>

              {/* University information centered */}
              <div className="text-center">
                <h2 className="text-sm font-bold">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h2>
                <h3 className="text-sm font-bold">Course : BCA</h3>
                <h3 className="text-sm font-bold uppercase mt-1">SEMESTER EXAMINATION</h3>
                <h4 className="text-sm font-bold mt-1">
                  {subjectDetails?.code || "CA 3222"}: {subjectDetails?.name || "C# AND DOT NET FRAMEWORK"}
                </h4>
                <p className="text-xs italic mt-1">( For current batch students only )</p>
              </div>
              
              {/* Time and marks section */}
              <div className="flex justify-between items-center mt-4 mb-3 text-center">
                <p className="text-xs font-medium w-1/4">Time: 1 Hours</p>
                <p className="text-xs font-medium w-1/2">This paper contains MCQ Questions</p>
                <p className="text-xs font-medium w-1/4">Max Marks: {marks || '20'}</p>
              </div>

              {/* Part A section heading - centered */}
              <p className="mb-3 font-medium text-center text-sm">Answer all questions</p>
            
              {/* Questions section - with word wrap and better spacing */}
              {finalPaper.map((question, index) => (
                <div key={index} className="mb-6 text-left">
                  <div className="flex justify-between items-start group">
                    {/* Question with number */}
                    <div className="flex-1">
                      <p className="font-medium break-words">
                        {index + 1}. {stripHtmlTags(question.text)}
                      </p>
                    </div>
                    
                    {/* Edit button - always visible when in preview mode but not in PDF */}
                    {isPreview && (
                      <button 
                        onClick={() => handleEditQuestion(question, index)}
                        className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded"
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  {/* Options display with proper handling for both array and object formats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-6">
                    {Array.isArray(question.options) ? (
                      question.options.map((option, i) => (
                        <div key={`option-${index}-${i}`}>
                          <p className="break-words">
                            {String.fromCharCode(65 + i)}. {stripHtmlTags(option)}
                          </p>
                        </div>
                      ))
                    ) : (
                      Object.entries(question.options || {}).map(([key, value]) => (
                        <div key={`option-${index}-${key}`}>
                          <p className="break-words">
                            {key}. {stripHtmlTags(value)}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Buttons below the paper */}
            <div className="w-full max-w-3xl p-4 mb-8">
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handlePrevious}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Previous
                </button>
                <button
                  onClick={handleRandomize}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Randomize Questions
                </button>
                <button
                  onClick={() => navigate('/answer-key', { state: { finalPaper, correctAnswers } })}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
                >
                  Answer Key
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600"
                >
                  Download PDF
                </button>
                <button
                  onClick={() => alert('Question Paper Saved Successfully 🥳')}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                >
                  SAVE QUESTION PAPER 🧾
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-xl mb-4">No questions available for this subject</p>
            <p>Please add questions or select a different subject</p>
          </div>
        )}
      </div>

      {/* Edit Question Modal */}
      {showEditModal && editingQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Edit Question #{editingIndex + 1}</h2>
            
            {/* Question Text */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Question Text</label>
              <textarea
                value={editingQuestion.text}
                onChange={(e) => setEditingQuestion({...editingQuestion, text: e.target.value})}
                className="w-full p-2 border rounded-md"
                rows={3}
              />
            </div>
            
            {/* Options */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Options</label>
              <div className="space-y-3">
                {Array.isArray(editingQuestion.options) ? (
                  editingQuestion.options.map((option, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-8 text-center font-medium">{String.fromCharCode(65 + i)}</span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 p-2 border rounded-md"
                      />
                    </div>
                  ))
                ) : (
                  Object.entries(editingQuestion.options || {}).map(([key, value], i) => (
                    <div key={key} className="flex items-center">
                      <span className="w-8 text-center font-medium">{key}</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        className="flex-1 p-2 border rounded-md"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Correct Option */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Correct Option</label>
              <div className="flex space-x-4 justify-start">
                {["A", "B", "C", "D"].map((key) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      value={key}
                      checked={editingQuestion.correctOption === key}
                      onChange={() => handleCorrectOptionChange(key)}
                      className="form-radio"
                    />
                    <span>{key}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinalPaperPage;