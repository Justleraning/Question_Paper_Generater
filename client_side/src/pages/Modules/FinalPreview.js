import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllQuestions, deleteAllQuestionsForCourse, saveCompletedPaper, saveAnswerKey } from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, BorderStyle, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Minimum questions required per subject
const MIN_QUESTIONS_PER_SUBJECT = 7;

// Define subject codes and names
const SUBJECT_CODES = ["LR", "QP", "ENG", "CUSTOM"];
const SUBJECT_NAMES = {
  LR: "Logical Reasoning",
  QP: "Quantitative Problem Solving",
  ENG: "English",
  CUSTOM: ""
};

const FinalPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseName, customSubjectName } = location.state || {};
  
  // Update the custom subject name
  SUBJECT_NAMES.CUSTOM = customSubjectName || "Custom Subject";
  
  // States
  const [questions, setQuestions] = useState([]);
  const [reserveQuestions, setReserveQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentDate] = useState(new Date().toLocaleDateString());
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [downloadFormat, setDownloadFormat] = useState('pdf');
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState(
    Object.keys(SUBJECT_NAMES).reduce((acc, code) => {
      acc[code] = true;
      return acc;
    }, {})
  );
  
  // Track questions by subject
  const [questionsBySubject, setQuestionsBySubject] = useState({
    LR: [],
    QP: [],
    ENG: [],
    CUSTOM: []
  });

  // Track total marks and exam time
  const [totalMarks, setTotalMarks] = useState(20);
  const [examTime, setExamTime] = useState(1);
  
  // Load all questions when component mounts
  useEffect(() => {
    fetchAllQuestions();
  }, []);
  
  // Organize questions by subject
  useEffect(() => {
    if (questions.length > 0) {
      const organized = {
        LR: questions.filter(q => q.subject === SUBJECT_NAMES.LR),
        QP: questions.filter(q => q.subject === SUBJECT_NAMES.QP),
        ENG: questions.filter(q => q.subject === SUBJECT_NAMES.ENG),
        CUSTOM: questions.filter(q => q.subject === SUBJECT_NAMES.CUSTOM)
      };
      
      setQuestionsBySubject(organized);

      // Auto-calculate total marks based on question count
      // Assuming 1 mark per question by default
      const totalQuestions = questions.length;
      setTotalMarks(totalQuestions);
      
      // Auto-adjust exam time based on question count
      // 2 minutes per question, converted to hours
      const suggestedTime = Math.ceil((totalQuestions * 2) / 60);
      setExamTime(Math.max(1, suggestedTime));
    }
  }, [questions]);
  
  // Fetch all questions from all subjects
  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all the subjects
      const subjects = [SUBJECT_NAMES.LR, SUBJECT_NAMES.QP, SUBJECT_NAMES.ENG, SUBJECT_NAMES.CUSTOM].filter(Boolean);
      
      // Collect all questions from all subjects
      let allQuestions = [];
      let reservedQuestions = [];
      
      for (const subject of subjects) {
        try {
          const subjectQuestions = await getAllQuestions(courseName, subject);
          if (subjectQuestions && Array.isArray(subjectQuestions)) {
            // Add subject info to each question
            const questionsWithSubject = subjectQuestions.map(q => ({
              ...q,
              subject: subject
            }));
            
            // Determine how many questions to reserve (using reservePercentage from location state or default)
            const reservePercent = location.state?.reservePercentage || 20;
            const totalQuestions = questionsWithSubject.length;
            const reserveCount = Math.max(2, Math.ceil(totalQuestions * (reservePercent / 100)));
            
            // Only reserve if we have more than MIN_QUESTIONS_PER_SUBJECT + reserved count
            if (totalQuestions >= MIN_QUESTIONS_PER_SUBJECT + reserveCount) {
              // Split into main questions and reserve pool
              const mainQuestions = questionsWithSubject.slice(0, totalQuestions - reserveCount);
              const reserve = questionsWithSubject.slice(totalQuestions - reserveCount);
              
              allQuestions = [...allQuestions, ...mainQuestions];
              reservedQuestions = [...reservedQuestions, ...reserve];
            } else {
              // If we don't have enough questions, don't reserve any
              allQuestions = [...allQuestions, ...questionsWithSubject];
            }
          }
        } catch (subjectError) {
          console.warn(`Failed to fetch questions for ${subject}:`, subjectError);
        }
      }
      
      // Process main questions
      const processedQuestions = allQuestions
        .filter(q => q && q.question && q.options) // Filter out invalid questions
        .map(q => {
          // Get the subject code to find marks per question
          const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject);
          const marks = location.state?.marksPerQuestion?.[subjectCode] || 1;
          
          return {
            id: q.id || Math.random().toString(36).substr(2, 9),
            subject: q.subject,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption || 0,
            index: q.index || 0,
            marks // Add marks to each question
          };
        })
        .sort((a, b) => {
          // Sort by subject first, then by index
          if (a.subject !== b.subject) {
            return a.subject.localeCompare(b.subject);
          }
          return a.index - b.index;
        });
      
      // Process reserve questions
      const processedReserves = reservedQuestions
        .filter(q => q && q.question && q.options)
        .map(q => {
          // Get the subject code to find marks per question
          const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject);
          const marks = location.state?.marksPerQuestion?.[subjectCode] || 1;
          
          return {
            id: q.id || Math.random().toString(36).substr(2, 9),
            subject: q.subject,
            question: q.question,
            options: q.options,
            correctOption: q.correctOption || 0,
            index: q.index || 0,
            marks // Add marks to each question
          };
        });
      
      setQuestions(processedQuestions);
      setReserveQuestions(processedReserves);
      console.log("Loaded questions:", processedQuestions);
      console.log("Reserved questions:", processedReserves);
      
      // Check if each subject has the minimum required questions
      const questionCounts = {};
      subjects.forEach(subject => {
        const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === subject);
        const count = processedQuestions.filter(q => q.subject === subject).length;
        questionCounts[subjectCode] = count;
      });
      
      const subjectsWithTooFewQuestions = Object.keys(questionCounts)
        .filter(subject => questionCounts[subject] < MIN_QUESTIONS_PER_SUBJECT)
        .map(subject => SUBJECT_NAMES[subject]);
      
      if (subjectsWithTooFewQuestions.length > 0) {
        setNotification(`Warning: The following subjects have fewer than ${MIN_QUESTIONS_PER_SUBJECT} questions: ${subjectsWithTooFewQuestions.join(', ')}`);
      }
      
      // Update total marks from location state if available
      if (location.state?.totalMarks) {
        setTotalMarks(location.state.totalMarks);
      } else {
        // Auto-calculate total marks based on question count and marks per question
        const calculatedMarks = processedQuestions.reduce((total, question) => total + (question.marks || 1), 0);
        setTotalMarks(calculatedMarks);
      }
      
    } catch (err) {
      console.error("Error fetching questions:", err);
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle subject selection
  const toggleSubjectSelection = (subjectCode) => {
    setSelectedSubjects({
      ...selectedSubjects,
      [subjectCode]: !selectedSubjects[subjectCode]
    });
  };

  // Randomize questions
  const randomizeQuestions = () => {
    try {
      // Get current questions by subject
      const currentQsBySubject = {
        LR: questions.filter(q => q.subject === SUBJECT_NAMES.LR),
        QP: questions.filter(q => q.subject === SUBJECT_NAMES.QP),
        ENG: questions.filter(q => q.subject === SUBJECT_NAMES.ENG),
        CUSTOM: questions.filter(q => q.subject === SUBJECT_NAMES.CUSTOM)
      };
      
      // Get reserve questions by subject
      const reserveQsBySubject = {
        LR: reserveQuestions.filter(q => q.subject === SUBJECT_NAMES.LR),
        QP: reserveQuestions.filter(q => q.subject === SUBJECT_NAMES.QP),
        ENG: reserveQuestions.filter(q => q.subject === SUBJECT_NAMES.ENG),
        CUSTOM: reserveQuestions.filter(q => q.subject === SUBJECT_NAMES.CUSTOM)
      };
      
      // Only proceed if we have reserves for randomization
      if (Object.values(reserveQsBySubject).every(arr => arr.length === 0)) {
        setNotification("No reserve questions available for randomization. Add more questions to enable this feature.");
        return;
      }
      
      let newQuestionsList = [];
      
      // Process each subject
      for (const subjectCode of Object.keys(currentQsBySubject)) {
        const currentSubjectQs = currentQsBySubject[subjectCode];
        const reserveSubjectQs = reserveQsBySubject[subjectCode];
        
        // Skip if no current questions or no reserve questions
        if (currentSubjectQs.length === 0 || reserveSubjectQs.length === 0) {
          newQuestionsList = [...newQuestionsList, ...currentSubjectQs];
          continue;
        }
        
        // Determine how many questions to swap (up to 30% of current questions or the number of reserves, whichever is smaller)
        const swapCount = Math.min(
          Math.ceil(currentSubjectQs.length * 0.3),
          reserveSubjectQs.length
        );
        
        // Select random questions to remove
        const allIndices = [...Array(currentSubjectQs.length).keys()];
        const shuffledIndices = [...allIndices].sort(() => Math.random() - 0.5);
        const indicesToRemove = shuffledIndices.slice(0, swapCount);
        
        // Create a new list without the removed questions
        const remainingQs = currentSubjectQs.filter((_, idx) => !indicesToRemove.includes(idx));
        
        // Shuffle the reserve questions and take what we need
        const shuffledReserves = [...reserveSubjectQs].sort(() => Math.random() - 0.5);
        const newQs = shuffledReserves.slice(0, swapCount);
        
        // For each new question, randomize the order of options
        const newQsWithRandomizedOptions = newQs.map(q => {
          // Make a copy of the question
          const newQ = { ...q };
          
          // Get existing options
          const options = [...newQ.options].filter(opt => opt && opt.value);
          
          // Shuffle options
          const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
          
          // Find the correct option index
          const correctOptionIndex = options.findIndex((_, idx) => idx === newQ.correctOption);
          
          // Find the new position of the correct option
          const newCorrectOptionIndex = shuffledOptions.findIndex(
            opt => options[correctOptionIndex] === opt
          );
          
          // Update the question with shuffled options and new correct option index
          newQ.options = shuffledOptions;
          newQ.correctOption = newCorrectOptionIndex;
          
          return newQ;
        });
        
        // Add the remaining and new questions to the result
        newQuestionsList = [...newQuestionsList, ...remainingQs, ...newQsWithRandomizedOptions];
      }
      
      // Sort the new list by subject
      newQuestionsList.sort((a, b) => {
        if (a.subject !== b.subject) {
          return a.subject.localeCompare(b.subject);
        }
        return a.index - b.index;
      });
      
      // Update the questions list
      setQuestions(newQuestionsList);
      setNotification("Questions have been randomized successfully!");
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      console.error("Error randomizing questions:", error);
      setError("Failed to randomize questions. Please try again.");
    }
  };

  // Save current state of all questions
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Prepare the paper data
      const paperData = {
        courseName: courseName,
        customSubjectName: customSubjectName,
        questions: questions,
        reserveQuestions: reserveQuestions,
        totalMarks: totalMarks,
        examTime: examTime,
        date: currentDate
      };
      
      // Save the completed paper
      await saveCompletedPaper(paperData);
      
      // Prepare answer key data
      const answerKeyData = {
        courseName: courseName,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          correctOption: q.correctOption,
          marks: q.marks
        }))
      };
      
      // Save the answer key
      await saveAnswerKey(answerKeyData);
      
      // Delete all questions from the backend after paper is saved
      await deleteAllQuestionsForCourse(courseName);
      
      // Generate both PDF and DOCX files
      generatePDF();
      generateDOCX();
      
      setNotification("Paper and answer key saved successfully! Files are being downloaded.");
      
      // Navigate to dashboard after 3 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      
    } catch (error) {
      console.error("Error saving paper:", error);
      setError("Failed to save paper. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if any changes have been made that require saving
  const hasUnsavedChanges = () => {
    // For simplicity, we'll assume there are always unsaved changes
    // In a real implementation, you would compare with initial state
    return true;
  };

  // Navigate back to dashboard
  const navigateToDashboard = () => {
    if (hasUnsavedChanges()) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave without saving?")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  };

  // Generate PDF document
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text("ST. JOSEPH'S UNIVERSITY, BENGALURU - 27", 105, 20, { align: 'center' });
      
      // Add course info
      doc.setFontSize(14);
      doc.text(`Course: ${courseName}`, 105, 30, { align: 'center' });
      doc.text("SEMESTER EXAMINATION", 105, 40, { align: 'center' });
      
      // Add date and time info
      doc.setFontSize(12);
      doc.text(`Date: ${currentDate}`, 20, 50);
      doc.text(`Time: ${examTime} Hours`, 20, 60);
      doc.text(`Max Marks: ${totalMarks}`, 180, 60, { align: 'right' });
      
      // Instructions
      doc.text("Answer all questions", 105, 70, { align: 'center' });
      
      // Variables to track position
      let y = 90;
      let questionNumber = 1;
      let currentSubject = null;
      
      // Filter questions based on selected subjects
      const filteredQuestions = questions.filter(q => {
        const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject);
        return selectedSubjects[subjectCode];
      });
      
      // Generate PDF content for each question
      filteredQuestions.forEach((q) => {
        // Check if this is a new subject
        if (q.subject !== currentSubject) {
          // Add a new page if we're not at the beginning
          if (currentSubject !== null) {
            doc.addPage();
            y = 20;
          }
          
          // Add subject heading
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.text(`${q.subject}`, 105, y, { align: 'center' });
          y += 10;
          
          // Reset to normal font
          doc.setFontSize(12);
          doc.setFont('helvetica', 'normal');
          
          currentSubject = q.subject;
        }
        
        // Check if we need a new page
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        
        // Question number and text
        doc.text(`${questionNumber}. ${stripHTMLTags(q.question)}`, 20, y);
        y += 10;
        questionNumber++;
        
        // Options
        if (q.options && Array.isArray(q.options)) {
          const optionLabels = ['A', 'B', 'C', 'D'];
          
          q.options.forEach((opt, optIndex) => {
            if (opt && opt.value) {
              // Check if we need a new page
              if (y > 270) {
                doc.addPage();
                y = 20;
              }
              
              if (opt.type === 'Text') {
                doc.text(`   ${optionLabels[optIndex]}. ${opt.value}`, 30, y);
                y += 10;
              } else if (opt.type === 'Image') {
                doc.text(`   ${optionLabels[optIndex]}. [Image]`, 30, y);
                y += 10;
              }
            }
          });
        }
        
        y += 5; // Add some space between questions
      });
      
      // Save the PDF
      doc.save(`${courseName}_Exam_Paper.pdf`);
      setNotification("PDF downloaded successfully!");
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  // Generate DOCX document
  const generateDOCX = () => {
    try {
      // Filter questions based on selected subjects
      const filteredQuestions = questions.filter(q => {
        const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject);
        return selectedSubjects[subjectCode];
      });
      
      // Group questions by subject
      const questionsBySubject = {};
      filteredQuestions.forEach(q => {
        if (!questionsBySubject[q.subject]) {
          questionsBySubject[q.subject] = [];
        }
        questionsBySubject[q.subject].push(q);
      });
      
      // Create document sections
      const children = [
        new Paragraph({
          text: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Course: ${courseName}`,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: "SEMESTER EXAMINATION",
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
          text: `Date: ${currentDate}`,
          alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
          children: [
            new TextRun("Time: " + examTime + " Hours"),
            new TextRun("                                                                  "),
            new TextRun("Max Marks: " + totalMarks),
          ],
        }),
        new Paragraph({
          text: "Answer all questions",
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 200,
          },
        }),
      ];
      
      // Counter for global question numbering
      let questionNumber = 1;
      
      // Add each subject with its questions
      Object.keys(questionsBySubject).forEach(subject => {
        // Add subject heading
        children.push(
          new Paragraph({
            text: subject,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 400,
              after: 200,
            },
          })
        );
        
        // Add questions for this subject
        questionsBySubject[subject].forEach(q => {
          // Add question
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `${questionNumber}. ${stripHTMLTags(q.question)}`,
                  bold: true,
                }),
              ],
              spacing: {
                before: 200,
              },
            })
          );
          
          // Add options
          if (q.options && Array.isArray(q.options)) {
            q.options.forEach((opt, optIndex) => {
              if (opt && opt.value) {
                const optionLabels = ['A', 'B', 'C', 'D'];
                children.push(
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: `   ${optionLabels[optIndex]}. ${
                          opt.type === 'Text' ? opt.value : '[Image]'
                        }`,
                      }),
                    ],
                    indent: {
                      left: 720, // 0.5 inches in twips
                    },
                  })
                );
              }
            });
          }
          
          questionNumber++;
        });
      });
      
      // Create document
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      // Generate the document
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${courseName}_Exam_Paper.docx`);
        setNotification("DOCX downloaded successfully!");
        setTimeout(() => setNotification(null), 3000);
      });
    } catch (error) {
      console.error("Error generating DOCX:", error);
      setError("Failed to generate DOCX. Please try again.");
    }
  };

  // Handle download based on selected format
  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      generatePDF();
    } else if (downloadFormat === 'docx') {
      generateDOCX();
    }
    setShowDownloadOptions(false);
  };

  // Helper function to strip HTML tags from text
  const stripHTMLTags = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Handle editing a question
  const handleEdit = (questionId) => {
    const questionToEdit = questions.find(q => q.id === questionId);
    if (questionToEdit) {
      setEditingQuestion(questionToEdit);
    }
  };

  // Save edited question
  const saveEditedQuestion = () => {
    if (!editingQuestion) return;
    
    const updatedQuestions = questions.map(q => 
      q.id === editingQuestion.id ? editingQuestion : q
    );
    
    setQuestions(updatedQuestions);
    setEditingQuestion(null);
    setNotification("Question updated successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingQuestion(null);
  };

  // Update edited question field
  const updateEditingField = (field, value) => {
    setEditingQuestion({
      ...editingQuestion,
      [field]: value
    });
  };

  // Update option in edited question
  const updateEditingOption = (optionIndex, field, value) => {
    const updatedOptions = [...editingQuestion.options];
    
    if (field === "type") {
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        type: value,
        value: value === "Text" ? "" : updatedOptions[optionIndex]?.value || ""
      };
    } else {
      updatedOptions[optionIndex] = {
        ...updatedOptions[optionIndex],
        [field]: value
      };
    }
    
    setEditingQuestion({
      ...editingQuestion,
      options: updatedOptions
    });
  };

  // View answer key
  const viewAnswerKey = () => {
    navigate('/answer-key', {
      state: {
        questions,
        courseName,
        totalMarks,
        examTime,
        canReturn: false // Indicate that user cannot return to question entry
      }
    });
  };

  // Handle back button - prevent returning to question entry
  useEffect(() => {
    // Add event listener for beforeunload to warn user
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Changes you made will not be saved. Are you sure you want to leave?";
      return e.returnValue;
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Block the back button
    window.history.pushState(null, null, window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, null, window.location.href);
      setNotification("You cannot go back to question entry. Please use the navigation buttons.");
    };
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Calculate the number of questions from each subject
  const getSubjectStats = () => {
    const stats = {};
    
    SUBJECT_CODES.forEach(code => {
      const subjectName = SUBJECT_NAMES[code];
      const count = questions.filter(q => q.subject === subjectName).length;
      stats[code] = { name: subjectName, count };
    });
    
    return stats;
  };

  // Get number of available reserve questions by subject
  const getReserveStats = () => {
    const stats = {};
    
    SUBJECT_CODES.forEach(code => {
      const subjectName = SUBJECT_NAMES[code];
      const count = reserveQuestions.filter(q => q.subject === subjectName).length;
      stats[code] = count;
    });
    
    return stats;
  };

  // Render questions grouped by subject
  const renderQuestionsList = () => {
    if (questions.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No questions available. Please add questions in the Question Entry page.</p>
        </div>
      );
    }

    // Group questions by subject
    const groupedQuestions = {};
    questions.forEach(question => {
      // Skip if subject is not selected
      const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === question.subject);
      if (!selectedSubjects[subjectCode]) return;
      
      if (!groupedQuestions[question.subject]) {
        groupedQuestions[question.subject] = [];
      }
      groupedQuestions[question.subject].push(question);
    });
    
    // Render each subject's questions
    return (
      <div className="w-full">
        {Object.keys(groupedQuestions).map(subject => {
          const subjectQuestions = groupedQuestions[subject];
          
          // Calculate subject marks
          const subjectMarks = subjectQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);
          
          return (
            <div key={subject} className="mb-8">
              <h3 className="text-xl font-bold mt-6 mb-3 text-blue-800 border-b-2 border-blue-300 pb-1 flex justify-between">
                <span>{subject}</span>
                <span className="text-lg">{subjectMarks} marks</span>
              </h3>
              
              {subjectQuestions.map((q, questionIndex) => (
                <div key={q.id} className="mb-6 p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-semibold mb-2 flex items-center">
                      <span className="mr-2">{questionIndex + 1}.</span> 
                      <span dangerouslySetInnerHTML={{ __html: q.question }} />
                      {q.marks > 1 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">
                          {q.marks} marks
                        </span>
                      )}
                    </h4>
                    
                    <button 
                      onClick={() => handleEdit(q.id)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {q.options.map((opt, optIndex) => {
                      if (!opt || !opt.value) return null;
                      
                      const optionLabels = ['A', 'B', 'C', 'D'];
                      const isCorrect = optIndex === q.correctOption;
                      
                      return (
                        <div 
                          key={optIndex} 
                          className={`p-2 rounded ${isCorrect ? 'bg-green-100 border border-green-400' : 'bg-gray-50 border border-gray-200'}`}
                        >
                          <span className="font-semibold">{optionLabels[optIndex]}.</span>{' '}
                          {opt.type === 'Text' ? (
                            <span>{opt.value}</span>
                          ) : (
                            <img src={opt.value} alt={`Option ${optionLabels[optIndex]}`} className="h-14 inline-block ml-2" />
                          )}
                          {isCorrect && <span className="ml-2 text-green-600">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  // Render edit modal
  const renderEditModal = () => {
    if (!editingQuestion) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Edit Question</h2>
          
          <div className="mb-4">
            <label className="block font-semibold mb-1">Question Text:</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded"
              rows="4"
              value={editingQuestion.question}
              onChange={(e) => updateEditingField('question', e.target.value)}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block font-semibold mb-1">Options:</label>
            
            {editingQuestion.options.map((option, idx) => {
              if (!option) return null;
              const optionLabels = ['A', 'B', 'C', 'D'];
              
              return (
                <div key={idx} className="flex items-center gap-3 mt-2">
                  <span className="font-bold">{optionLabels[idx]}.</span>
                  
                  <select
                    className="border border-gray-300 p-1 rounded w-24 text-sm"
                    value={option.type || "Text"}
                    onChange={(e) => updateEditingOption(idx, "type", e.target.value)}
                  >
                    <option value="Text">Text</option>
                    <option value="Image">Image</option>
                  </select>
                  
                  {option.type === "Text" ? (
                    <input
                      type="text"
                      className="border border-gray-300 p-2 w-full rounded"
                      placeholder={`Enter Option ${optionLabels[idx]}`}
                      value={option.value || ""}
                      onChange={(e) => updateEditingOption(idx, "value", e.target.value)}
                    />
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="file"
                        accept="image/*"
                        className="border border-gray-300 p-1"
                        onChange={(e) => {
                          if (e.target.files.length > 0) {
                            const file = e.target.files[0];
                            const url = URL.createObjectURL(file);
                            updateEditingOption(idx, "value", url);
                            updateEditingOption(idx, "fileName", file.name);
                          }
                        }}
                      />
                      
                      {option.value && (
                        <img 
                          src={option.value} 
                          alt="Preview" 
                          className="h-10 w-10 object-contain border border-gray-300" 
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mb-4">
            <label className="block font-semibold">Correct Option:</label>
            <div className="flex gap-4">
              {editingQuestion.options.map((option, idx) => {
                if (!option) return null;
                return (
                  <label key={idx} className="flex items-center gap-1">
                    <input 
                      type="radio" 
                      name="editCorrectOption" 
                      value={idx} 
                      checked={editingQuestion.correctOption === idx} 
                      onChange={() => updateEditingField('correctOption', idx)} 
                    />
                    {['A', 'B', 'C', 'D'][idx]}
                  </label>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="px-4 py-2 bg-gray-300 rounded"
              onClick={cancelEditing}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded"
              onClick={saveEditedQuestion}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Download options dropdown
  const renderDownloadOptions = () => {
    if (!showDownloadOptions) return null;
    
    return (
      <div className="absolute mt-1 right-0 w-48 bg-white border border-gray-300 rounded shadow-lg z-10">
        <div className="p-2">
          <div className="mb-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="downloadFormat" 
                checked={downloadFormat === 'pdf'} 
                onChange={() => setDownloadFormat('pdf')} 
                className="mr-2"
              />
              PDF Format
            </label>
          </div>
          <div className="mb-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="downloadFormat" 
                checked={downloadFormat === 'docx'} 
                onChange={() => setDownloadFormat('docx')} 
                className="mr-2"
              />
              DOCX Format
            </label>
          </div>
          <div className="flex justify-end mt-2">
            <button 
              onClick={handleDownload}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
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
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Final Paper Preview</h1>
        <p className="text-gray-600">{courseName}</p>
      </div>
      
      {/* Subject Selection & Stats */}
      <div className="mb-6 bg-gray-50 border border-gray-300 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Subject Selection & Statistics</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {SUBJECT_CODES.map(code => {
            if (!SUBJECT_NAMES[code]) return null;
            
            const stats = getSubjectStats();
            const reserveStats = getReserveStats();
            
            return (
              <div key={code} className="border rounded p-3">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedSubjects[code]} 
                    onChange={() => toggleSubjectSelection(code)} 
                    className="mr-2" 
                  />
                  <span className="font-medium">{SUBJECT_NAMES[code]}</span>
                </label>
                
                <div className="mt-2 text-sm text-gray-600">
                  <div>Questions: {stats[code]?.count || 0}</div>
                  <div>Reserved: {reserveStats[code] || 0}</div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex flex-wrap justify-between items-center mt-4">
          <div className="flex space-x-3 items-center mb-2 sm:mb-0">
            <div>
              <label className="block text-sm font-medium mb-1">Total Marks:</label>
              <input 
                type="number" 
                value={totalMarks} 
                onChange={(e) => setTotalMarks(parseInt(e.target.value) || 0)} 
                className="w-20 border rounded p-1 text-center" 
                min="1"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Exam Time (hours):</label>
              <input 
                type="number" 
                value={examTime} 
                onChange={(e) => setExamTime(parseInt(e.target.value) || 1)} 
                className="w-20 border rounded p-1 text-center" 
                min="1"
              />
            </div>
          </div>
          
          <button
            onClick={randomizeQuestions}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            disabled={reserveQuestions.length === 0}
          >
            Randomize Questions
          </button>
        </div>
      </div>
      
      {/* Paper Preview */}
      <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          {/* University Logo/Name */}
          <div className="flex items-center">
            <div className="w-20 h-20 flex-shrink-0 mr-4">
              {/* Replace with your actual logo */}
              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-sm text-gray-500">Logo</span>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h2>
              <p>Course: {courseName}</p>
              <p>SEMESTER EXAMINATION</p>
            </div>
          </div>
          
          {/* Registration Info */}
          <div className="border border-gray-300 p-2 text-sm">
            <p>Registration Number:</p>
            <p>Date & Session: {currentDate}</p>
          </div>
        </div>
        
        {/* Exam Details */}
        <div className="flex justify-between mb-6 text-sm">
          <p>Time: {examTime} Hours</p>
          <p>This paper contains MCQ Questions</p>
          <p>Max Marks: {totalMarks}</p>
        </div>
        
        <p className="text-center font-semibold mb-4">Answer all questions</p>
        
        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Loading questions...</p>
          </div>
        ) : (
          // Questions list
          renderQuestionsList()
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <div className="relative">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
          >
            Download
          </button>
          {renderDownloadOptions()}
        </div>
        
        <button
          onClick={viewAnswerKey}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          View Answer Key
        </button>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save & Complete Paper'}
        </button>

        <button
          onClick={navigateToDashboard}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Dashboard
        </button>
      </div>
      
      {/* Warning about one-way navigation */}
      <div className="mt-6 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
        <p className="font-semibold">Important:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Once you save the paper, all entered questions will be removed from editing mode.</li>
          <li>The paper and answer key will be saved to your account and can be accessed from "My Papers".</li>
          <li>You cannot return to the question entry screen after viewing the final paper.</li>
          <li>Click "Save & Complete Paper" to finalize and download your paper.</li>
        </ul>
      </div>
      
      {/* Edit Modal */}
      {renderEditModal()}
    </div>
  );
};

export default FinalPreview;