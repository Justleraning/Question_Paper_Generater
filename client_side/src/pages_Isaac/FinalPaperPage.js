import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQPContext } from '../Contexts/QPContext.js';
import randomizeQuestions from '../Utils/randomizeQuestions.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Pencil } from 'lucide-react';
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
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState(null);
  const [editOption, setEditOption] = useState(null);
  const [isPreview, setIsPreview] = useState(true);
  const paperRef = useRef(null);

  useEffect(() => {
    console.log("Current state:", {
      questionsFromContext: questions,
      finalPaperState: finalPaper,
      marksValue: marks,
      subjectDetailsValue: subjectDetails
    });
  }, [questions, finalPaper, marks, subjectDetails]);

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
    // In your FinalPaperPage.js, change the fetchQuestions function:

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

  // Handle editing question text
  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setEditText(finalPaper[index].text);
  };

  const handleSaveQuestion = () => {
    if (editingIndex === null || editText === null) return;
    
    const updatedPaper = [...finalPaper];
    updatedPaper[editingIndex] = {
      ...updatedPaper[editingIndex],
      text: editText
    };
    setFinalPaper(updatedPaper);
    setEditText(null);
  };

  // Handle editing an option with proper type checking
  const handleEditOption = (qIndex, key) => {
    setEditingIndex(qIndex);
    
    const question = finalPaper[qIndex];
    let optionText;
    
    // Handle both array and object options
    if (Array.isArray(question.options)) {
      optionText = question.options[key];
    } else if (typeof question.options === 'object') {
      optionText = question.options[key];
    } else {
      console.error("Invalid options format for question:", question);
      return;
    }
    
    setEditOption({ key, text: optionText });
  };

  const handleSaveOption = () => {
    if (editingIndex === null || !editOption) return;
    
    const updatedPaper = [...finalPaper];
    const question = updatedPaper[editingIndex];
    
    // Handle both array and object options
    if (Array.isArray(question.options)) {
      const newOptions = [...question.options];
      newOptions[editOption.key] = editOption.text;
      updatedPaper[editingIndex] = {
        ...question,
        options: newOptions
      };
    } else if (typeof question.options === 'object') {
      const newOptions = { ...question.options };
      newOptions[editOption.key] = editOption.text;
      updatedPaper[editingIndex] = {
        ...question,
        options: newOptions
      };
    }
    
    setFinalPaper(updatedPaper);
    setEditOption(null);
  };

  // Reset all editing states when clicking outside of editing areas
  const handleResetEditingStates = () => {
    setEditingIndex(null);
    setEditText(null);
    setEditOption(null);
  };

  // Download PDF
  const handleDownloadPDF = () => {
    // Clear editing states before rendering PDF
    handleResetEditingStates();
    
    setIsPreview(false);
    setTimeout(() => {
      if (!paperRef.current) return;
      html2canvas(paperRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('Final_Question_Paper.pdf');
        setTimeout(() => setIsPreview(true), 500);
      });
    }, 100);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Buttons section at the top */}
      <div className="p-4 bg-white shadow-sm">
        <div className="flex justify-center space-x-4">
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
            onClick={() => alert('Paper Submitted Successfully!')}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
          >
            Submit
          </button>
        </div>
      </div>
  
      {/* Main content with scrollable area */}
      <div className="flex-1 overflow-auto p-4 flex flex-col items-center">
        {finalPaper.length > 0 ? (
          <div
            ref={paperRef}
            className="w-full max-w-3xl border p-6 bg-white text-center mb-6 shadow-md"
          >
            <img src={logo} alt="University Logo" className="w-20 h-20 mx-auto mb-2" />
            <h2 className="text-lg font-medium">St Joseph's University, Bengaluru-27</h2>
            <h3 className="font-semibold">B.C.A Examination Paper</h3>
            <p className="text-md font-bold">
              Subject Name: {subjectDetails?.name || "__________"}
            </p>
            <p className="text-md font-bold">
              Code: {subjectDetails?.code || "__________"}
            </p>
            <p className="text-md font-bold text-right">Max Marks: {marks || '__________'}</p>
            <hr className="my-4" />
  
            {finalPaper.map((question, index) => (
              <div key={index} className="mb-6 text-left">
                <div className="flex justify-between items-start">
                  {/* Editable question field */}
                  <div className="flex-1">
                    {editingIndex === index && editText !== null ? (
                      <input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={handleSaveQuestion}
                        className="border p-1 w-full"
                        autoFocus
                      />
                    ) : (
                      <p className="font-medium">{index + 1}. {stripHtmlTags(question.text)}</p>
                    )}
                  </div>
                  {/* Pen icon for question */}
                  {isPreview && (
                    <Pencil
                      className="cursor-pointer ml-2 flex-shrink-0 mt-1"
                      onClick={() => handleEditQuestion(index)}
                      size={18}
                    />
                  )}
                </div>
  
                {/* Options display with proper handling for both array and object formats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-6">
                  {Array.isArray(question.options) ? (
                    question.options.map((option, i) => (
                      <div key={`option-${index}-${i}`} className="flex items-center">
                        {/* Editable option field */}
                        <div className="flex-1">
                          {editingIndex === index && editOption && editOption.key === i ? (
                            <input
                              type="text"
                              value={editOption.text}
                              onChange={(e) => setEditOption({ ...editOption, text: e.target.value })}
                              onBlur={handleSaveOption}
                              className="border p-1 w-full"
                              autoFocus
                            />
                          ) : (
                            <p>{String.fromCharCode(65 + i)}. {stripHtmlTags(option)}</p>
                          )}
                        </div>
                        {/* Pen icon for option */}
                        {isPreview && (
                          <Pencil
                            className="cursor-pointer ml-1 flex-shrink-0"
                            onClick={() => handleEditOption(index, i)}
                            size={14}
                          />
                        )}
                      </div>
                    ))
                  ) : (
                    Object.entries(question.options || {}).map(([key, value]) => (
                      <div key={`option-${index}-${key}`} className="flex items-center">
                        {/* Editable option field */}
                        <div className="flex-1">
                          {editingIndex === index && editOption && editOption.key === key ? (
                            <input
                              type="text"
                              value={editOption.text}
                              onChange={(e) => setEditOption({ ...editOption, text: e.target.value })}
                              onBlur={handleSaveOption}
                              className="border p-1 w-full"
                              autoFocus
                            />
                          ) : (
                            <p>{key}. {stripHtmlTags(value)}</p>
                          )}
                        </div>
                        {/* Pen icon for option */}
                        {isPreview && (
                          <Pencil
                            className="cursor-pointer ml-1 flex-shrink-0"
                            onClick={() => handleEditOption(index, key)}
                            size={14}
                          />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <p className="text-xl mb-4">No questions available for this subject</p>
            <p>Please add questions or select a different subject</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinalPaperPage;