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

  // State for total page count - we'll keep it simple with just one page initially
  const [totalPages, setTotalPages] = useState(1);

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

  // Improved content overflow detection that considers image states
  const checkContentOverflow = () => {
    setTimeout(() => {
      const paperContainer = document.querySelector('.din8-a4-paper');
      const firstPage = document.querySelector('.din8-a4-page');
      
      if (!paperContainer || !firstPage) return;
      
      // A4 size in pixels (approximate)
      const a4Height = 1123; // 297mm at 96dpi
      
      // Check if content overflows the first page
      if (firstPage.scrollHeight > a4Height) {
        // Calculate how many pages we need
        const totalContentHeight = firstPage.scrollHeight;
        const pagesNeeded = Math.ceil(totalContentHeight / a4Height);
        
        // Create additional pages if needed
        const existingPages = document.querySelectorAll('.din8-a4-page').length;
        if (existingPages < pagesNeeded) {
          // Remove any existing overflow pages
          const existingOverflowPages = document.querySelectorAll('.din8-overflow-page');
          existingOverflowPages.forEach(page => {
            if (page.parentNode) {
              page.parentNode.removeChild(page);
            }
          });
          
          // Create new pages as needed
          for (let i = existingPages; i < pagesNeeded; i++) {
            const newPage = document.createElement('div');
            newPage.className = 'din8-a4-page din8-overflow-page';
            
            // Add footer to new page
            const newFooter = document.createElement('div');
            newFooter.className = 'din8-page-footer';
            newFooter.textContent = `Page ${i + 1} of ${pagesNeeded}`;
            newPage.appendChild(newFooter);
            
            paperContainer.appendChild(newPage);
          }
          
          // Update total pages count
          setTotalPages(pagesNeeded);
          
          // Update paper info text
          const paperInfoText = document.querySelector('.din8-paper-info');
          if (paperInfoText) {
            paperInfoText.textContent = `This paper contains ${pagesNeeded} printed pages and 3 parts`;
          }
          
          // Update all page footers
          const pageFooters = paperContainer.querySelectorAll('.din8-page-footer');
          pageFooters.forEach((footer, index) => {
            footer.textContent = `Page ${index + 1} of ${pagesNeeded}`;
          });
          
          // Now distribute content across pages - improved algorithm
          balanceContentAcrossPages(paperContainer, pagesNeeded, a4Height);
        }
      } else {
        // No overflow, ensure we only have one page
        const extraPages = document.querySelectorAll('.din8-overflow-page');
        extraPages.forEach(page => {
          if (page.parentNode) {
            page.parentNode.removeChild(page);
          }
        });
        
        setTotalPages(1);
        
        // Update paper info text
        const paperInfoText = document.querySelector('.din8-paper-info');
        if (paperInfoText) {
          paperInfoText.textContent = 'This paper contains 1 printed page and 3 parts';
        }
        
        // Update page footer
        const pageFooter = document.querySelector('.din8-page-footer');
        if (pageFooter) {
          pageFooter.textContent = 'Page 1 of 1';
        }
      }
    }, 500); // Small delay to ensure content is rendered
  };

  // Improved function to distribute content across pages
  const balanceContentAcrossPages = (paperContainer, pagesNeeded, a4Height) => {
    const firstPage = document.querySelector('.din8-a4-page');
    const pages = paperContainer.querySelectorAll('.din8-a4-page');
    
    if (!firstPage || pages.length <= 1) return;
    
    // Get all question elements from the first page
    const allQuestions = Array.from(firstPage.querySelectorAll('.din8-question'));
    
    // Get all part elements
    const allParts = Array.from(firstPage.querySelectorAll('.din8-part-title, .din8-part-instructions, .din8-question-list'));
    
    // Keep track of which page we're currently filling
    let currentPageIndex = 0;
    let currentPageHeight = 0;
    const pageHeightLimit = a4Height - 50; // Leave some margin
    
    // Header content that should always stay on the first page
    const headerContent = firstPage.querySelector('.din8-university-header');
    const registrationBox = firstPage.querySelector('.din8-registration-box');
    const examInfo = firstPage.querySelector('.din8-exam-info');
    const paperInfo = firstPage.querySelector('.din8-paper-info');
    
    // Calculate header height
    let headerHeight = 0;
    if (headerContent) headerHeight += headerContent.offsetHeight;
    if (registrationBox) headerHeight += registrationBox.offsetHeight;
    if (examInfo) headerHeight += examInfo.offsetHeight;
    if (paperInfo) headerHeight += paperInfo.offsetHeight;
    
    currentPageHeight = headerHeight;
    
    // First, hide all content in overflow pages
    for (let i = 1; i < pages.length; i++) {
      const pageContent = pages[i].querySelectorAll('*:not(.din8-page-footer)');
      pageContent.forEach(el => {
        if (el !== pages[i] && !el.classList.contains('din8-page-footer')) {
          el.remove();
        }
      });
    }
    
    // Function to check if an element is a part title
    const isPartTitle = (element) => element.classList.contains('din8-part-title');
    const isPartInstructions = (element) => element.classList.contains('din8-part-instructions');
    
    // Now distribute content
    let currentPart = null;
    let partInstructions = null;
    
    allParts.forEach(element => {
      // Clone the element
      const clone = element.cloneNode(true);
      
      // Check if this is a part title
      if (isPartTitle(element)) {
        currentPart = clone;
        
        // If we're not on the first page, we need to add this part title to the current overflow page
        if (currentPageIndex > 0) {
          // Hide original
          element.style.display = 'none';
          
          // Add to current page
          pages[currentPageIndex].appendChild(clone);
          currentPageHeight += clone.offsetHeight;
        } else {
          // On first page, just measure height
          currentPageHeight += element.offsetHeight;
        }
      } 
      // Check if this is part instructions
      else if (isPartInstructions(element)) {
        partInstructions = clone;
        
        // If we're not on the first page, add these instructions too
        if (currentPageIndex > 0) {
          // Hide original
          element.style.display = 'none';
          
          // Add to current page
          pages[currentPageIndex].appendChild(clone);
          currentPageHeight += clone.offsetHeight;
        } else {
          // On first page, just measure height
          currentPageHeight += element.offsetHeight;
        }
      }
      // This is a question list
      else {
        // Get all questions in this list
        const questions = Array.from(element.querySelectorAll('.din8-question'));
        
        questions.forEach(question => {
          // Check if adding this question would overflow the current page
          const questionHeight = question.offsetHeight;
          
          if (currentPageHeight + questionHeight > pageHeightLimit) {
            // Move to next page
            currentPageIndex++;
            currentPageHeight = 0;
            
            // If this is the first element on a new page and we have a current part title,
            // add the part title and instructions first
            if (currentPart && !pages[currentPageIndex].querySelector('.din8-part-title')) {
              const partClone = currentPart.cloneNode(true);
              pages[currentPageIndex].appendChild(partClone);
              currentPageHeight += partClone.offsetHeight;
              
              if (partInstructions) {
                const instructionsClone = partInstructions.cloneNode(true);
                pages[currentPageIndex].appendChild(instructionsClone);
                currentPageHeight += instructionsClone.offsetHeight;
              }
            }
          }
          
          // If we're not on the first page, we need to move this question
          if (currentPageIndex > 0) {
            // Clone the question
            const questionClone = question.cloneNode(true);
            
            // Add event listeners to any replace buttons
            const replaceBtn = questionClone.querySelector('.din8-replace-btn');
            if (replaceBtn) {
              const questionId = question.id;
              const part = getPartFromQuestion(question);
              const unit = getUnitFromQuestion(question);
              const bloomLevel = getBloomLevelFromQuestion(question);
              
              replaceBtn.addEventListener('click', () => replaceQuestion(questionId, part, unit, bloomLevel));
            }
            
            // Add draggable functionality to images
            const images = questionClone.querySelectorAll('.din8-question-image');
            images.forEach(img => {
              initializeImageControls(img);
            });
            
            // Hide original
            question.style.display = 'none';
            
            // Add to current page
            pages[currentPageIndex].appendChild(questionClone);
          }
          
          // Update current page height
          currentPageHeight += questionHeight;
        });
      }
    });
  };
  
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
        
        // Dynamic reflow
        requestAnimationFrame(checkContentOverflow);
        
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
        
        // Dynamic reflow as the image is being resized
        requestAnimationFrame(checkContentOverflow);
      }
    };
    
    // Add the event listener to the document
    document.addEventListener('mousemove', handleMouseMove);
    
    // Mouse up (stop drag or resize)
    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
        
        // Final check for overflow
        checkContentOverflow();
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
      // Check for overflow and add image controls
      checkContentOverflow();
      addImageDragAndResize();
      
      // Add window resize listener
      window.addEventListener('resize', checkContentOverflow);
      
      // Clean up
      return () => {
        window.removeEventListener('resize', checkContentOverflow);
      };
    }
  }, [questions, showPaper]);
  
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
        
        // Check content overflow
        checkContentOverflow();
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
      
      // Check content overflow and add image controls after updating
      setTimeout(() => {
        addImageDragAndResize();
        checkContentOverflow();
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
        fetchQuestions
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
  const savePaper = () => {
    alert('Question paper has been saved successfully!');
  };
  
  // Improved PDF generation function with Word-like behavior for images and text flow
// Improved PDF generation function with proper layout
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
      
      // Function to add university logo
      const addLogo = async () => {
        return new Promise((resolve) => {
          // Try to load the university logo
          const logo = new Image();
          logo.crossOrigin = 'Anonymous';
          
          logo.onload = () => {
            try {
              // Calculate dimensions to maintain aspect ratio
              const imgWidth = 15; // Logo width in mm
              const imgHeight = (logo.height * imgWidth) / logo.width;
              
              // Create temporary canvas to convert image to data URL
              const canvas = document.createElement('canvas');
              canvas.width = logo.width;
              canvas.height = logo.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(logo, 0, 0);
              
              // Add logo to PDF at top center
              const x = (pageWidth - imgWidth) / 2 - 45; // Left of center
              pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, yPos, imgWidth, imgHeight);
              
              // Update yPos but don't add extra space since we'll position the header text
              // relative to the top of the page, not relative to the logo
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
        pdf.text(paperDetails.university, pageWidth/2, margin + 5, { align: 'center' });
        
        // Course details - start 10mm from top
        yPos = margin + 10;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${examDetails.course} - ${examDetails.semester} SEMESTER`, pageWidth/2, yPos, { align: 'center' });
        yPos += 5;
        
        pdf.text(`SEMESTER EXAMINATION: ${examDetails.semesterExamination}`, pageWidth/2, yPos, { align: 'center' });
        yPos += 5;
        
        pdf.text(`(Examination conducted in ${examDetails.examinationConducted})`, pageWidth/2, yPos, { align: 'center' });
        yPos += 5;
        
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${examDetails.subjectCode}: ${examDetails.subjectName}`, pageWidth/2, yPos, { align: 'center' });
        yPos += 5;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text("( For current batch students only )", pageWidth/2, yPos, { align: 'center' });
        yPos += 10;
        
        // Registration box - positioned correctly to the right
        const regBoxWidth = 50;
        const regBoxHeight = 15;
        const regBoxX = pageWidth - margin - regBoxWidth;
        const regBoxY = margin; // Top margin
        
        pdf.rect(regBoxX, regBoxY, regBoxWidth, regBoxHeight);
        pdf.setFontSize(9);
        pdf.text("Registration Number:", regBoxX + 2, regBoxY + 5);
        pdf.text("Date:", regBoxX + 2, regBoxY + 10);
        
        // Exam info
        yPos += 5;
        pdf.setFontSize(10);
        pdf.text(`Time: ${examDetails.examTimings}`, margin, yPos);
        pdf.text(`Max Marks: ${paperDetails.maxMarks}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 8;
        
        // Paper info
        pdf.setFont('helvetica', 'italic');
        const totalPages = Math.max(
          1, 
          Math.ceil((questionsPartA.length + questionsPartB.length + questionsPartC.length + 20) / 15)
        );
        pdf.text(`This paper contains ${totalPages} printed pages and 3 parts`, pageWidth/2, yPos, { align: 'center' });
        yPos += 10;
      };
      
      // Function to check if we need a new page
      const checkPageBreak = (neededSpace) => {
        if (yPos + neededSpace > pageHeight - margin) {
          pdf.addPage();
          currentPage++;
          yPos = margin;
          
          // Add minimal header for continuation pages - just the subject code
          if (currentPage > 1) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${examDetails.subjectCode}: ${examDetails.subjectName}`, pageWidth/2, yPos, { align: 'center' });
            yPos += 8;
          }
          
          return true;
        }
        return false;
      };
      
      // Function to render images in PDF
      const addImage = async (imageUrl, maxWidth) => {
        // Check if we have enough space for a small image
        if (checkPageBreak(40)) {
          // We moved to a new page, recalculate space
        }
        
        try {
          // Create an image element to load the image
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = () => {
              // Calculate dimensions to fit within maximum width
              const imgWidth = Math.min(img.width, contentWidth);
              const imgHeight = (img.height * imgWidth) / img.width;
              
              // Check if we need a page break for this image
              if (yPos + imgHeight > pageHeight - margin) {
                pdf.addPage();
                currentPage++;
                yPos = margin;
                
                // Add minimal header for continuation pages
                pdf.setFontSize(10);
                pdf.setFont('helvetica', 'bold');
                pdf.text(`${examDetails.subjectCode}: ${examDetails.subjectName}`, pageWidth/2, yPos, { align: 'center' });
                yPos += 8;
              }
              
              // Add the image
              const x = margin + (contentWidth - imgWidth) / 2; // Center the image
              try {
                // Create canvas to ensure proper image format
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                
                // Add image to PDF
                pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', x, yPos, imgWidth, imgHeight);
                yPos += imgHeight + 5; // Add space after image
                resolve();
              } catch (err) {
                console.error('Failed to add image to PDF:', err);
                yPos += 10; // Still add some space even if image fails
                resolve();
              }
            };
            
            img.onerror = () => {
              console.error('Failed to load image:', imageUrl);
              yPos += 10; // Add some space
              resolve(); // Continue without the image
            };
            
            img.src = imageUrl;
          });
        } catch (err) {
          console.error('Error processing image:', err);
          yPos += 10; // Add some space anyway
          return Promise.resolve(); // Return a resolved promise to continue
        }
      };
      
      // Add first page header
      addPageHeader().then(async () => {
        // Process parts
        const renderPart = async (partTitle, instructions, questionsList, startNumber) => {
          // Ensure questionsList is an array
          const questions = Array.isArray(questionsList) ? questionsList : [];
          
          if (questions.length === 0) {
            // If no questions, just add the part title and a message
            checkPageBreak(15);
            
            pdf.setFontSize(11);
            pdf.setFont('helvetica', 'bold');
            pdf.text(partTitle, pageWidth/2, yPos, { align: 'center' });
            yPos += 6;
            
            // Add part instructions
            pdf.setFontSize(10);
            pdf.text(instructions[0], margin, yPos);
            pdf.text(instructions[1], pageWidth - margin, yPos, { align: 'right' });
            yPos += 6;
            
            pdf.setFont('helvetica', 'italic');
            pdf.text("No questions available for this part", margin, yPos);
            yPos += 6;
            
            return Promise.resolve();
          }
          
          // Add part title - check for page break
          checkPageBreak(20);
          
          pdf.setFontSize(11);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, pageWidth/2, yPos, { align: 'center' });
          yPos += 6;
          
          // Add part instructions
          pdf.setFontSize(10);
          pdf.text(instructions[0], margin, yPos);
          pdf.text(instructions[1], pageWidth - margin, yPos, { align: 'right' });
          yPos += 6;
          
          // Add questions
          pdf.setFont('helvetica', 'normal');
          
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            
            // Ensure question has properties
            if (!question || typeof question !== 'object') {
              console.warn('Invalid question object at index', i, 'in', partTitle);
              continue;
            }
            
            // Check if we need a page break for this question - reduced space estimate
            const questionText = question.question || "No question text available";
            const estimatedQuestionHeight = 10 + (questionText.length / 150) * 5;
            checkPageBreak(estimatedQuestionHeight);
            
            // Question number and text - reduced spacing
            const questionNumber = `${startNumber + i}.`;
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(questionNumber, margin, yPos);
            
            // Handle multi-line question text with reduced spacing
            const textLines = pdf.splitTextToSize(questionText, contentWidth - 10);
            pdf.text(textLines, margin + 7, yPos);
            
            // Move Y position down based on number of lines - reduced spacing
            yPos += 4 * textLines.length + 4;
            
            // Add image if available
            if (question.hasImage && question.imageUrl) {
              await addImage(question.imageUrl, contentWidth - 20);
            } else {
              // No image - add smaller space between questions
              yPos += 3;
            }
          }
          
          // Add smaller extra space after part
          yPos += 5;
          
          return Promise.resolve();
        };

        // Determine starting numbers for each part
        const partAStartNumber = 1;
        const partBStartNumber = partAStartNumber + questionsPartA.length;
        const partCStartNumber = partBStartNumber + questionsPartB.length;
        
        // Chain the rendering of each part
        await renderPart(
          'PART-A', 
          ['Answer all FIVE questions', '(2 X 5 = 10)'], 
          questionsPartA,
          partAStartNumber
        );
        
        await renderPart(
          'PART-B', 
          ['Answer any FIVE questions', '(4 X 5 = 20)'], 
          questionsPartB,
          partBStartNumber
        );
        
        await renderPart(
          'PART-C', 
          ['Answer any THREE questions', '(10 X 3 = 30)'], 
          questionsPartC,
          partCStartNumber
        );
        
        // Add page numbers to all pages
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 10);
        }
        
        // Save the PDF
        pdf.save('Question_Paper.pdf');
        
        // Remove loading overlay
        document.body.removeChild(loadingOverlay);
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
    
    .din8-a4-paper {
      background-color: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      margin: 20px auto;
      position: relative;
    }
    
    .din8-a4-page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 15mm;
      position: relative;
      box-sizing: border-box;
      overflow: visible;
      page-break-after: always;
    }
    
    .din8-page-footer {
      position: absolute;
      bottom: 10mm;
      left: 0;
      width: 100%;
      text-align: center;
      font-size: 10pt;
      color: #888;
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
    
    /* Overflow page styles */
    .din8-overflow-page {
      margin-top: 20px;
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
    
    /* Style for questions that have moved to a new page */
    .din8-overflow-page .din8-question {
      page-break-inside: avoid;
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
              
              <div className="din8-course-details din8-paper-info">
                This paper contains {totalPages} printed {totalPages === 1 ? 'page' : 'pages'} and 3 parts
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
              
              <div className="din8-page-footer">Page 1 of {totalPages}</div>
            </div>
            
            {/* Additional pages will be created dynamically by the checkContentOverflow function */}
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