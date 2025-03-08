import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAllQuestions, saveCompletedPaper, saveAnswerKey } from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import RandomizationPanel from './RandomizationPanel.js';

// Constants
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
  const { courseName, customSubjectName, totalMarks: initialTotalMarks } = location.state || {};
  
  // Update custom subject name
  SUBJECT_NAMES.CUSTOM = customSubjectName || "Custom Subject";
  
  // States
  const [questions, setQuestions] = useState([]);
  const [reserveQuestions, setReserveQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [currentDate] = useState(new Date().toLocaleDateString());
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
    LR: [], QP: [], ENG: [], CUSTOM: []
  });

  // Track total marks and exam time - use passed value if available
  const [totalMarks, setTotalMarks] = useState(initialTotalMarks || 20);
  const [examTime, setExamTime] = useState(1);
  
  // Load questions on mount
  useEffect(() => {
    fetchAllQuestions();
  }, []);
  
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
      
      // Only set total marks if not provided
      if (!initialTotalMarks) {
        const calculatedMarks = questions.reduce((total, q) => total + (q.marks || 1), 0);
        setTotalMarks(calculatedMarks);
      }
      
      // Auto-adjust exam time based on question count
      const suggestedTime = Math.ceil((questions.length * 2) / 60);
      setExamTime(Math.max(1, suggestedTime));
    }
  }, [questions, initialTotalMarks]);
  
  // Fetch all questions from all subjects
  const fetchAllQuestions = async () => {
    try {
      setLoading(true);
      
      const subjects = [SUBJECT_NAMES.LR, SUBJECT_NAMES.QP, SUBJECT_NAMES.ENG, SUBJECT_NAMES.CUSTOM].filter(Boolean);
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
            
            // Split into main questions and reserve pool
            const reservePercent = location.state?.reservePercentage || 20;
            const totalQuestions = questionsWithSubject.length;
            const reserveCount = Math.max(2, Math.ceil(totalQuestions * (reservePercent / 100)));
            
            if (totalQuestions >= 7 + reserveCount) {
              allQuestions = [...allQuestions, ...questionsWithSubject.slice(0, totalQuestions - reserveCount)];
              reservedQuestions = [...reservedQuestions, ...questionsWithSubject.slice(totalQuestions - reserveCount)];
            } else {
              allQuestions = [...allQuestions, ...questionsWithSubject];
            }
          }
        } catch (err) {
          console.warn(`Failed to fetch questions for ${subject}:`, err);
        }
      }
      
      // Process and sort questions
      const processedQuestions = allQuestions
        .filter(q => q && q.question && q.options)
        .map(q => ({
          id: q.id || Math.random().toString(36).substr(2, 9),
          subject: q.subject,
          question: q.question,
          options: q.options,
          correctOption: q.correctOption || 0,
          index: q.index || 0,
          marks: location.state?.marksPerQuestion?.[Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject)] || 1
        }))
        .sort((a, b) => a.subject.localeCompare(b.subject) || a.index - b.index);
      
      const processedReserves = reservedQuestions
        .filter(q => q && q.question && q.options)
        .map(q => ({
          id: q.id || Math.random().toString(36).substr(2, 9),
          subject: q.subject,
          question: q.question,
          options: q.options,
          correctOption: q.correctOption || 0,
          index: q.index || 0,
          marks: location.state?.marksPerQuestion?.[Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject)] || 1
        }));
      
      setQuestions(processedQuestions);
      setReserveQuestions(processedReserves);
      console.log("Questions loaded:", processedQuestions.length, "Reserved:", processedReserves.length);
      
    } catch (err) {
      setError("Failed to load questions. Please try again.");
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Randomize questions with reserves
  const handleRandomize = ({ subjectCodes, totalMarks, reservePercentage }) => {
    try {
      // Debug the reserve questions
      console.log("Starting randomization with reserves:", reserveQuestions);
      
      if (reserveQuestions.length === 0) {
        setNotification("No reserve questions available for randomization.");
        return;
      }
      
      // Group questions by subject
      const currentBySubject = SUBJECT_CODES.reduce((acc, code) => {
        acc[code] = questions.filter(q => q.subject === SUBJECT_NAMES[code]);
        return acc;
      }, {});
      
      const reservesBySubject = SUBJECT_CODES.reduce((acc, code) => {
        acc[code] = reserveQuestions.filter(q => q.subject === SUBJECT_NAMES[code]);
        return acc;
      }, {});
      
      let newQuestionsList = [];
      
      // Only process selected subjects
      for (const code of subjectCodes) {
        const current = currentBySubject[code];
        const reserves = reservesBySubject[code];
        
        // Skip if no current questions or no reserves
        if (current.length === 0 || reserves.length === 0) {
          newQuestionsList = [...newQuestionsList, ...current];
          continue;
        }
        
        // Calculate swap count (up to 30% or available reserves)
        const swapCount = Math.min(Math.ceil(current.length * (reservePercentage / 100)), reserves.length);
        
        // Select random questions to remove
        const indices = [...Array(current.length).keys()];
        const indicesToRemove = indices.sort(() => Math.random() - 0.5).slice(0, swapCount);
        
        // Keep questions that weren't selected for removal
        const remaining = current.filter((_, idx) => !indicesToRemove.includes(idx));
        
        // Get random reserves
        const newQuestions = reserves.sort(() => Math.random() - 0.5).slice(0, swapCount).map(q => {
          // Randomize options order
          const options = [...q.options].filter(opt => opt && opt.value);
          const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
          
          // Find new position of correct option
          const correctOptionIndex = options.findIndex((_, idx) => idx === q.correctOption);
          const newCorrectOptionIndex = shuffledOptions.findIndex(opt => opt === options[correctOptionIndex]);
          
          return {
            ...q,
            options: shuffledOptions,
            correctOption: newCorrectOptionIndex
          };
        });
        
        newQuestionsList = [...newQuestionsList, ...remaining, ...newQuestions];
      }
      
      // Sort by subject
      newQuestionsList.sort((a, b) => a.subject.localeCompare(b.subject) || a.index - b.index);
      
      // Update total marks if changed
      if (totalMarks !== this.totalMarks) {
        setTotalMarks(totalMarks);
      }
      
      setQuestions(newQuestionsList);
      setNotification("Questions randomized successfully!");
      setTimeout(() => setNotification(null), 3000);
      
    } catch (error) {
      setError("Failed to randomize questions. Please try again.");
      console.error("Randomization error:", error);
    }
  };

  // Save paper and show alert
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Just show alert and return (as requested)
      setNotification("Paper saved successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
      
    } catch (error) {
      setError("Failed to save paper. Please try again.");
      console.error("Error saving paper:", error);
    } finally {
      setLoading(false);
    }
  };

  // PDF Generation
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("ST. JOSEPH'S UNIVERSITY, BENGALURU - 27", 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Course: ${courseName}`, 105, 30, { align: 'center' });
      doc.text("SEMESTER EXAMINATION", 105, 40, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Date: ${currentDate}`, 20, 50);
      doc.text(`Time: ${examTime} Hours`, 20, 60);
      doc.text(`Max Marks: ${totalMarks}`, 180, 60, { align: 'right' });
      doc.text("Answer all questions", 105, 70, { align: 'center' });
      
      // Process questions
      const filteredQuestions = questions.filter(q => {
        const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject);
        return selectedSubjects[subjectCode];
      });
      
      let y = 90;
      let questionNumber = 1;
      let currentSubject = null;
      
      // Generate PDF content
      filteredQuestions.forEach((q) => {
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
              
              doc.text(`   ${['A', 'B', 'C', 'D'][optIndex]}. ${opt.type === 'Text' ? opt.value : '[Image]'}`, 30, y);
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

  // DOCX Generation (simplified)
  const generateDOCX = () => {
    try {
      // Filter questions based on selected subjects
      const filteredQuestions = questions.filter(q => {
        const subjectCode = Object.keys(SUBJECT_NAMES).find(key => SUBJECT_NAMES[key] === q.subject);
        return selectedSubjects[subjectCode];
      });
      
      // Group by subject
      const questionsBySubject = {};
      filteredQuestions.forEach(q => {
        if (!questionsBySubject[q.subject]) questionsBySubject[q.subject] = [];
        questionsBySubject[q.subject].push(q);
      });
      
      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            // Other document elements would go here
          ],
        }],
      });

      Packer.toBlob(doc).then(blob => {
        saveAs(blob, `${courseName}_Exam_Paper.docx`);
        setNotification("DOCX downloaded successfully!");
        setTimeout(() => setNotification(null), 3000);
      });
    } catch (error) {
      setError("Failed to generate DOCX. Please try again.");
    }
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
    sessionStorage.setItem('savedReserveQuestions', JSON.stringify(reserveQuestions));
    
    navigate('/answer-key', {
      state: {
        questions,
        courseName,
        totalMarks,
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

  // Restore questions when returning from answer key
  useEffect(() => {
    if (location.state?.returnFromAnswerKey) {
      const savedQuestions = sessionStorage.getItem('savedQuestions');
      const savedReserveQuestions = sessionStorage.getItem('savedReserveQuestions');
      
      if (savedQuestions) setQuestions(JSON.parse(savedQuestions));
      if (savedReserveQuestions) setReserveQuestions(JSON.parse(savedReserveQuestions));
    }
  }, [location.state]);

  // Create subjects array for the randomization panel
  const subjects = SUBJECT_CODES.map(code => ({
    code,
    name: SUBJECT_NAMES[code],
    count: questionsBySubject[code]?.length || 0,
    reserveCount: reserveQuestions.filter(q => q.subject === SUBJECT_NAMES[code]).length || 0
  })).filter(subject => subject.name); // Filter out empty names

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
      
      {/* Simplified Randomization Panel */}
      <RandomizationPanel 
        subjects={subjects} 
        totalMarks={totalMarks}
        onRandomize={handleRandomize}
      />
      
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
                  <h2 className="text-xl font-bold">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h2>
                  <h3 className="text-lg font-semibold">{courseName}</h3>
                  <p className="font-medium mt-2">SEMESTER EXAMINATION</p>
                  <div className="flex justify-between mt-4">
                    <p>Date: {currentDate}</p>
                    <p>Time: {examTime} Hours</p>
                    <p>Max Marks: {totalMarks}</p>
                  </div>
                  <p className="mt-2 font-medium">Answer all questions</p>
                </div>
                
                {/* Questions Display */}
                {SUBJECT_CODES.filter(code => selectedSubjects[code] && questionsBySubject[code]?.length > 0).map(subjectCode => (
                  <div key={subjectCode} className="mb-8">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">{SUBJECT_NAMES[subjectCode]}</h3>
                    
                    {questionsBySubject[subjectCode].map((q, idx) => (
                      <div key={q.id} className="mb-6 pl-4">
                        <p className="font-medium mb-2">{idx + 1}. {stripHTMLTags(q.question)}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-8">
                          {q.options && Array.isArray(q.options) && q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="mb-1">
                              <span className="font-medium mr-1">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                              <span>{opt.type === 'Text' ? opt.value : '[Image]'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No questions available. Please load questions or select different subjects.</p>
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
      </div>
      
      {/* Warning */}
      <div className="mt-6 p-3 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg text-sm">
        <p className="font-semibold">Important:</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Once you save the paper, all entered questions will be removed from editing mode.</li>
          <li>The paper and answer key will be saved to your account and can be accessed from "My Papers".</li>
          <li>You cannot return to the question entry screen after viewing the final paper.</li>
          <li>Click "Save & Complete Paper" to finalize and download your paper.</li>
        </ul>
      </div>
    </div>
  );
};

export default FinalPreview;