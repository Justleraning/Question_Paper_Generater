import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './CreatePapers.css';

const CreatePapers = () => {
  // Reference for printing
  const componentRef = useRef();
  
  // Get exam configuration from router state
  const location = useLocation();
  const { examConfig, questionDistribution } = location.state || {};
  
  // Get exam details from localStorage
  const [examDetails, setExamDetails] = useState({
    course: "",
    semester: "",
    semesterExamination: "",
    examinationConducted: "",
    subjectCode: "",
    subjectName: "",
    examTimings: "2 hours",
  });
  
  // State for paper details
  const [paperDetails, setPaperDetails] = useState({
    university: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
    duration: "2",
    maxMarks: "78"
  });
  
  // State for questions
  const [questions, setQuestions] = useState({
    partA: [],
    partB: [],
    partC: []
  });
  
  // State to control whether to show the paper
  const [showPaper, setShowPaper] = useState(false);
  
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState(null);

  // Load exam details from localStorage on component mount
  useEffect(() => {
    try {
      const savedExamDetails = localStorage.getItem('examDetails');
      if (savedExamDetails) {
        setExamDetails(JSON.parse(savedExamDetails));
      }
    } catch (error) {
      console.error('Error loading exam details from localStorage:', error);
    }
  }, []);
  
  // Helper function to map bloom levels between UI and API
  const mapBloomLevel = (level) => {
    const bloomMap = {
      1: 'Remember L1',  // Level 1: Remember, Understand
      2: 'Apply L2',     // Level 2: Apply, Analyze
      3: 'Evaluate L3'   // Level 3: Evaluate, Create
    };
    return bloomMap[level] || level;
  };
  
  // Helper function to get the bloom level number from a string
  const getBloomLevelNumber = (bloomString) => {
    if (bloomString.includes('Remember') || bloomString.includes('Understand')) {
      return 1;
    } else if (bloomString.includes('Apply') || bloomString.includes('Analyze')) {
      return 2;
    } else if (bloomString.includes('Evaluate') || bloomString.includes('Create')) {
      return 3;
    }
    return 1; // Default to level 1 if unknown
  };
  
  // Helper function to shuffle an array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Function to fetch questions from the backend
  const fetchQuestions = async () => {
    if (!examDetails.subjectCode) {
      setError("Missing subject code. Please set exam details first.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Prepare containers for the fetched questions
      const partAQuestions = [];
      const partBQuestions = [];
      const partCQuestions = [];
      
      // Only proceed if we have exam configuration
      if (examConfig && questionDistribution) {
        // Fetch questions for each part
        for (const part of examConfig.parts) {
          const partId = part.id;
          
          // Fetch questions for each unit in this part
          for (let unitIndex = 0; unitIndex < part.questionsByUnit.length; unitIndex++) {
            const unitId = unitIndex + 1;
            const questionsNeeded = part.questionsByUnit[unitIndex];
            
            if (questionsNeeded > 0 && examConfig.units[unitIndex].enabled) {
              // Fetch questions for each bloom level for this unit and part
              for (let bloomIndex = 0; bloomIndex < part.questionsByBloom.length; bloomIndex++) {
                const bloomId = bloomIndex + 1;
                const bloomQuestionsNeeded = part.questionsByBloom[bloomIndex];
                
                if (bloomQuestionsNeeded > 0 && examConfig.blooms[bloomIndex].enabled) {
                  // Calculate approximate questions needed for this unit/bloom combination
                  // This is a simplification - in reality, you would need a more sophisticated algorithm
                  // to properly distribute questions across both unit and bloom dimensions
                  let questionsForThisBloom = Math.ceil(questionsNeeded * (bloomQuestionsNeeded / part.maxQuestions));
                  
                  // Fetch questions for this part, unit, and bloom level
                  const response = await axios.get('/api/endsem-questions', {
                    params: {
                      subjectCode: examDetails.subjectCode,
                      part: partId,
                      unit: unitId.toString(),
                      bloomLevel: mapBloomLevel(bloomId)
                    }
                  });
                  
                  const availableQuestions = response.data.questions || [];
                  
                  if (availableQuestions.length === 0) {
                    console.warn(`No questions found for part ${partId}, unit ${unitId}, bloom level ${bloomId}`);
                    continue;
                  }
                  
                  // Take the minimum of available questions and needed questions
                  const fetchCount = Math.min(availableQuestions.length, questionsForThisBloom);
                  
                  // Randomly select questions
                  const selectedQuestions = shuffleArray(availableQuestions).slice(0, fetchCount);
                  
                  // Add to the appropriate part
                  if (partId === 'A') {
                    partAQuestions.push(...selectedQuestions);
                  } else if (partId === 'B') {
                    partBQuestions.push(...selectedQuestions);
                  } else if (partId === 'C') {
                    partCQuestions.push(...selectedQuestions);
                  }
                }
              }
            }
          }
        }
        
        // Limit questions to match the required count for each part
        const limitedPartA = partAQuestions.slice(0, examConfig.parts.find(p => p.id === 'A').maxQuestions);
        const limitedPartB = partBQuestions.slice(0, examConfig.parts.find(p => p.id === 'B').maxQuestions);
        const limitedPartC = partCQuestions.slice(0, examConfig.parts.find(p => p.id === 'C').maxQuestions);
        
        // Update the questions state
        setQuestions({
          partA: limitedPartA,
          partB: limitedPartB,
          partC: limitedPartC
        });
        
        // Display warning if not enough questions were found
        if (
          limitedPartA.length < examConfig.parts.find(p => p.id === 'A').maxQuestions ||
          limitedPartB.length < examConfig.parts.find(p => p.id === 'B').maxQuestions ||
          limitedPartC.length < examConfig.parts.find(p => p.id === 'C').maxQuestions
        ) {
          setError("Warning: Not enough questions available in the database for some sections.");
        }
      } else {
        // Fallback if exam configuration is not available
        // Fetch some questions for each part
        for (const partId of ['A', 'B', 'C']) {
          const response = await axios.get('/api/endsem-questions', {
            params: {
              subjectCode: examDetails.subjectCode,
              part: partId
            }
          });
          
          const availableQuestions = response.data.questions || [];
          
          // Add to the appropriate part
          if (partId === 'A') {
            partAQuestions.push(...availableQuestions.slice(0, 5)); // Limit to 5 questions for Part A
          } else if (partId === 'B') {
            partBQuestions.push(...availableQuestions.slice(0, 7)); // Limit to 7 questions for Part B
          } else if (partId === 'C') {
            partCQuestions.push(...availableQuestions.slice(0, 4)); // Limit to 4 questions for Part C
          }
        }
        
        // Update the questions state
        setQuestions({
          partA: partAQuestions,
          partB: partBQuestions,
          partC: partCQuestions
        });
        
        setError("Warning: Using fallback question loading as exam configuration is not available.");
      }
      
      setShowPaper(true);
      
      // Scroll to the generated paper after a short delay to allow rendering
      setTimeout(() => {
        const paperElement = document.getElementById('din8-paper-container');
        if (paperElement) {
          paperElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(`Error fetching questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to replace a question with another from the database
  const replaceQuestion = async (questionId, part, unit, bloomLevel) => {
    try {
      setLoading(true);
      
      // Get bloom level number or use bloomLevel directly if it's already a number
      const bloomLevelNumber = typeof bloomLevel === 'number' 
        ? bloomLevel 
        : getBloomLevelNumber(bloomLevel);
      
      // Fetch a replacement question with the same unit and bloom level
      const response = await axios.get('/api/endsem-questions', {
        params: {
          subjectCode: examDetails.subjectCode,
          part: part,
          unit: unit.toString(),
          bloomLevel: mapBloomLevel(bloomLevelNumber)
        }
      });
      
      const availableQuestions = response.data.questions || [];
      
      // Filter out the current question
      const filteredQuestions = availableQuestions.filter(q => q._id !== questionId);
      
      if (filteredQuestions.length === 0) {
        alert("No alternative questions available for this section. Try refreshing the page or adding more questions to the database.");
        setLoading(false);
        return;
      }
      
      // Select a random replacement question
      const replacementQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      
      // Create a copy of the current questions
      const updatedQuestions = { ...questions };
      
      // Find the question to replace
      let questionIndex;
      if (part === 'A') {
        questionIndex = updatedQuestions.partA.findIndex(q => q._id === questionId);
        if (questionIndex !== -1) {
          updatedQuestions.partA[questionIndex] = replacementQuestion;
        }
      } else if (part === 'B') {
        questionIndex = updatedQuestions.partB.findIndex(q => q._id === questionId);
        if (questionIndex !== -1) {
          updatedQuestions.partB[questionIndex] = replacementQuestion;
        }
      } else if (part === 'C') {
        questionIndex = updatedQuestions.partC.findIndex(q => q._id === questionId);
        if (questionIndex !== -1) {
          updatedQuestions.partC[questionIndex] = replacementQuestion;
        }
      }
      
      // Update questions state
      setQuestions(updatedQuestions);
      
    } catch (error) {
      console.error('Error replacing question:', error);
      alert('There was an error replacing the question. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to randomize all questions in the paper
  const randomizeQuestions = async () => {
    try {
      setLoading(true);
      await fetchQuestions(); // Refetch all questions with new randomization
    } catch (error) {
      console.error('Error randomizing questions:', error);
      alert('There was an error randomizing the questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle the send for approval action
  const sendForApproval = () => {
    // In a real application, this would submit the paper to an approval workflow
    alert('Question paper has been sent for approval to the department head!');
  };

  // Function to save paper (in a real app, this would save to a database)
  const savePaper = () => {
    alert('Question paper has been saved successfully!');
  };
  
  // Function to download/print the paper as PDF using a third-party library
  const downloadPaper = () => {
    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'din8-loading-overlay';
    loadingOverlay.innerHTML = '<div class="din8-loading-spinner"></div><div style="margin-top: 20px;">Generating PDF...</div>';
    document.body.appendChild(loadingOverlay);
    
    // Create a new script element for jsPDF
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    
    // Create a new script element for html2canvas
    const html2canvasScript = document.createElement('script');
    html2canvasScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    html2canvasScript.async = true;
    
    // Append both scripts to the document
    document.body.appendChild(jsPDFScript);
    document.body.appendChild(html2canvasScript);
    
    // Function to create PDF once libraries are loaded
    const createPDF = () => {
      // Get the paper element
      const paperElement = document.querySelector('.din8-a4-paper');
      
      // Create a clone to avoid modifying the original
      const paperClone = paperElement.cloneNode(true);
      
      // Create a container for the clone with specific styling to match the desired output
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm'; // A4 width
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.padding = '0';
      tempContainer.style.margin = '0';
      tempContainer.appendChild(paperClone);
      
      // Append the container to the body
      document.body.appendChild(tempContainer);
      
      // Remove all replace buttons
      const replaceButtons = tempContainer.querySelectorAll('.din8-replace-btn');
      replaceButtons.forEach(button => {
        button.remove();
      });
      
      // Remove paper actions
      const paperActions = tempContainer.querySelector('.din8-paper-actions');
      if (paperActions) {
        paperActions.remove();
      }
      
      // Adjust the question padding since we removed the buttons
      const questions = tempContainer.querySelectorAll('.din8-question');
      questions.forEach(question => {
        question.style.paddingRight = '0';
      });
      
      // Make sure the university logo is properly set
      const logo = tempContainer.querySelector('.din8-university-logo');
      if (logo) {
        logo.crossOrigin = "Anonymous";
        logo.style.display = 'block';
        logo.style.width = '120px';
        logo.style.height = 'auto';
        
        // Force the image to be fully loaded
        if (!logo.complete) {
          logo.src = logo.src;
        }
      }
      
      // Ensure all headers are centered
      const headerTexts = tempContainer.querySelectorAll('.din8-university-name, .din8-course-details, .din8-paper-title');
      headerTexts.forEach(text => {
        text.style.textAlign = 'center';
        text.style.width = '100%';
      });
      
      // Center all part titles and instructions
      const partTitles = tempContainer.querySelectorAll('.din8-part-title');
      partTitles.forEach(title => {
        title.style.textAlign = 'center';
        title.style.fontWeight = 'bold';
        title.style.marginTop = '20px';
        title.style.marginBottom = '5px';
      });
      
      // Update the page footer to show correct page numbers
      const pageFooter = tempContainer.querySelector('.din8-page-footer');
      if (pageFooter) {
        pageFooter.textContent = 'Page 1 of 1';
      }
      
      // Adjust margins and padding for a cleaner look
      const a4Page = tempContainer.querySelector('.din8-a4-page');
      if (a4Page) {
        a4Page.style.paddingTop = '10mm';
        a4Page.style.paddingBottom = '10mm';
      }
      
      // Wait for the DOM to update
      setTimeout(() => {
        // Use html2canvas to convert to image
        window.html2canvas(paperClone, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          onclone: (clonedDoc) => {
            // Further adjustments to cloned document if needed
            const clonedQuestions = clonedDoc.querySelectorAll('.din8-question');
            clonedQuestions.forEach(q => {
              q.style.paddingRight = '0';
            });
          }
        }).then(canvas => {
          // Create PDF
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
          });
          
          // Get dimensions
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 210; // A4 width in mm
          const pageHeight = 297; // A4 height in mm
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add the image to the PDF (first page)
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
          
          // If content overflows to second page
          if (imgHeight > pageHeight) {
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, -pageHeight, imgWidth, imgHeight);
          }
          
          // Save the PDF
          pdf.save('Question_Paper.pdf');
          
          // Clean up
          document.body.removeChild(tempContainer);
          document.body.removeChild(loadingOverlay);
          
          // Show success message
          alert('Question paper downloaded as PDF successfully!');
        }).catch(error => {
          console.error('Error generating PDF:', error);
          document.body.removeChild(tempContainer);
          document.body.removeChild(loadingOverlay);
          alert('There was an error generating the PDF. Please try again.');
        });
      }, 500);
    };
    
    // Check if libraries are loaded before creating PDF
    const checkLibrariesLoaded = () => {
      if (window.jspdf && window.html2canvas) {
        createPDF();
      } else {
        setTimeout(checkLibrariesLoaded, 100);
      }
    };
    
    // Start checking if libraries are loaded
    jsPDFScript.onload = checkLibrariesLoaded;
  };
  
  // Generate a paper on first load
  useEffect(() => {
    fetchQuestions();
  }, [examDetails.subjectCode]); // Refetch when subject code changes
  
  // Add CSS for the loading spinner and error message
  const additionalStyles = `
    .din8-loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      width: 100%;
    }

    .din8-loading-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #3498db;
      width: 40px;
      height: 40px;
      animation: din8-spin 1s linear infinite;
      margin-bottom: 15px;
    }

    @keyframes din8-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .din8-loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      color: white;
      font-size: 18px;
    }

    .din8-error-message {
      background-color: #ffeeee;
      border: 1px solid #ffaaaa;
      border-radius: 4px;
      padding: 10px 15px;
      margin: 10px 0;
      color: #d84040;
      font-size: 14px;
    }

    .din8-no-questions {
      padding: 10px;
      margin: 10px 0;
      font-style: italic;
      color: #888;
      text-align: center;
      background-color: #f8f8f8;
      border-radius: 4px;
      border: 1px dashed #ccc;
    }

    .din8-question-image-container {
      margin-top: 10px;
      margin-bottom: 10px;
      text-align: center;
    }

    .din8-question-image {
      max-width: 100%;
      max-height: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  `;
  
  // Insert additional styles
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.innerHTML = additionalStyles;
    
    // Append to the head
    document.head.appendChild(styleElement);
    
    // Clean up on component unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);
  
  if (loading) {
    return (
      <div className="din8-loading-container">
        <div className="din8-loading-spinner"></div>
        <p>Loading question paper...</p>
      </div>
    );
  }
  
  return (
    <div className="din8-app-container">
      {/* Question Paper Generator Title */}
      <h1 className="din8-main-title">Question Paper Generator</h1>
      
      {error && (
        <div className="din8-error-message">
          {error}
        </div>
      )}
      
      {showPaper && (
        <div className="din8-paper-container" id="din8-paper-container">
          <div className="din8-a4-paper" ref={componentRef}>
            {/* Page 1 */}
            <div className="din8-a4-page">
              <div className="din8-university-header">
                <div className="din8-header-flex">
                  <img 
                    src="/SJU.png" 
                    alt="St. Joseph's University" 
                    className="din8-university-logo"
                    crossOrigin="anonymous"
                  />
                  <div className="din8-header-text">
                    <div className="din8-university-name">{paperDetails.university}</div>
                    <div className="din8-course-details">{examDetails.course} - {examDetails.semester} SEMESTER</div>
                    <div className="din8-course-details">SEMESTER EXAMINATION: {examDetails.semesterExamination}</div>
                    <div className="din8-course-details">(Examination conducted in {examDetails.examinationConducted})</div>
                    <div className="din8-paper-title">{examDetails.subjectCode}: {examDetails.subjectName}</div>
                    <div className="din8-course-details">( For current batch students only )</div>
                  </div>
                </div>
              </div>
              
              <div className="din8-registration-box">
                <div>Registration Number:</div>
                <div>Date:</div>
              </div>
              
              <div className="din8-exam-info">
                <div>Time: {examDetails.examTimings}</div>
                <div>Max Marks: {paperDetails.maxMarks}</div>
              </div>
              
              <div className="din8-course-details">This paper contains 1 printed page and 3 parts</div>
              
              {/* Part A */}
              <div className="din8-part-title">PART-A</div>
              <div className="din8-part-instructions">
                <div>Answer all FIVE questions</div>
                <div>(2 X 5 = 10)</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partA.length > 0 ? (
                  questions.partA.map((question, index) => (
                    <div className="din8-question" id={question._id} key={question._id || index}>
                      <span className="din8-question-number">{index + 1}.</span>
                      <span className="din8-question-text">{question.question}</span>
                      
                      {/* Show image if available */}
                      {question.hasImage && question.imageUrl && (
                        <div className="din8-question-image-container">
                          <img 
                            src={question.imageUrl} 
                            alt={`Image for question ${index + 1}`}
                            className="din8-question-image"
                          />
                        </div>
                      )}
                      
                      <button 
                        className="din8-replace-btn" 
                        onClick={() => replaceQuestion(question._id, 'A', question.unit, getBloomLevelNumber(question.bloomLevel))}
                      >
                        Replace
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part A</div>
                )}
              </div>
              
              {/* Part B */}
              <div className="din8-part-title">PART-B</div>
              <div className="din8-part-instructions">
                <div>Answer any FIVE questions</div>
                <div>(4 X 5 = 20)</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partB.length > 0 ? (
                  questions.partB.map((question, index) => (
                    <div className="din8-question" id={question._id} key={question._id || index}>
                      <span className="din8-question-number">{index + 6}.</span>
                      <span className="din8-question-text">{question.question}</span>
                      
                      {/* Show image if available */}
                      {question.hasImage && question.imageUrl && (
                        <div className="din8-question-image-container">
                          <img 
                            src={question.imageUrl} 
                            alt={`Image for question ${index + 6}`}
                            className="din8-question-image"
                          />
                        </div>
                      )}
                      
                      <button 
                        className="din8-replace-btn" 
                        onClick={() => replaceQuestion(question._id, 'B', question.unit, getBloomLevelNumber(question.bloomLevel))}
                      >
                        Replace
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part B</div>
                )}
              </div>
              
              {/* Part C */}
              <div className="din8-part-title">PART-C</div>
              <div className="din8-part-instructions">
                <div>Answer any THREE questions</div>
                <div>(10 X 3 = 30)</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partC.length > 0 ? (
                  questions.partC.map((question, index) => (
                    <div className="din8-question" id={question._id} key={question._id || index}>
                      <span className="din8-question-number">{index + questions.partB.length + 6}.</span>
                      <span className="din8-question-text">{question.question}</span>
                      
                      {/* Show image if available */}
                      {question.hasImage && question.imageUrl && (
                        <div className="din8-question-image-container">
                          <img 
                            src={question.imageUrl} 
                            alt={`Image for question ${index + questions.partB.length + 6}`}
                            className="din8-question-image"
                          />
                        </div>
                      )}
                      
                      <button 
                        className="din8-replace-btn" 
                        onClick={() => replaceQuestion(question._id, 'C', question.unit, getBloomLevelNumber(question.bloomLevel))}
                      >
                        Replace
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part C</div>
                )}
              </div>
              
              <div className="din8-page-footer">Page 1 of 1</div>
            </div>
          </div>
          
          {/* Action buttons outside the paper */}
          <div className="din8-paper-actions">
            <button className="din8-action-btn din8-save-btn" onClick={savePaper}>
              Save Paper
            </button>
            <button className="din8-action-btn din8-download-btn" onClick={downloadPaper}>
              Download Paper
            </button>
            <button className="din8-action-btn din8-generate-btn" onClick={randomizeQuestions}>
              Randomize Questions
            </button>
            <button className="din8-action-btn din8-approve-btn" onClick={sendForApproval}>
              Send for Approval
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePapers;