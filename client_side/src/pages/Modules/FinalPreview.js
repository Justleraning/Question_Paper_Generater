import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllQuestions ,savePaper} from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import universityLogo from '../../assets/image.png'; // Import the university logo

// Constants
const SUBJECT_CODES = ["LR", "QP", "ENG", "CUSTOM"];
const SUBJECT_NAMES = {
  LR: "Logical Reasoning",
  QP: "Quantitative Problem Solving",
  ENG: "English",
  CUSTOM: ""
};

// Question limits based on mark type
const QUESTION_LIMITS = {
  40: 10, // 40 marks - 10 questions per section
  60: 15  // 60 marks - 15 questions per section
};

const FinalPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    courseName, 
    customSubjectName, 
    totalMarks: initialTotalMarks = 40, // Default to 40 if not provided
    markType: initialMarkType = 40,
    allQuestions
  } = location.state || {};
  
  // Update custom subject name
  SUBJECT_NAMES.CUSTOM = customSubjectName || "Custom Subject";
  
  // States
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  
  // Editing state
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestionText, setEditedQuestionText] = useState('');
  const [editedOptions, setEditedOptions] = useState([]);
  const [editedCorrectOption, setEditedCorrectOption] = useState(null);
  
  // Track questions by subject
  const [questionsBySubject, setQuestionsBySubject] = useState({
    LR: [], QP: [], ENG: [], CUSTOM: []
  });

  // Fixed markType from question entry, cannot be changed
  const [markType] = useState(initialMarkType || 40);
  
  // Always use the configured mark type (40 or 60) regardless of question count
  const [totalMarks, setTotalMarks] = useState(initialMarkType || 40);
  
  const [examTime, setExamTime] = useState(1);
  
  // Load questions on mount or refresh
  useEffect(() => {
    if (location.state?.returnFromAnswerKey && sessionStorage.getItem('savedQuestions')) {
      // Restore questions from session storage when returning from answer key
      const savedQuestions = JSON.parse(sessionStorage.getItem('savedQuestions'));
      setQuestions(savedQuestions);
      setLoading(false);
    } else if (allQuestions) {
      // If questions are passed from QuestionEntry
      processAllQuestions(allQuestions);
    } else {
      // Clear any existing questions on refresh/initial load
      setQuestions([]);
      fetchAllQuestions();
    }

    // Cleanup function to clear questions on unmount
    return () => {
      setQuestions([]);
    };
  }, [location.pathname, allQuestions]);
  
  // Process questions passed from QuestionEntry
  const processAllQuestions = (questionsData) => {
    try {
      let processedQuestions = [];
      
      // Process each subject's questions
      Object.entries(questionsData).forEach(([subjectCode, subjectQuestions]) => {
        if (!Array.isArray(subjectQuestions) || subjectQuestions.length === 0) return;
        
        // Add subject info to each question and ensure options are text type
        const questionsWithSubject = subjectQuestions.map(q => ({
          id: q.questionId || Math.random().toString(36).substr(2, 9),
          subject: SUBJECT_NAMES[subjectCode],
          question: q.text,
          options: q.options.map(opt => ({
            type: "Text", // Force all options to be Text type
            value: opt.value || ""
          })),
          correctOption: typeof q.correctOption === 'number' ? q.correctOption - 1 : 0,
          index: q.index || 0,
          marks: 1
        }));
        
        processedQuestions = [...processedQuestions, ...questionsWithSubject];
      });
      
      
      // Limit questions based on mark type
      const questionLimit = QUESTION_LIMITS[markType];
      const selectedQuestions = limitQuestionsByType(processedQuestions, questionLimit);
      
      setQuestions(selectedQuestions);
      setLoading(false);
      
      // Set notification
      setNotification(`Paper preview ready with ${selectedQuestions.length} questions for a ${markType} mark exam.`);
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error("Error processing questions:", error);
      setError("Failed to process questions. Please try again.");
      setLoading(false);
    }
  };
  
  // Sort questions by subject when they change
  useEffect(() => {
    if (questions.length > 0) {
      const organized = {
        LR: questions.filter(q => q.subject === SUBJECT_NAMES.LR),
        QP: questions.filter(q => q.subject === SUBJECT_NAMES.QP),
        ENG: questions.filter(q => q.subject === SUBJECT_NAMES.ENG),
        CUSTOM: questions.filter(q => q.subject === SUBJECT_NAMES.CUSTOM)
      };
      
      setQuestionsBySubject(organized);
      
      // Auto-adjust exam time based on question count
      const questionsPerHour = markType === 40 ? 40 : 30; // Adjust based on difficulty
      const suggestedTime = Math.ceil(questions.length / questionsPerHour);
      setExamTime(Math.max(1, suggestedTime));
    }
  }, [questions, markType]);
  
  // Fetch all questions from all subjects
  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      
      const subjects = [SUBJECT_NAMES.LR, SUBJECT_NAMES.QP, SUBJECT_NAMES.ENG, SUBJECT_NAMES.CUSTOM].filter(Boolean);
      let allQuestionsData = [];
      
      for (const subject of subjects) {
        try {
          const subjectQuestions = await getAllQuestions(courseName, subject);
          if (subjectQuestions && Array.isArray(subjectQuestions)) {
            // Add subject info to each question
            const questionsWithSubject = subjectQuestions.map(q => ({
              ...q,
              subject: subject
            }));
            
            allQuestionsData = [...allQuestionsData, ...questionsWithSubject];
          }
        } catch (err) {
          console.warn(`Failed to fetch questions for ${subject}:`, err);
        }
      }
      
      // Process and sort questions
      const processedQuestions = allQuestionsData
        .filter(q => q && q.question && q.options)
        .map(q => ({
          id: q.id || Math.random().toString(36).substr(2, 9),
          subject: q.subject,
          question:stripHTMLTags(q.question),
          options: q.options,
          correctOption: q.correctOption || 0,
          index: q.index || 0,
          marks: 1 // Set default marks to 1
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject) || a.index - b.index);
      
      // Random selection based on mark type
      const questionLimit = QUESTION_LIMITS[markType];
      const selectedQuestions = limitQuestionsByType(processedQuestions, questionLimit);
      
      setQuestions(selectedQuestions);
      
      // Set notification about question selection
      const totalSelected = selectedQuestions.length;
      setNotification(`${totalSelected} questions selected for the ${markType} mark exam paper.`);
      setTimeout(() => setNotification(null), 3000);
      
    } catch (err) {
      setError("Failed to load questions. Please try again.");
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to limit questions based on mark type
  const limitQuestionsByType = (allQuestionsData, limit) => {
    // Group questions by subject
    const bySubject = {};
    SUBJECT_CODES.forEach(code => {
      const subjectName = SUBJECT_NAMES[code];
      bySubject[code] = allQuestionsData.filter(q => q.subject === subjectName);
    });
    
    // For each subject, either take all questions if less than limit
    // or randomly select up to the limit
    let finalSelectedQuestions = [];
    
    Object.entries(bySubject).forEach(([subjectCode, subjectQuestions]) => {
      if (subjectQuestions.length === 0) return;
      
      let selectedFromSubject;
      if (subjectQuestions.length <= limit) {
        // Take all questions if less than limit
        selectedFromSubject = [...subjectQuestions];
      } else {
        // Randomly select questions up to the limit
        selectedFromSubject = shuffleAndSelect(subjectQuestions, limit);
      }
      
      // Add selected questions to final list
      finalSelectedQuestions = [...finalSelectedQuestions, ...selectedFromSubject];
    });
    
    return finalSelectedQuestions;
  };

  // Shuffle and select a subset of questions
  const shuffleAndSelect = (questions, count) => {
    // Create a copy of the array to avoid modifying the original
    const shuffled = [...questions];
    
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Return the first 'count' elements
    return shuffled.slice(0, count);
  };

  // Handle randomize button click - just re-randomize the order of existing questions
  const handleRandomize = () => {
    try {
      setLoading(true);
      
      // Group existing questions by subject
      const bySubject = {};
      SUBJECT_CODES.forEach(code => {
        const subjectName = SUBJECT_NAMES[code];
        bySubject[code] = questions.filter(q => q.subject === subjectName);
      });
      
      // Just re-randomize each subject's question order without dropping any questions
      let randomizedQuestions = [];
      
      Object.entries(bySubject).forEach(([subjectCode, subjectQuestions]) => {
        if (subjectQuestions.length === 0) return;
        
        // Shuffle the entire array without removing any questions
        const shuffled = [...subjectQuestions];
        
        // Fisher-Yates shuffle algorithm
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Reindex but keep all questions
        const reindexed = shuffled.map((q, idx) => ({
          ...q,
          index: idx + 1
        }));
        
        randomizedQuestions = [...randomizedQuestions, ...reindexed];
      });
      
      setQuestions(randomizedQuestions);
      setNotification(`Questions shuffled! All ${randomizedQuestions.length} questions preserved.`);
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      setError("Failed to randomize questions. Please try again.");
      console.error("Randomization error:", error);
    } finally {
      setLoading(false);
    }
    
  };

  const handleSave = async () => {
    try {
      // Ensure user is logged in
      const userString = sessionStorage.getItem('user') || localStorage.getItem('user');
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!userString || !token) {
        setError("Please log in to save the paper");
        return;
      }
  
      const user = JSON.parse(userString);
      
      // Ensure user._id exists
      if (!user._id) {
        setError("Invalid user information. Please log in again.");
        return;
      }
  
      const paperData = {
        courseName: courseName || '', 
        customSubjectName: customSubjectName || '', 
        totalMarks: markType, 
        examTime: examTime || 1, 
        date: currentDate, 
        status: 'Not Sent',
        createdBy: user._id, 
        questions: questions.map(q => ({
          subject: q.subject || '', 
          question: q.question || '', 
          options: q.options.map(opt => ({
            type: opt.type || 'Text', 
            value: opt.value || '' 
          })),
          correctOption: q.correctOption !== undefined ? q.correctOption : 0, 
          index: q.index || 0, 
          marks: q.marks || 1 
        }))
      };
      
      console.log("Saving paper ");
      
      const paperResult = await savePaper(paperData);
      
      if (paperResult.success) {
        setNotification("Paper saved successfully!");
        setTimeout(() => {
          navigate("/entrance-exam");
        }, 3000);
      } else {
        setError(paperResult.message || "Failed to save paper");
      }
    } catch (error) {
      console.error("Save paper error:", error);
      setError(`Failed to save paper: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
 
  // PDF Generation
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add university logo
      try {
        doc.addImage(universityLogo, 'PNG', 20, 10, 20, 20);
      } catch (logoErr) {
        console.warn("Could not add logo:", logoErr);
      }
      
      doc.setFontSize(18);
      doc.text("ST. JOSEPH'S UNIVERSITY, BENGALURU - 27", 105, 20, { align: 'center' });
      doc.setFontSize(14);
      
      // Show both courseName and customSubjectName
      const courseDisplay = customSubjectName 
        ? `${courseName} - ${customSubjectName}` 
        : courseName;
      
      doc.text(`Course: ${courseDisplay}`, 105, 30, { align: 'center' });
      doc.text("SEMESTER EXAMINATION", 105, 40, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Date: ${currentDate}`, 20, 50);
      doc.text(`Time: ${examTime} Hours`, 20, 60);
      
      // Use the configured mark type, not the calculated one
      doc.text(`Max Marks: ${markType}`, 180, 60, { align: 'right' });
      
      doc.text("Answer all questions", 105, 70, { align: 'center' });
      
      // Process questions
      let y = 90;
      let questionNumber = 1;
      let currentSubject = null;
      
      // Generate PDF content
      questions.forEach((q) => {
        // Add new subject header
        if (q.subject !== currentSubject) {
          if (currentSubject !== null) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(q.subject, 105, y, { align: 'center' });
          y += 10;
          
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          currentSubject = q.subject;
        }
        
        // Add page if needed
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        // Add question text
        doc.text(`${questionNumber}. ${stripHTMLTags(q.question)}`, 20, y);
        y += 10;
        questionNumber++;
        
        // Add options
        if (q.options && Array.isArray(q.options)) {
          q.options.forEach((opt, optIndex) => {
            if (opt && opt.value) {
              if (y > 270) {
                doc.addPage();
                y = 20;
              }
              
              doc.text(`   ${['A', 'B', 'C', 'D'][optIndex]}. ${opt.value}`, 30, y);
              y += 10;
            }
          });
        }
        
        y += 5;
      });
      
      doc.save(`${courseName}_Exam_Paper.pdf`);
      setNotification("PDF downloaded successfully!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setError("Failed to generate PDF. Please try again.");
    }
  };


  // DOCX Generation
const generateDOCX = () => {
  try {
    // Convert the university logo to base64 (if needed)
    const logoPromise = new Promise((resolve) => {
      // Create a temporary canvas to handle the image
      const img = new Image();
      img.onload = function() {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({ width: img.width, height: img.height, data: canvas.toDataURL('image/png') });
      };
      img.onerror = function() {
        console.warn("Could not load university logo for DOCX");
        resolve(null);
      };
      img.src = universityLogo;
    });

    // Wait for logo processing, then create document
    logoPromise.then(logoData => {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // University Logo and Header (in a table for alignment)
              ...(logoData ? [
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          width: { size: 20, type: WidthType.PERCENTAGE },
                          children: [
                            new Paragraph({
                              children: [
                                new ImageRun({
                                  data: logoData.data.split(',')[1],
                                  transformation: {
                                    width: 100,
                                    height: 100
                                  }
                                })
                              ],
                              alignment: AlignmentType.CENTER
                            })
                          ],
                          borders: { top: {}, bottom: {}, left: {}, right: {} }
                        }),
                        new TableCell({
                          width: { size: 80, type: WidthType.PERCENTAGE },
                          children: [
                            new Paragraph({
                              text: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
                              heading: HeadingLevel.HEADING_1,
                              alignment: AlignmentType.CENTER,
                              bold: true
                            })
                          ],
                          borders: { top: {}, bottom: {}, left: {}, right: {} }
                        })
                      ]
                    })
                  ],
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  borders: { top: {}, bottom: {}, left: {}, right: {} }
                })
              ] : [
                // Fallback if logo can't be loaded
                new Paragraph({
                  text: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
                  heading: HeadingLevel.HEADING_1,
                  alignment: AlignmentType.CENTER,
                  bold: true
                })
              ]),
              
              // Course Name
              new Paragraph({
                text: customSubjectName 
                  ? `${courseName} - ${customSubjectName}`
                  : courseName,
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { before: 200, after: 200 }
              }),
              
              // SEMESTER EXAMINATION
              new Paragraph({
                text: "ENTRANCE EXAMINATION",
                heading: HeadingLevel.HEADING_3,
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { after: 300 }
              }),
              
              // Date, Time and Marks
              new Paragraph({
                text: `Date: ${currentDate}`,
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 }
              }),
              new Paragraph({
                text: `Time: ${examTime} Hours`,
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 }
              }),
              new Paragraph({
                text: `Max Marks: ${markType}`,
                alignment: AlignmentType.LEFT,
                spacing: { after: 200 }
              }),
              
              // Answer all questions
              new Paragraph({
                text: "Answer all questions",
                alignment: AlignmentType.CENTER,
                bold: true,
                spacing: { before: 200, after: 400 }
              }),
              
              // Process each subject and its questions
              ...processQuestionsForDOCX()
            ]
          }
        ]
      });

      // Generate the document
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${courseName}_Exam_Paper.docx`);
        setNotification("DOCX downloaded successfully!");
        setTimeout(() => setNotification(null), 3000);
      });
    });
  } catch (error) {
    console.error("Error generating DOCX:", error);
    setError("Failed to generate DOCX. Please try again.");
  }
};

// Helper function to process questions by subject for DOCX format
const processQuestionsForDOCX = () => {
  let docElements = [];
  let questionNumber = 1;
  let currentSubject = null;
  
  // Group questions by subject
  const subjectGroups = {};
  
  SUBJECT_CODES.forEach(code => {
    const subjectName = SUBJECT_NAMES[code];
    const subjectQuestions = questions.filter(q => q.subject === subjectName);
    
    if (subjectQuestions.length > 0) {
      subjectGroups[code] = subjectQuestions;
    }
  });
  
  // Process each subject group
  Object.entries(subjectGroups).forEach(([code, subjectQuestions]) => {
    const subjectName = SUBJECT_NAMES[code];
    
    // Add subject header
    docElements.push(
      new Paragraph({
        text: subjectName,
        heading: HeadingLevel.HEADING_2,
        alignment: AlignmentType.LEFT,
        bold: true,
        spacing: { before: 400, after: 200 }
      })
    );
    
    // Process questions
    subjectQuestions.forEach((q, idx) => {
      // Question text
      docElements.push(
        new Paragraph({
          text: `${questionNumber}. ${stripHTMLTags(q.question)}`,
          spacing: { before: 200, after: 100 }
        })
      );
      
      // Options
      if (q.options && Array.isArray(q.options)) {
        q.options.forEach((opt, optIdx) => {
          if (opt && opt.value) {
            docElements.push(
              new Paragraph({
                text: `   ${['A', 'B', 'C', 'D'][optIdx]}. ${stripHTMLTags(opt.value)}`,
                indent: { left: 500 },
                spacing: { after: 100 }
              })
            );
          }
        });
      }
      
      questionNumber++;
    });
  });
  
  return docElements;
};


  // Handle download
  const handleDownload = () => {
    if (downloadFormat === 'pdf') generatePDF();
    else if (downloadFormat === 'docx') generateDOCX();
    setShowDownloadOptions(false);
  };

  // View answer key
  const viewAnswerKey = () => {
    // Store current questions and state in session storage
    sessionStorage.setItem('savedQuestions', JSON.stringify(questions));
    
    const questionsForAnswerKey = questions.map(q => ({
      id: q.id,
      subject: q.subject,
      question: q.question,
      correctOption: q.correctOption,
      marks: q.marks || 1
    }));

    navigate('/answer-keys', {
      state: {
        questions:questionsForAnswerKey,
        courseName,
        customSubjectName, // Pass this to the answer key 
        totalMarks: markType, // Use the configured mark type
        examTime,
        canReturn: true
      }
    });
  };

  // Helper function
  const stripHTMLTags = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Start editing a question
  const startEditingQuestion = (question) => {
    setEditingQuestionId(question.id);
    setEditedQuestionText(question.question);
    setEditedOptions(question.options);
    setEditedCorrectOption(question.correctOption);
  };

  // Save edited question
  const saveEditedQuestion = () => {
    if (!editingQuestionId) return;
    
    // Validate
    if (!editedQuestionText.trim()) {
      setError("Question text cannot be empty");
      return;
    }
    
    const validOptions = editedOptions.filter(opt => opt && opt.value && opt.value.trim().length > 0);
    if (validOptions.length < 2) {
      setError("At least two options are required");
      return;
    }
    
    if (editedCorrectOption === null || editedCorrectOption === undefined) {
      setError("Please select a correct option");
      return;
    }
    
    // Update question in the questions array
    const updatedQuestions = questions.map(q => {
      if (q.id === editingQuestionId) {
        return {
          ...q,
          question: editedQuestionText,
          options: editedOptions,
          correctOption: editedCorrectOption
        };
      }
      return q;
    });
    
    setQuestions(updatedQuestions);
    setEditingQuestionId(null);
    setNotification("Question updated successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingQuestionId(null);
  };



  // Handle option change in edit mode
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...editedOptions];
    updatedOptions[index] = { 
      type: "Text", // Always set type to Text
      value
    };
    setEditedOptions(updatedOptions);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Notification */}
      {notification && (
        <div className="w-full mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded">
          {notification}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button 
            className="ml-2 text-red-700 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Final Paper Preview</h1>
        <p className="text-gray-600">{courseName}</p>
        {customSubjectName && (
          <p className="text-gray-600">{customSubjectName}</p>
        )}
        <p className="text-gray-600 mt-1">
          {markType} Marks Paper ({QUESTION_LIMITS[markType]} questions per section)
        </p>
      </div>
      
      {/* Simple Randomize Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={handleRandomize}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg text-lg font-medium"
          disabled={loading || questions.length === 0}
        >
          {loading ? 'Randomizing...' : 'Randomize Questions'}
        </button>
      </div>
      
      {/* Note about randomization */}
      <div className="text-center mb-6 text-sm text-gray-600">
        <p>For {markType} marks paper, each subject will have {QUESTION_LIMITS[markType]} questions maximum.</p>
        <p>If a subject has fewer questions, all available questions will be used.</p>
      </div>
      
      {/* Paper Preview */}
      <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg mb-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading questions...</p>
          </div>
        ) : (
          <div className="w-full">
            {questions.length > 0 ? (
              <div>
                {/* University Header */}
                <div className="text-center mb-6">
                  <div className="flex justify-center items-center mb-2">
                    <img src={universityLogo} alt="University Logo" className="h-16 mr-2" />
                    <h2 className="text-xl font-bold">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h2>
                  </div>
                  <h3 className="text-lg font-semibold">
                    {customSubjectName ? `${courseName} - ${customSubjectName}` : courseName}
                  </h3>
                  <p className="font-medium mt-2">SEMESTER EXAMINATION</p>
                  <div className="flex justify-between mt-4">
                    <p>Date: {currentDate}</p>
                    <p>Time: {examTime} Hours</p>
                    <p>Max Marks: {markType}</p>
                  </div>
                  <p className="mt-2 font-medium">Answer all questions</p>
                </div>
                
                {/* Questions Display */}
                {SUBJECT_CODES.filter(code => {
                  const subjectQuestions = questionsBySubject[code];
                  return subjectQuestions && subjectQuestions.length > 0;
                }).map(subjectCode => (
                  <div key={subjectCode} className="mb-8">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">{SUBJECT_NAMES[subjectCode]}</h3>
                    
                    {questionsBySubject[subjectCode].map((q, idx) => (
                      <div key={q.id} className="mb-6 pl-4 border-l-4 border-gray-200 hover:border-blue-300 transition-colors duration-200">
                        {editingQuestionId === q.id ? (
                          // Edit mode
                          <div className="bg-white p-4 border rounded shadow-sm">
                            <h4 className="font-medium mb-2">Edit Question</h4>
                            
                            <div className="mb-3">
                              <label className="block text-sm font-medium mb-1">Question Text:</label>
                              <textarea
                                value={editedQuestionText}
                                onChange={(e) => setEditedQuestionText(e.target.value)}
                                className="w-full p-2 border rounded"
                                rows={3}
                              />
                            </div>
                            
                            <div className="mb-3">
  <label className="block text-sm font-medium mb-1">Options:</label>
  {editedOptions.map((opt, optIdx) => (
    <div key={optIdx} className="flex items-center mb-2">
      <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][optIdx]}.</span>
      <input
        type="text"
        value={opt?.value || ''}
        onChange={(e) => handleOptionChange(optIdx, e.target.value)}
        className="flex-1 p-2 border rounded"
      />
      <label className="ml-2 flex items-center">
        <input
          type="radio"
          name={`correct-option-${q.id}`}
          checked={editedCorrectOption === optIdx}
          onChange={() => setEditedCorrectOption(optIdx)}
          className="mr-1"
        />
        Correct
      </label>
    </div>
  ))}
</div>
                            
              <div className="flex justify-end space-x-2">
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEditedQuestion}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          // View mode
                          <div className="group">
                            <div className="flex justify-between items-start">
                              <p className="font-medium mb-2">{idx + 1}. {stripHTMLTags(q.question)}</p>
                              <button
                                onClick={() => startEditingQuestion(q)}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                Edit
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-8">
  {q.options && Array.isArray(q.options) && q.options.map((opt, optIdx) => (
    <div key={optIdx} className="mb-1">
      <span className="font-medium mr-1">{['A', 'B', 'C', 'D'][optIdx]}.</span>
      <span className={optIdx === q.correctOption ? "text-green-600 font-medium" : ""}>
        {opt.value}
      </span>
      {optIdx === q.correctOption && (
        <span className="ml-2 text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded">
          Correct
        </span>
      )}
    </div>
  ))}
</div>
   </div>
          )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions available. Please load questions or refresh the page.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="relative">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            disabled={questions.length === 0}
          >
            Download
          </button>
          {showDownloadOptions && (
            <div className="absolute mt-1 right-0 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
              <div className="p-2">
                <div className="mb-2">
                  <label className="flex items-center">
                    <input type="radio" name="downloadFormat" checked={downloadFormat === 'pdf'} 
                      onChange={() => setDownloadFormat('pdf')} className="mr-2" />
                    PDF Format
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center">
                    <input type="radio" name="downloadFormat" checked={downloadFormat === 'docx'} 
                      onChange={() => setDownloadFormat('docx')} className="mr-2" />
                    DOCX Format
                  </label>
                </div>
                <div className="flex justify-end mt-2">
                  <button onClick={handleDownload} className="px-3 py-1 bg-blue-500 text-white text-sm rounded">
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={viewAnswerKey}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          disabled={questions.length === 0}
        >
          View Answer Key
        </button>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={loading || questions.length === 0}
        >
          {loading ? 'Saving...' : 'Save & Complete Paper'}
        </button>
      </div>
      
    
    </div>
  );
};

export default FinalPreview;