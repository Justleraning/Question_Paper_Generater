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
  const [paperDetails] = useState({
    university: "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
    duration: "2",
    maxMarks: "60"
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

  // State to track resized images and their dimensions
  const [imageStates, setImageStates] = useState({});
  
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

  // Enhanced image handling with improved drag and resize
  const initializeImageControls = (img) => {
    if (!img || img.getAttribute('data-initialized')) return;
    
    // Mark as initialized
    img.setAttribute('data-initialized', 'true');
    
    // Get the container
    const container = img.closest('.din8-question-image-container');
    if (!container) return;
    
    // Set container styles
    container.style.position = 'relative';
    container.style.minHeight = '50px';
    
    // Set image styles
    img.style.position = 'relative';
    img.style.cursor = 'move';
    img.style.maxWidth = '100%';
    img.style.border = '1px solid #ddd';
    img.style.borderRadius = '4px';
    img.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
    // Create resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'din8-resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.background = '#007bff';
    resizeHandle.style.cursor = 'nwse-resize';
    
    container.appendChild(resizeHandle);
    
    // Variables to track dragging
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let imgId = img.src.split('/').pop().split('.')[0];
    
    // Initialize image state if not already present
    if (!imageStates[imgId]) {
      setImageStates(prev => ({
        ...prev,
        [imgId]: {
          width: img.offsetWidth,
          height: img.offsetHeight,
          left: 0,
          top: 0
        }
      }));
    }
    
    // Apply saved state if available
    if (imageStates[imgId]) {
      img.style.width = `${imageStates[imgId].width}px`;
      img.style.height = `${imageStates[imgId].height}px`;
      img.style.left = `${imageStates[imgId].left}px`;
      img.style.top = `${imageStates[imgId].top}px`;
    }
    
    // Mouse down on image (start drag)
    img.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(img.style.left || '0');
      startTop = parseInt(img.style.top || '0');
      e.preventDefault();
    });
    
    // Mouse down on resize handle (start resize)
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.offsetWidth;
      startHeight = img.offsetHeight;
      e.preventDefault();
    });
    
    // Create a single mousemove handler for the document
    const handleMouseMove = (e) => {
      if (isDragging) {
        // Calculate the new position
        const newLeft = startLeft + (e.clientX - startX);
        const newTop = startTop + (e.clientY - startY);
        
        // Apply the new position
        img.style.left = `${newLeft}px`;
        img.style.top = `${newTop}px`;
        
        // Update state
        setImageStates(prev => ({
          ...prev,
          [imgId]: {
            ...prev[imgId],
            left: newLeft,
            top: newTop
          }
        }));
        
      } else if (isResizing) {
        // Calculate the new size while maintaining aspect ratio
        const aspectRatio = startHeight / startWidth;
        const newWidth = Math.max(50, startWidth + (e.clientX - startX));
        const newHeight = Math.max(50, newWidth * aspectRatio);
        
        // Apply the new size
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
        
        // Update state
        setImageStates(prev => ({
          ...prev,
          [imgId]: {
            ...prev[imgId],
            width: newWidth,
            height: newHeight
          }
        }));
      }
    };
    
    // Add the event listener to the document
    document.addEventListener('mousemove', handleMouseMove);
    
    // Mouse up (stop drag or resize)
    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    
    // Clean up function to remove event listeners
    const cleanUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Add the cleanup function to the image
    img._cleanup = cleanUp;
  };
  
  // Add the image controls to all images
  const addImageDragAndResize = () => {
    setTimeout(() => {
      const images = document.querySelectorAll('.din8-question-image');
      images.forEach(img => initializeImageControls(img));
    }, 500);
  };
  
  // Enhanced function to handle image changes
  useEffect(() => {
    // Clean up function to remove event listeners when unmounting
    return () => {
      const images = document.querySelectorAll('.din8-question-image');
      images.forEach(img => {
        if (img._cleanup) img._cleanup();
      });
    };
  }, []);
  
  // Monitor for changes that might affect page layout
  useEffect(() => {
    if (showPaper) {
      // Add image controls
      addImageDragAndResize();
    }
  }, [questions, showPaper]);
  
  // Helper functions to get question metadata
  const getPartFromQuestion = (question) => {
    // Search up the DOM tree to find the part
    let current = question;
    while (current && current.parentElement) {
      current = current.parentElement;
      
      // Check if we found a part section
      if (current.previousElementSibling && current.previousElementSibling.classList.contains('din8-part-title')) {
        const partTitle = current.previousElementSibling.textContent;
        if (partTitle.includes('PART-A')) return 'A';
        if (partTitle.includes('PART-B')) return 'B';
        if (partTitle.includes('PART-C')) return 'C';
      }
    }
    
    // Default
    return 'A';
  };
  
  const getUnitFromQuestion = (question) => {
    // In a real implementation, this would extract the unit from the question
    // This is a placeholder - you would need to implement this based on your data structure
    return 1;
  };
  
  const getBloomLevelFromQuestion = (question) => {
    // In a real implementation, this would extract the bloom level from the question
    // This is a placeholder - you would need to implement this based on your data structure
    return 1;
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
      
      // Reset image states when loading new questions
      setImageStates({});
      
      // Scroll to the generated paper after a short delay to allow rendering
      setTimeout(() => {
        const paperElement = document.getElementById('din8-paper-container');
        if (paperElement) {
          paperElement.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Add drag and resize functionality to images after paper is shown
        addImageDragAndResize();
      }, 300);
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
      
      // Add image controls after updating
      setTimeout(() => {
        addImageDragAndResize();
      }, 300);
      
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
      
      // First, make a safe copy of existing questions
      const existingQuestions = {
        partA: [...questions.partA],
        partB: [...questions.partB],
        partC: [...questions.partC]
      };
      
      // Shuffle existing questions
      const shuffledQuestions = {
        partA: shuffleArray(existingQuestions.partA),
        partB: shuffleArray(existingQuestions.partB),
        partC: shuffleArray(existingQuestions.partC)
      };
      
      // Update questions state with shuffled questions
      setQuestions(shuffledQuestions);
      
      // Reset image states when randomizing
      setImageStates({});
      
      // Then fetch fresh questions
      setTimeout(() => {
        fetchQuestions()
      }, 300);
      
    } catch (error) {
      console.error('Error randomizing questions:', error);
      alert('There was an error randomizing the questions. Please try again.');
      setLoading(false);
    }
  };
  
  // Function to handle the send for approval action
  const sendForApproval = () => {
    // In a real application, this would submit the paper to an approval workflow
    alert('Question paper has been sent for approval to the department head!');
  };

  // Function to save paper (in a real app, this would save to a database)
  const savePaper = async () => {
    try {
      // Show loading state
      setLoading(true);
      
      // Try to get token if available, but we don't require it anymore
      const token = localStorage.getItem('userToken') || 
                 localStorage.getItem('authToken') || 
                 localStorage.getItem('token') || 
                 'no-token-required';  // This will be handled by our middleware
      
      // Prepare the paper data in the required format
      const paperData = {
        university: {
          name: paperDetails.university,
          logoUrl: "/SJU.png"
        },
        examDetails: {
          course: examDetails.course,
          semester: examDetails.semester,
          semesterExamination: examDetails.semesterExamination,
          examinationConducted: examDetails.examinationConducted,
          subjectCode: examDetails.subjectCode,
          subjectName: examDetails.subjectName,
          examTimings: examDetails.examTimings,
          maxMarks: paperDetails.maxMarks,
          duration: paperDetails.duration
        },
        questions: {
          partA: questions.partA.map(q => q._id),
          partB: questions.partB.map(q => q._id),
          partC: questions.partC.map(q => q._id)
        },
        status: 'draft',
        createdAt: new Date()
      };
      
      // Send the paper data to the server with or without token
      const response = await axios.post('http://localhost:5000/api/endpapers', paperData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Handle successful save
      if (response.status === 201) {
        alert('Question paper has been saved successfully!');
      } else {
        throw new Error('Failed to save paper');
      }
    } catch (error) {
      console.error('Error saving paper:', error);
      alert(`Failed to save paper: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPaper = () => {
    // Show loading indicator
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'din8-loading-overlay';
    loadingOverlay.innerHTML = '<div class="din8-loading-spinner"></div><div style="margin-top: 20px;">Generating PDF...</div>';
    document.body.appendChild(loadingOverlay);
    
    // Load jsPDF
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    document.body.appendChild(jsPDFScript);
    
    // Check if libraries are loaded
    const checkLibrariesLoaded = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        generatePDF();
      } else {
        setTimeout(checkLibrariesLoaded, 100);
      }
    };
    
    // Start checking if libraries are loaded
    jsPDFScript.onload = checkLibrariesLoaded;
    
    // Function to generate the PDF
    const generatePDF = () => {
      try {
        const { jsPDF } = window.jspdf;
        
        // Create new PDF document
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        // Define page dimensions (A4)
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15; // margins in mm
        const contentWidth = pageWidth - (margin * 2);
        
        // Make sure questions arrays exist
        const questionsPartA = Array.isArray(questions.partA) ? questions.partA : [];
        const questionsPartB = Array.isArray(questions.partB) ? questions.partB : [];
        const questionsPartC = Array.isArray(questions.partC) ? questions.partC : [];
        
        // Current Y position on the page
        let yPos = margin;
        let currentPage = 1;
        
        // Registration Number and Date box in extreme right corner
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.1);
        // Create a smaller box positioned at the extreme right corner
        const boxWidth = 50;
        const boxHeight = 15;
        const boxX = pageWidth - boxWidth - 5; // Only 5mm from right edge
        const boxY = margin;
        pdf.rect(boxX, boxY, boxWidth, boxHeight);
        pdf.setFontSize(8); // Smaller font size
        pdf.setFont('helvetica', 'normal');
        // Add the text with proper alignment and positioning
        pdf.text("Registration Number:", boxX + 2, boxY + 5);
        pdf.text("Date:", boxX + 2, boxY + 11);
        
        // Function to add university logo
        const addLogo = async () => {
          return new Promise((resolve) => {
            // Try to load the university logo
            const logo = new Image();
            logo.crossOrigin = 'Anonymous';
            
            logo.onload = () => {
              try {
                // Make the logo a square shape with 30mm width and height
                const imgWidth = 30; // Fixed width 30mm
                const imgHeight = 30; // Fixed height 30mm to make it square
                
                // Create temporary canvas to convert image to data URL
                const canvas = document.createElement('canvas');
                canvas.width = logo.width;
                canvas.height = logo.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(logo, 0, 0);
                
                // Add logo to PDF at left side
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgWidth, imgHeight);
                
                resolve();
              } catch (err) {
                console.error('Failed to add logo to PDF:', err);
                resolve();
              }
            };
            
            logo.onerror = () => {
              console.warn('Failed to load university logo');
              resolve();
            };
            
            // Try to load from SJU.png
            logo.src = '/SJU.png';
            
            // If logo doesn't load in 2 seconds, continue without it
            setTimeout(() => {
              if (!logo.complete) {
                console.warn('Logo loading timed out');
                resolve();
              }
            }, 2000);
          });
        };
        
        // Function to add page header
        const addPageHeader = async () => {
          // Try to add logo
          await addLogo();
          
          // University name - centered and bold
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(paperDetails.university, pageWidth/2, margin + 7, { align: 'center' });
          
          // Course details - start with appropriate spacing
          yPos = margin + 15;
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${examDetails.course} - ${examDetails.semester} SEMESTER`, pageWidth/2, yPos, { align: 'center' });
          yPos += 6;
          
          pdf.text(`SEMESTER EXAMINATION: ${examDetails.semesterExamination}`, pageWidth/2, yPos, { align: 'center' });
          yPos += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`(Examination conducted in ${examDetails.examinationConducted})`, pageWidth/2, yPos, { align: 'center' });
          yPos += 6;
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${examDetails.subjectCode}: ${examDetails.subjectName}`, pageWidth/2, yPos, { align: 'center' });
          yPos += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text("(For Current batch student only)", pageWidth/2, yPos, { align: 'center' });
          yPos += 10;
          
          // Exam info
          pdf.setFontSize(10);
          pdf.text(`Time: ${examDetails.examTimings}`, margin, yPos);
          pdf.text(`Max Marks: ${paperDetails.maxMarks}`, pageWidth - margin, yPos, { align: 'right' });
          yPos += 6;
          
          // Paper info
          const totalPages = 2; // We'll force exactly 2 pages like in your example
          pdf.setFont('helvetica', 'normal');
          pdf.text(`This paper contains ${totalPages} printed pages and 3 parts`, pageWidth/2, yPos, { align: 'center' });
          yPos += 10;
        };
        
        // Function to check if we need a new page
        const checkPageBreak = (neededSpace) => {
          if (yPos + neededSpace > pageHeight - margin) {
            pdf.addPage();
            currentPage++;
            yPos = margin;
            return true;
          }
          return false;
        };
        
        // Function to render Parts A and B with their questions
        const renderPartAB = (partTitle, instructions, questionsList, startNumber) => {
          // Add part title
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, pageWidth/2, yPos, { align: 'center' });
          yPos += 8;
          
          // Add part instructions - BOLD and CAPITAL LETTERS for the first part
          pdf.setFont('helvetica', 'bold');
          pdf.text(instructions[0].toUpperCase(), margin, yPos);
          pdf.text(instructions[1], pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
          
          // Add questions
          pdf.setFont('helvetica', 'normal');
          
          let prevQuestionType = null;
          
          for (let i = 0; i < questionsList.length; i++) {
            const question = questionsList[i];
            
            // Get question text
            const questionText = question.question || "No question text available";
            
            // Determine question type (you may need to add a type field to your question objects)
            const currentQuestionType = question.type || 'default';
            
            // Question number
            pdf.text(`${startNumber + i}.`, margin, yPos);
            
            // Handle multi-line question text
            const textLines = pdf.splitTextToSize(questionText, contentWidth - 10);
            pdf.text(textLines, margin + 7, yPos);
            
            // Move Y position down based on text length with appropriate line spacing
            // First line plus any additional lines with 0.4cm (4mm) line spacing
            if (textLines.length > 1) {
              yPos += 5; // 0.5cm for first line
              yPos += 4 * (textLines.length - 1); // 0.4cm for each additional line
            } else {
              yPos += 5; // Just 0.5cm for a single line
            }
            
            // Add image if available
            if (question.hasImage && question.imageUrl) {
              try {
                // Load image and add to PDF
                const img = new Image();
                img.src = question.imageUrl;
                
                // If image loads, add it
                if (img.complete) {
                  // Calculate dimensions
                  const imgWidth = Math.min(contentWidth - 20, 100);
                  const imgHeight = (img.height * imgWidth) / img.width;
                  
                  // Check for page break
                  if (yPos + imgHeight > pageHeight - margin) {
                    checkPageBreak(imgHeight);
                  }
                  
                  // Add image
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);
                  
                  pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', margin + 10, yPos, imgWidth, imgHeight);
                  yPos += imgHeight + 5;
                }
              } catch (err) {
                console.error("Error adding image:", err);
              }
            }
            
            // Set spacing between questions - always 0.5cm (5mm) between questions
            yPos += 5; // 0.5cm spacing between questions
            
            prevQuestionType = currentQuestionType;
            
            // Check if we need a page break
            if (yPos > pageHeight - margin && i < questionsList.length - 1) {
              checkPageBreak(20);
            }
          }
          
          // Add minimal space after part
          yPos += 5;
        };
        
        // Function to render Part C with special handling
        const renderPartC = (partTitle, instructions, questionsList, startNumber) => {
          // Start with checking how much space is left on the current page
          const spaceLeft = pageHeight - margin - yPos;
          
          // Add part title
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, pageWidth/2, yPos, { align: 'center' });
          yPos += 8;
          
          // Add part instructions
          pdf.setFont('helvetica', 'bold');
          pdf.text(instructions[0].toUpperCase(), margin, yPos);
          pdf.text(instructions[1], pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
          
          // Add questions
          pdf.setFont('helvetica', 'normal');
          
          let prevQuestionType = null;
          
          // First try to print as many questions as will fit on the current page
          for (let i = 0; i < questionsList.length; i++) {
            const question = questionsList[i];
            
            // Get question text
            const questionText = question.question || "No question text available";
            
            // Determine question type (you may need to add a type field to your question objects)
            const currentQuestionType = question.type || 'default';
            
            // Calculate how much space this question will need
            const textLines = pdf.splitTextToSize(questionText, contentWidth - 10);
            
            // Calculate height based on line count: 0.5cm for first line, 0.4cm for each additional line
            let questionHeight = 5; // 0.5cm for first line
            if (textLines.length > 1) {
              questionHeight += 4 * (textLines.length - 1); // 0.4cm for each additional line
            }
            
            // Check if there's enough space for this question on the current page
            const imageHeight = question.hasImage && question.imageUrl ? 50 : 0; // Estimate image height
            const neededSpace = questionHeight + imageHeight + 5; // 5mm for spacing
            
            // If we need a page break, do it before printing this question
            // Only break if there's not enough space for this specific question
            if (yPos + neededSpace > pageHeight - margin) {
              pdf.addPage();
              currentPage++;
              yPos = margin;
            }
            
            // Question number
            pdf.text(`${startNumber + i}.`, margin, yPos);
            
            // Print question text
            pdf.text(textLines, margin + 7, yPos);
            
            // Move Y position down based on text length with appropriate line spacing
            // First line plus any additional lines with 0.4cm (4mm) line spacing
            if (textLines.length > 1) {
              yPos += 5; // 0.5cm for first line
              yPos += 4 * (textLines.length - 1); // 0.4cm for each additional line
            } else {
              yPos += 5; // Just 0.5cm for a single line
            }
            
            // Add image if available
            if (question.hasImage && question.imageUrl) {
              try {
                // Load image and add to PDF
                const img = new Image();
                img.src = question.imageUrl;
                
                // If image loads, add it
                if (img.complete) {
                  // Calculate dimensions
                  const imgWidth = Math.min(contentWidth - 20, 100);
                  const imgHeight = (img.height * imgWidth) / img.width;
                  
                  // Add image
                  const canvas = document.createElement('canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0);
                  
                  pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', margin + 10, yPos, imgWidth, imgHeight);
                  yPos += imgHeight + 5;
                }
              } catch (err) {
                console.error("Error adding image:", err);
              }
            }
            
            // Set spacing between questions - always 0.5cm (5mm) between questions
            yPos += 5; // 0.5cm spacing between questions
            
            prevQuestionType = currentQuestionType;
          }
        };
        
        // Add first page header
        addPageHeader().then(() => {
          try {
            // Render Part A
            renderPartAB(
              'PART-A', 
              ['Answer all FIVE questions', '(2 X 5 = 10)'], 
              questionsPartA,
              1
            );
            
            // Render Part B
            renderPartAB(
              'PART-B', 
              ['Answer any FIVE questions', '(4 X 5 = 20)'],
              questionsPartB,
              questionsPartA.length + 1
            );
            
            // For Part C, we have a special handling to make efficient use of space
            // If there's enough space on the first page, start there, otherwise start on page 2
            // For Part C, don't force it to new page - always try to fit as many questions as possible on page 1
            // Just continue from wherever we are - no special page break handling for Part C start
            
            // Don't add excessive space before Part C
            yPos += 5;
            
            // Render Part C
            renderPartC(
              'PART-C', 
              ['Answer any THREE questions', '(10 X 3 = 30)'],
              questionsPartC,
              questionsPartA.length + questionsPartB.length + 1
            );
            
            // Save the PDF with both subject code and subject name in the filename
            const sanitizedSubjectName = examDetails.subjectName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
            pdf.save(`${examDetails.subjectCode}_${sanitizedSubjectName}_Question_Paper.pdf`);
            
            // Remove loading overlay
            document.body.removeChild(loadingOverlay);
            
          } catch (error) {
            console.error('Error rendering PDF:', error);
            document.body.removeChild(loadingOverlay);
            alert('Error generating PDF: ' + error.message);
          }
        }).catch(error => {
          console.error('Error generating PDF:', error);
          document.body.removeChild(loadingOverlay);
          alert('Error generating PDF: ' + error.message);
        });
      } catch (error) {
        console.error('Error in PDF generation:', error);
        document.body.removeChild(loadingOverlay);
        alert('Error generating PDF: ' + error.message);
      }
    };
  };
  
  // Generate a paper on first load
  useEffect(() => {
    fetchQuestions();
  }, [examDetails.subjectCode]); // Refetch when subject code changes
  
  // Add CSS for the loading spinner, error message, and fixed layout
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
      position: relative;
      min-height: 50px;
    }

    .din8-question-image {
      max-width: 100%;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }
    
    /* Modified paper layout styles */
    .din8-a4-paper {
      background-color: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      margin: 20px auto;
      position: relative;
      width: 210mm;
      height: auto;
      min-height: auto;
    }
    
    .din8-a4-page {
      width: 210mm;
      height: auto;
      min-height: auto;
      padding: 20mm 15mm 15mm 15mm;
      position: relative;
      box-sizing: border-box;
      overflow: visible;
    }
    
    .din8-paper-info {
      text-align: center;
      margin: 10px 0;
      font-weight: normal;
    }
    
    /* Paper container */
    .din8-paper-container {
      position: relative;
    }
    
    /* Resize handle */
    .din8-resize-handle {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 10px;
      height: 10px;
      background-color: #007bff;
      cursor: nwse-resize;
      z-index: 10;
      border-radius: 50%;
      transition: transform 0.2s ease;
    }
    
    .din8-resize-handle:hover {
      transform: scale(1.5);
    }
    
    /* Improve image dragging visual feedback */
    .din8-question-image.dragging {
      opacity: 0.8;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    /* Animated resizing effect */
    .din8-question-image {
      transition: width 0.1s ease, height 0.1s ease;
    }
    
    /* Ensure images have proper space */
    .din8-question-image-container {
      margin: 15px 0;
      clear: both;
    }
    
    /* Move buttons directly below content with no gap */
    .din8-paper-actions {
      margin-top: 10px;
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px 0;
    }
    
    .din8-action-btn {
      padding: 8px 16px;
      margin: 0 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      transition: background-color 0.2s;
    }
    
    .din8-save-btn {
      background-color: #4caf50;
      color: white;
    }
    
    .din8-download-btn {
      background-color: #2196f3;
      color: white;
    }
    
    .din8-generate-btn {
      background-color: #ff9800;
      color: white;
    }
    
    .din8-approve-btn {
      background-color: #9c27b0;
      color: white;
    }
    
    .din8-action-btn:hover {
      opacity: 0.9;
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
            {/* Page content with auto height instead of fixed height */}
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
              
              <div className="din8-course-details din8-paper-info">
                This paper contains 3 parts
              </div>
              
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
                            loading="eager"
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
                            loading="eager"
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
                            loading="eager"
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
            </div>
          </div>
          
          {/* Action buttons immediately below the paper content */}
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

