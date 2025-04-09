import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreatePapers.css';

const CreatePapers = () => {
  // Reference for printing
  const componentRef = useRef();
  
  // For navigation
  const navigate = useNavigate();
  
  // Get exam configuration from router state
  const location = useLocation();
  const { examConfig, questionDistribution, paperDetails: loadedPaperDetails, editMode: loadedEditMode } = location.state || {};
  
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
  
  // State to track if this is a new paper or an existing one
  const [paperId, setPaperId] = useState(null);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State to control whether to show the paper
  const [showPaper, setShowPaper] = useState(false);
  
  // State to disable replace buttons
  const [disableReplaceButtons, setDisableReplaceButtons] = useState(false);
  
  // State for loading indicator
  const [loading, setLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState(null);

  // State to track resized images and their dimensions
  const [imageStates, setImageStates] = useState({});

  // State to control modal visibility
  const [showModal, setShowModal] = useState(false);
  
  // Helper function to get creator name consistently throughout the component
  const getCreatorName = () => {
    let creatorName = "Unknown";
    
    try {
      const userJSON = sessionStorage.getItem('user');
      
      if (userJSON) {
        const user = JSON.parse(userJSON);
        
        if (user && user.username) {
          creatorName = user.username;
        }
        
        if (creatorName === "Unknown") {
          if (user.name) creatorName = user.name;
          else if (user.fullName) creatorName = user.fullName;
          else if (user.displayName) creatorName = user.displayName;
          else if (user.email) creatorName = user.email.split('@')[0];
        }
        
        console.log("User data found:", user);
        console.log("Using creator name:", creatorName);
      } else {
        console.warn("No user data found in sessionStorage");
      }
      
      return creatorName;
    } catch (error) {
      console.error("Error getting creator name:", error);
      return "Unknown";
    }
  };
  
  // Helper function to get authenticated axios config
  const getAuthConfig = () => {
    return {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    };
  };

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
  
  // Load paper details from location state if available
  useEffect(() => {
    if (location.state) {
      if (loadedPaperDetails) {
        if (loadedPaperDetails._id) {
          setPaperId(loadedPaperDetails._id);
        }
        
        if (loadedPaperDetails.examDetails) {
          setExamDetails(loadedPaperDetails.examDetails);
        }
        
        if (loadedPaperDetails.paperStructure && loadedPaperDetails.paperStructure.parts) {
          const partA = loadedPaperDetails.paperStructure.parts.find(p => p.partId === 'A')?.questions || [];
          const partB = loadedPaperDetails.paperStructure.parts.find(p => p.partId === 'B')?.questions || [];
          const partC = loadedPaperDetails.paperStructure.parts.find(p => p.partId === 'C')?.questions || [];
          
          setQuestions({
            partA: partA.map(q => ({
              _id: q.questionId,
              question: q.questionText,
              questionNumber: q.questionNumber,
              hasImage: q.hasImage,
              imageUrl: q.imageUrl,
              unit: q.unit,
              bloomLevel: q.bloomLevel,
              marks: q.marks
            })),
            partB: partB.map(q => ({
              _id: q.questionId,
              question: q.questionText,
              questionNumber: q.questionNumber,
              hasImage: q.hasImage,
              imageUrl: q.imageUrl,
              unit: q.unit,
              bloomLevel: q.bloomLevel,
              marks: q.marks
            })),
            partC: partC.map(q => ({
              _id: q.questionId,
              question: q.questionText,
              questionNumber: q.questionNumber,
              hasImage: q.hasImage,
              imageUrl: q.imageUrl,
              unit: q.unit,
              bloomLevel: q.bloomLevel,
              marks: q.marks
            }))
          });
          
          if (loadedPaperDetails.imageStates) {
            setImageStates(loadedPaperDetails.imageStates);
          }
        }
        
        if (loadedEditMode) {
          setIsEditMode(true);
        }
        
        if (loadedEditMode) {
          setDisableReplaceButtons(true);
        }
        
        setShowPaper(true);
      }
    }
  }, [location.state, loadedPaperDetails, loadedEditMode]);
  
  // Helper function to map bloom levels between UI and API
  const mapBloomLevel = (level) => {
    const bloomMap = {
      1: 'Remember L1',
      2: 'Apply L2',
      3: 'Evaluate L3'
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
    return 1;
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
    
    img.setAttribute('data-initialized', 'true');
    
    const container = img.closest('.din8-question-image-container');
    if (!container) return;
    
    container.style.position = 'relative';
    container.style.minHeight = '50px';
    
    img.style.position = 'relative';
    img.style.cursor = 'move';
    img.style.maxWidth = '100%';
    img.style.border = '1px solid #ddd';
    img.style.borderRadius = '4px';
    img.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    
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
    
    let isDragging = false;
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;
    let imgId = img.src.split('/').pop().split('.')[0];
    
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
    
    if (imageStates[imgId]) {
      img.style.width = `${imageStates[imgId].width}px`;
      img.style.height = `${imageStates[imgId].height}px`;
      img.style.left = `${imageStates[imgId].left}px`;
      img.style.top = `${imageStates[imgId].top}px`;
    }
    
    img.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = parseInt(img.style.left || '0');
      startTop = parseInt(img.style.top || '0');
      e.preventDefault();
    });
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = img.offsetWidth;
      startHeight = img.offsetHeight;
      e.preventDefault();
    });
    
    const handleMouseMove = (e) => {
      if (isDragging) {
        const newLeft = startLeft + (e.clientX - startX);
        const newTop = startTop + (e.clientY - startY);
        
        img.style.left = `${newLeft}px`;
        img.style.top = `${newTop}px`;
        
        setImageStates(prev => ({
          ...prev,
          [imgId]: {
            ...prev[imgId],
            left: newLeft,
            top: newTop
          }
        }));
        
      } else if (isResizing) {
        const aspectRatio = startHeight / startWidth;
        const newWidth = Math.max(50, startWidth + (e.clientX - startX));
        const newHeight = Math.max(50, newWidth * aspectRatio);
        
        img.style.width = `${newWidth}px`;
        img.style.height = `${newHeight}px`;
        
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
    
    document.addEventListener('mousemove', handleMouseMove);
    
    const handleMouseUp = () => {
      if (isDragging || isResizing) {
        isDragging = false;
        isResizing = false;
      }
    };
    
    document.addEventListener('mouseup', handleMouseUp);
    
    const cleanUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    img._cleanup = cleanUp;
  };
  
  const addImageDragAndResize = () => {
    setTimeout(() => {
      const images = document.querySelectorAll('.din8-question-image');
      images.forEach(img => initializeImageControls(img));
    }, 500);
  };
  
  useEffect(() => {
    return () => {
      const images = document.querySelectorAll('.din8-question-image');
      images.forEach(img => {
        if (img._cleanup) img._cleanup();
      });
    };
  }, []);
  
  useEffect(() => {
    if (showPaper) {
      addImageDragAndResize();
    }
  }, [questions, showPaper]);
  
  const handleQuestionEdit = (part, index, updatedText) => {
    const updatedQuestions = { ...questions };
    
    if (part === 'A') {
      updatedQuestions.partA[index].question = updatedText;
    } else if (part === 'B') {
      updatedQuestions.partB[index].question = updatedText;
    } else if (part === 'C') {
      updatedQuestions.partC[index].question = updatedText;
    }
    
    setQuestions(updatedQuestions);
  };

  const updateQuestionOnServer = async (part, questionId, updatedText) => {
    if (!paperId) return;
    
    try {
      await axios.put(`/api/endpapers/${paperId}/parts/${part}/questions/${questionId}`, {
        questionText: updatedText
      }, getAuthConfig());
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };
  
  const fetchQuestions = async () => {
    if (!examDetails.subjectCode) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const partAQuestions = [];
      const partBQuestions = [];
      const partCQuestions = [];
      
      if (examConfig && questionDistribution) {
        for (const part of examConfig.parts) {
          const partId = part.id;
          
          for (let unitIndex = 0; unitIndex < part.questionsByUnit.length; unitIndex++) {
            const unitId = unitIndex + 1;
            const questionsNeeded = part.questionsByUnit[unitIndex];
            
            if (questionsNeeded > 0 && examConfig.units[unitIndex].enabled) {
              for (let bloomIndex = 0; bloomIndex < part.questionsByBloom.length; bloomIndex++) {
                const bloomId = bloomIndex + 1;
                const bloomQuestionsNeeded = part.questionsByBloom[bloomIndex];
                
                if (bloomQuestionsNeeded > 0 && examConfig.blooms[bloomIndex].enabled) {
                  let questionsForThisBloom = Math.ceil(questionsNeeded * (bloomQuestionsNeeded / part.maxQuestions));
                  
                  const response = await axios.get('/api/endsem-questions', {
                    params: {
                      subjectCode: examDetails.subjectCode,
                      part: partId,
                      unit: unitId.toString(),
                      bloomLevel: mapBloomLevel(bloomId)
                    },
                    headers: getAuthConfig().headers
                  });
                  
                  const availableQuestions = response.data.questions || [];
                  
                  if (availableQuestions.length === 0) {
                    console.warn(`No questions found for part ${partId}, unit ${unitId}, bloom level ${bloomId}`);
                    continue;
                  }
                  
                  const fetchCount = Math.min(availableQuestions.length, questionsForThisBloom);
                  const selectedQuestions = shuffleArray(availableQuestions).slice(0, fetchCount);
                  
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
        
        const limitedPartA = partAQuestions.slice(0, examConfig.parts.find(p => p.id === 'A').maxQuestions);
        const limitedPartB = partBQuestions.slice(0, examConfig.parts.find(p => p.id === 'B').maxQuestions);
        const limitedPartC = partCQuestions.slice(0, examConfig.parts.find(p => p.id === 'C').maxQuestions);
        
        setQuestions({
          partA: limitedPartA,
          partB: limitedPartB,
          partC: limitedPartC
        });
        
        if (
          limitedPartA.length < examConfig.parts.find(p => p.id === 'A').maxQuestions ||
          limitedPartB.length < examConfig.parts.find(p => p.id === 'B').maxQuestions ||
          limitedPartC.length < examConfig.parts.find(p => p.id === 'C').maxQuestions
        ) {
          setError("Warning: Not enough questions available in the database for some sections.");
        }
      } else {
        for (const partId of ['A', 'B', 'C']) {
          const response = await axios.get('/api/endsem-questions', {
            params: {
              subjectCode: examDetails.subjectCode,
              part: partId
            },
            headers: getAuthConfig().headers
          });
          
          const availableQuestions = response.data.questions || [];
          
          if (partId === 'A') {
            partAQuestions.push(...availableQuestions.slice(0, 5));
          } else if (partId === 'B') {
            partBQuestions.push(...availableQuestions.slice(0, 7));
          } else if (partId === 'C') {
            partCQuestions.push(...availableQuestions.slice(0, 4));
          }
        }
        
        setQuestions({
          partA: partAQuestions,
          partB: partBQuestions,
          partC: partCQuestions
        });
        
        setError("Warning: Using fallback question loading as exam configuration is not available.");
      }
      
      setShowPaper(true);
      setImageStates({});
      
      setTimeout(() => {
        const paperElement = document.getElementById('din8-paper-container');
        if (paperElement) {
          paperElement.scrollIntoView({ behavior: 'smooth' });
        }
        addImageDragAndResize();
      }, 300);
    } catch (error) {
      console.error('Error fetching questions:', error);
      setError(`Error fetching questions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const replaceQuestion = async (questionId, part, unit, bloomLevel) => {
    try {
      setLoading(true);
      
      const bloomLevelNumber = typeof bloomLevel === 'number' 
        ? bloomLevel 
        : getBloomLevelNumber(bloomLevel);
      
      const response = await axios.get('/api/endsem-questions', {
        params: {
          subjectCode: examDetails.subjectCode,
          part: part,
          unit: unit.toString(),
          bloomLevel: mapBloomLevel(bloomLevelNumber)
        },
        headers: getAuthConfig().headers
      });
      
      const availableQuestions = response.data.questions || [];
      const filteredQuestions = availableQuestions.filter(q => q._id !== questionId);
      
      if (filteredQuestions.length === 0) {
        alert("No alternative questions available for this section. Try refreshing the page or adding more questions to the database.");
        setLoading(false);
        return;
      }
      
      const replacementQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
      
      const updatedQuestions = { ...questions };
      
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
      
      setQuestions(updatedQuestions);
      
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
  
  const randomizeQuestions = async () => {
    try {
      setLoading(true);
      
      const existingQuestions = {
        partA: [...questions.partA],
        partB: [...questions.partB],
        partC: [...questions.partC]
      };
      
      const shuffledQuestions = {
        partA: shuffleArray(existingQuestions.partA),
        partB: shuffleArray(existingQuestions.partB),
        partC: shuffleArray(existingQuestions.partC)
      };
      
      setQuestions(shuffledQuestions);
      setImageStates({});
      
      setTimeout(() => {
        fetchQuestions()
      }, 300);
      
    } catch (error) {
      console.error('Error randomizing questions:', error);
      alert('There was an error randomizing the questions. Please try again.');
      setLoading(false);
    }
  };
  
  const savePaper = async () => {
    try {
      const requiredPartAQuestions = 5;
      const requiredPartBQuestions = 7;
      const requiredPartCQuestions = 4;
      
      if (questions.partA.length < requiredPartAQuestions) {
        setError(`Not enough questions in Part A. Need ${requiredPartAQuestions}, but have ${questions.partA.length}.`);
        setTimeout(() => {
          const errorElement = document.querySelector('.din8-error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
      
      if (questions.partB.length < requiredPartBQuestions) {
        setError(`Not enough questions in Part B. Need ${requiredPartBQuestions}, but have ${questions.partB.length}.`);
        setTimeout(() => {
          const errorElement = document.querySelector('.din8-error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
      
      if (questions.partC.length < requiredPartCQuestions) {
        setError(`Not enough questions in Part C. Need ${requiredPartCQuestions}, but have ${questions.partC.length}.`);
        setTimeout(() => {
          const errorElement = document.querySelector('.din8-error-message');
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
      
      setError(null);
      setLoading(true);
      
      const creatorName = getCreatorName();
      
      const processedQuestions = {
        partA: questions.partA.map((q, index) => ({
          questionId: q._id,
          questionNumber: index + 1,
          questionText: q.question || q.questionText,
          hasImage: q.hasImage || false,
          imageUrl: q.imageUrl || null,
          imageState: imageStates[q.imageUrl?.split('/').pop()?.split('.')[0]] || null,
          unit: q.unit || 1,
          bloomLevel: q.bloomLevel || 'Remember L1',
          marks: q.marks || 2,
          part: 'A'
        })),
        partB: questions.partB.map((q, index) => ({
          questionId: q._id,
          questionNumber: index + 6,
          questionText: q.question || q.questionText,
          hasImage: q.hasImage || false,
          imageUrl: q.imageUrl || null,
          imageState: imageStates[q.imageUrl?.split('/').pop()?.split('.')[0]] || null,
          unit: q.unit || 1,
          bloomLevel: q.bloomLevel || 'Apply L2',
          marks: q.marks || 4,
          part: 'B'
        })),
        partC: questions.partC.map((q, index) => ({
          questionId: q._id,
          questionNumber: index + questions.partB.length + 6,
          questionText: q.question || q.questionText,
          hasImage: q.hasImage || false,
          imageUrl: q.imageUrl || null,
          imageState: imageStates[q.imageUrl?.split('/').pop()?.split('.')[0]] || null,
          unit: q.unit || 1,
          bloomLevel: q.bloomLevel || 'Evaluate L3',
          marks: q.marks || 10,
          part: 'C'
        }))
      };
      
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
        metadata: {
          creatorName: creatorName,
          status: 'Draft'
        },
        status: 'Draft',
        paperStructure: {
          totalPages: 2,
          parts: [
            {
              partId: 'A',
              partTitle: 'PART-A',
              instructions: ['Answer all FIVE questions', '(2 X 5 = 10)'],
              marksFormat: '(2 X 5 = 10)',
              questions: processedQuestions.partA
            },
            {
              partId: 'B',
              partTitle: 'PART-B',
              instructions: ['Answer any FIVE questions', '(4 X 5 = 20)'],
              marksFormat: '(4 X 5 = 20)',
              questions: processedQuestions.partB
            },
            {
              partId: 'C',
              partTitle: 'PART-C',
              instructions: ['Answer any THREE questions', '(10 X 3 = 30)'],
              marksFormat: '(10 X 3 = 30)',
              questions: processedQuestions.partC
            }
          ]
        },
        imageStates: imageStates,
        layout: {
          paperSize: 'A4',
          marginTop: 20,
          marginRight: 15,
          marginBottom: 20,
          marginLeft: 15,
          headerHeight: 60,
          footerHeight: 20
        }
      };
      
      let response;
      
      if (paperId) {
        response = await axios.put(`/api/endpapers/${paperId}`, paperData, getAuthConfig());
        
      } else {
        response = await axios.post('/api/endpapers', paperData, getAuthConfig());
        if (response.data && response.data.paper && response.data.paper._id) {
          setPaperId(response.data.paper._id);
        }
        
      }
      
      setIsEditMode(true);
      setDisableReplaceButtons(true);
      
      // Show the modal instead of alert
      setShowModal(true);
      
    } catch (error) {
      console.error('Error saving paper:', error);
      alert(`Failed to save paper: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadPaper = () => {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'din8-loading-overlay';
    loadingOverlay.innerHTML = '<div class="din8-loading-spinner"></div><div style="margin-top: 20px;">Generating PDF...</div>';
    document.body.appendChild(loadingOverlay);
    
    const jsPDFScript = document.createElement('script');
    jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    jsPDFScript.async = true;
    document.body.appendChild(jsPDFScript);
    
    const checkLibrariesLoaded = () => {
      if (window.jspdf && window.jspdf.jsPDF) {
        generatePDF();
      } else {
        setTimeout(checkLibrariesLoaded, 100);
      }
    };
    
    jsPDFScript.onload = checkLibrariesLoaded;
    
    const generatePDF = () => {
      try {
        const { jsPDF } = window.jspdf;
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });
        
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);
        
        const paperDetails = {
          university: paperDetails.university,
          maxMarks: paperDetails.maxMarks
        };
        
        let yPos = margin;
        let currentPage = 1;
        
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.1);
        const boxWidth = 50;
        const boxHeight = 15;
        const boxX = pageWidth - boxWidth - 5;
        const boxY = margin;
        pdf.rect(boxX, boxY, boxWidth, boxHeight);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text("Registration Number:", boxX + 2, boxY + 5);
        pdf.text("Date:", boxX + 2, boxY + 11);
        
        const addLogo = async () => {
          return new Promise((resolve) => {
            const logo = new Image();
            logo.crossOrigin = 'Anonymous';
            
            logo.onload = () => {
              try {
                const imgWidth = 30;
                const imgHeight = 30;
                
                const canvas = document.createElement('canvas');
                canvas.width = logo.width;
                canvas.height = logo.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(logo, 0, 0);
                
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
            
            logo.src = '/SJU.png';
            
            setTimeout(() => {
              if (!logo.complete) {
                console.warn('Logo loading timed out');
                resolve();
              }
            }, 2000);
          });
        };
        
        const addPageHeader = async () => {
          await addLogo();
          
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(paperDetails.university, pageWidth/2, margin + 7, { align: 'center' });
          
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
          
          pdf.setFontSize(10);
          pdf.text(`Time: ${examDetails.examTimings}`, margin, yPos);
          pdf.text(`Max Marks: ${paperDetails.maxMarks}`, pageWidth - margin, yPos, { align: 'right' });
          yPos += 6;
          
          const totalPages = 2;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(`This paper contains ${totalPages} printed pages and 3 parts`, pageWidth/2, yPos, { align: 'center' });
          yPos += 10;
        };
        
        const checkPageBreak = (neededSpace) => {
          if (yPos + neededSpace > pageHeight - margin) {
            pdf.addPage();
            currentPage++;
            yPos = margin;
            return true;
          }
          return false;
        };
        
        const renderPartAB = (partTitle, instructions, questionsList, startNumber) => {
          checkPageBreak(15);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, margin, yPos);
          yPos += 8;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          for (const instruction of instructions) {
            pdf.text(instruction, margin, yPos);
            yPos += 5;
          }
          yPos += 5;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          questionsList.forEach((question, index) => {
            const questionNumber = startNumber + index;
            
            checkPageBreak(15);
            
            const questionText = `${questionNumber}. ${question.questionText || question.question}`;
            const textLines = pdf.splitTextToSize(questionText, contentWidth);
            const textHeight = textLines.length * 5;
            
            if (checkPageBreak(textHeight + 10)) {
              yPos = margin;
            }
            
            pdf.text(textLines, margin, yPos);
            yPos += textHeight + 8;
            
            if (question.hasImage && question.imageUrl) {
              yPos += 10;
            }
          });
        };
        
        const renderPartC = (partTitle, instructions, questionsList, startNumber) => {
          checkPageBreak(15);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, margin, yPos);
          yPos += 8;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          for (const instruction of instructions) {
            pdf.text(instruction, margin, yPos);
            yPos += 5;
          }
          yPos += 5;
          
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          questionsList.forEach((question, index) => {
            const questionNumber = startNumber + index;
            
            checkPageBreak(15);
            
            const questionText = `${questionNumber}. ${question.questionText || question.question}`;
            const textLines = pdf.splitTextToSize(questionText, contentWidth);
            const textHeight = textLines.length * 5;
            
            if (checkPageBreak(textHeight + 10)) {
              yPos = margin;
            }
            
            pdf.text(textLines, margin, yPos);
            yPos += textHeight + 8;
            
            if (question.hasImage && question.imageUrl) {
              yPos += 10;
            }
          });
        };
        
        addPageHeader().then(() => {
          try {
            renderPartAB(
              'PART-A', 
              ['Answer all FIVE questions', '(2 X 5 = 10)'], 
              questions.partA,
              1
            );
            
            renderPartAB(
              'PART-B', 
              ['Answer any FIVE questions', '(4 X 5 = 20)'],
              questions.partB,
              questions.partA.length + 1
            );
            
            yPos += 5;
            
            renderPartC(
              'PART-C', 
              ['Answer any THREE questions', '(10 X 3 = 30)'],
              questions.partC,
              questions.partA.length + questions.partB.length + 1
            );
            
            const sanitizedSubjectName = examDetails.subjectName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
            pdf.save(`${examDetails.subjectCode}_${sanitizedSubjectName}_Question_Paper.pdf`);
            
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
  
  useEffect(() => {
    if (!paperId && !isEditMode) {
      fetchQuestions();
    }
  }, [examDetails.subjectCode, paperId, isEditMode]);
  
  const handleBackClick = () => {
    navigate(-1);
  };

  // Function to close the modal
  const handleModalClose = () => {
    setShowModal(false);
  };

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
    
    .din8-paper-container {
      position: relative;
    }
    
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
    
    .din8-question-image.dragging {
      opacity: 0.8;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .din8-question-image {
      transition: width 0.1s ease, height 0.1s ease;
    }
    
    .din8-question-image-container {
      margin: 15px 0;
      clear: both;
    }
    
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
    
    .din8-editable-question-text {
      cursor: text;
      border: 1px solid transparent;
      padding: 5px;
      border-radius: 4px;
      transition: background-color 0.2s, border-color 0.2s;
      flex-grow: 1;
    }
    
    .din8-editable-question-text:hover {
      background-color: #f0f0f0;
    }
    
    .din8-editable-question-text:focus {
      outline: none;
      border-color: #007bff;
      background-color: #f8f8f8;
    }

    /* Modal Styles */
    .din8-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }

    .din8-modal {
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      width: 300px;
      text-align: center;
    }

    .din8-modal-title {
      font-size: 18px;
      margin-bottom: 15px;
      color: #333;
    }

    .din8-modal-btn {
      padding: 8px 16px;
      background-color: #4caf50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .din8-modal-btn:hover {
      background-color: #45a049;
    }
  `;
  
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = additionalStyles;
    document.head.appendChild(styleElement);
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
      <div className="din8-header">
        <h1 className="din8-main-title">Question Paper Generator</h1>
        <button className="din8-back-btn" onClick={handleBackClick}>
          <span className="din8-arrow">←</span> Back
        </button>
      </div>
      
      {error && (
        <div className="din8-error-message">
          {error}
        </div>
      )}
      
      {showPaper && (
        <div className="din8-paper-container" id="din8-paper-container">
          <div className="din8-a4-paper" ref={componentRef}>
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
                      {isEditMode ? (
                        <span
                          className="din8-editable-question-text"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            handleQuestionEdit('A', index, e.target.innerText);
                            updateQuestionOnServer('A', question._id, e.target.innerText);
                          }}
                        >
                          {question.question}
                        </span>
                      ) : (
                        <span className="din8-question-text">{question.question}</span>
                      )}
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
                      {!disableReplaceButtons && (
                        <button 
                          className="din8-replace-btn" 
                          onClick={() => replaceQuestion(question._id, 'A', question.unit, getBloomLevelNumber(question.bloomLevel))}
                        >
                          Replace
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part A</div>
                )}
              </div>
              
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
                      {isEditMode ? (
                        <span
                          className="din8-editable-question-text"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            handleQuestionEdit('B', index, e.target.innerText);
                            updateQuestionOnServer('B', question._id, e.target.innerText);
                          }}
                        >
                          {question.question}
                        </span>
                      ) : (
                        <span className="din8-question-text">{question.question}</span>
                      )}
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
                      {!disableReplaceButtons && (
                        <button 
                          className="din8-replace-btn" 
                          onClick={() => replaceQuestion(question._id, 'B', question.unit, getBloomLevelNumber(question.bloomLevel))}
                        >
                          Replace
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part B</div>
                )}
              </div>
              
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
                      {isEditMode ? (
                        <span
                          className="din8-editable-question-text"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            handleQuestionEdit('C', index, e.target.innerText);
                            updateQuestionOnServer('C', question._id, e.target.innerText);
                          }}
                        >
                          {question.question}
                        </span>
                      ) : (
                        <span className="din8-question-text">{question.question}</span>
                      )}
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
                      {!disableReplaceButtons && (
                        <button 
                          className="din8-replace-btn" 
                          onClick={() => replaceQuestion(question._id, 'C', question.unit, getBloomLevelNumber(question.bloomLevel))}
                        >
                          Replace
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part C</div>
                )}
              </div>
            </div>
          </div>
          
          {!isEditMode && (
            <div className="din8-paper-actions">
              <button className="din8-action-btn din8-save-btn" onClick={savePaper}>
                Save Paper
              </button>
              <button className="din8-action-btn din8-generate-btn" onClick={randomizeQuestions}>
                Randomize Questions
              </button>
            </div>
          )}
          {isEditMode && (
            <div className="din8-paper-actions">
              <button className="din8-action-btn din8-save-btn" onClick={savePaper}>
                Update Paper
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="din8-modal-overlay">
          <div className="din8-modal">
            <div className="din8-modal-title">
              {paperId ? "Question Paper Saved" : "Question Paper Saved"}
            </div>
            <button className="din8-modal-btn" onClick={handleModalClose}>
              Okay
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatePapers;