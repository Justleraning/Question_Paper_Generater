import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Edit, Trash2, Eye, Send, Calendar, AlertTriangle, ArrowLeft, Printer, Filter, User } from 'lucide-react';
import axios from 'axios';

// Helper function to check if a paper can be submitted for approval
const canSubmitForApproval = (paper) => {
  console.log("Checking if paper can be submitted:", paper);
  
  // Check if paper exists
  if (!paper || !paper._id) {
    console.log("Paper is missing or has no ID");
    return { 
      canSubmit: false, 
      reason: "Invalid paper data" 
    };
  }
  
  // Check paper status - using lowercase for case-insensitive comparison
  const status = (paper.status || '').toLowerCase();
  if (status !== 'draft' && status !== 'rejected' && status !== 'submitted') {
    console.log(`Paper has invalid status: ${paper.status}`);
    
    // Special message if paper is already submitted
    if (status === 'submitted') {
      return {
        canSubmit: false,
        reason: "This paper has already been submitted for approval."
      };
    }
    
    return { 
      canSubmit: false, 
      reason: `Cannot submit papers with status '${paper.status}'. Only papers in draft or rejected status can be submitted.` 
    };
  }
  
  // If status is already "submitted", prevent resubmission
  if (status === 'submitted') {
    console.log("Paper is already submitted");
    return {
      canSubmit: false,
      reason: "This paper has already been submitted for approval."
    };
  }
  
  // If we made it here, paper can be submitted
  return { 
    canSubmit: true, 
    reason: null 
  };
};

// Main EndSemSide Component
export function EndSemSide() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // State for view mode
  const [previewingPaper, setPreviewingPaper] = useState(null);
  const [showPaper, setShowPaper] = useState(false);
  const componentRef = useRef();

  // State for filters
  const [filters, setFilters] = useState({
    semester: '',
    subjectCode: '',
    status: ''
  });

  // Unique semesters from papers
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueSubjectCodes, setUniqueSubjectCodes] = useState([]);

  // Add enhanced styles to the page
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Enhanced End Semester Papers Stylesheet */
      
      /* Reset and Base Styles */
      :root {
        --primary: #4f46e5;
        --primary-light: #818cf8;
        --primary-dark: #3730a3;
        --secondary: #0ea5e9;
        --danger: #ef4444;
        --warning: #f59e0b;
        --success: #10b981;
        --info: #6366f1;
        --white: #ffffff;
        --gray-50: #f9fafb;
        --gray-100: #f3f4f6;
        --gray-200: #e5e7eb;
        --gray-300: #d1d5db;
        --gray-400: #9ca3af;
        --gray-500: #6b7280;
        --gray-600: #4b5563;
        --gray-700: #374151;
        --gray-800: #1f2937;
        --gray-900: #111827;
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
        --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        --transition: all 0.2s ease-in-out;
      }
      
      /* Layout and Container Styles */
      .din8-container {
        max-width: 1280px;
        margin-left: auto;
        margin-right: auto;
        padding: 2rem 1.5rem;
      }
      
      /* Page Header */
      .din8-page-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--gray-200);
        padding-bottom: 1rem;
      }
      
      .din8-page-header h1 {
        font-size: 2rem;
        font-weight: 700;
        color: var(--gray-900);
        letter-spacing: -0.025em;
        position: relative;
        padding-left: 1rem;
      }
      
      .din8-page-header h1:before {
        content: '';
        position: absolute;
        left: 0;
        top: 15%;
        height: 70%;
        width: 4px;
        background: var(--primary);
        border-radius: 4px;
      }
      
      /* Filter Section */
      .din8-filters-container {
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow-md);
        padding: 1.5rem;
        margin-bottom: 2rem;
        transition: var(--transition);
      }
      
      .din8-filters-container:hover {
        box-shadow: var(--shadow-lg);
      }
      
      .din8-filters-header {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
      }
      
      .din8-filters-header h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-800);
      }
      
      .din8-filters-header .din8-icon {
        margin-right: 0.75rem;
        color: var(--primary);
      }
      
      .din8-filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
      }
      
      .din8-filter-select {
        position: relative;
      }
      
      .din8-filter-select select {
        appearance: none;
        width: 100%;
        padding: 0.75rem 1rem;
        padding-right: 2.5rem;
        font-size: 0.95rem;
        line-height: 1.5;
        background-color: var(--white);
        border: 2px solid var(--gray-300);
        border-radius: 8px;
        color: var(--gray-800);
        cursor: pointer;
        transition: var(--transition);
      }
      
      .din8-filter-select select:focus {
        outline: none;
        border-color: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
      }
      
      .din8-filter-select:after {
        content: '';
        position: absolute;
        top: 50%;
        right: 1rem;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid var(--gray-600);
        pointer-events: none;
      }
      
      /* Paper Cards */
      .din8-papers-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }
      
      .din8-paper-card {
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: var(--transition);
        position: relative;
      }
      
      .din8-paper-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
      
      .din8-paper-card-inner {
        padding: 1.5rem;
      }
      
      .din8-paper-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
      
      .din8-paper-card-content {
        display: flex;
        align-items: flex-start;
        flex-grow: 1;
      }
      
      .din8-paper-card-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 3rem;
        height: 3rem;
        margin-right: 1rem;
        background-color: rgba(79, 70, 229, 0.1);
        border-radius: 12px;
        color: var(--primary);
      }
      
      .din8-paper-card-info {
        flex-grow: 1;
      }
      
      .din8-paper-card-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 0.25rem;
      }
      
      .din8-paper-card-subtitle {
        font-size: 0.95rem;
        color: var(--gray-600);
        margin-bottom: 0.5rem;
      }
      
      .din8-paper-card-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      
      .din8-paper-card-status {
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 9999px;
      }
      
      .din8-status-draft {
        background-color: rgba(79, 70, 229, 0.1);
        color: var(--primary);
      }
      
      .din8-status-submitted {
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--warning);
      }
      
      .din8-status-approved {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success);
      }
      
      .din8-status-rejected {
        background-color: rgba(239, 68, 68, 0.1);
        color: var(--danger);
      }
      
      .din8-paper-card-creator,
      .din8-paper-card-date {
        display: flex;
        align-items: center;
        font-size: 0.75rem;
        color: var(--gray-500);
      }
      
      .din8-paper-card-creator svg,
      .din8-paper-card-date svg {
        margin-right: 0.25rem;
      }
      
      .din8-paper-card-actions {
        display: flex;
        gap: 0.25rem;
      }
      
      .din8-paper-card-action-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 9999px;
        border: none;
        background-color: var(--white);
        transition: var(--transition);
        cursor: pointer;
        position: relative;
      }
      
      .din8-paper-card-action-btn svg {
        width: 1.25rem;
        height: 1.25rem;
      }
      
      .din8-paper-card-action-btn:hover {
        transform: translateY(-2px);
      }
      
      .din8-action-view { color: var(--secondary); }
      .din8-action-view:hover { background-color: rgba(14, 165, 233, 0.1); }
      
      .din8-action-download { color: var(--success); }
      .din8-action-download:hover { background-color: rgba(16, 185, 129, 0.1); }
      
      .din8-action-edit { color: var(--warning); }
      .din8-action-edit:hover { background-color: rgba(245, 158, 11, 0.1); }
      
      .din8-action-approve { color: var(--primary); }
      .din8-action-approve:hover { background-color: rgba(79, 70, 229, 0.1); }
      
      .din8-action-delete { color: var(--danger); }
      .din8-action-delete:hover { background-color: rgba(239, 68, 68, 0.1); }
      
      .din8-paper-card-rejection {
        margin-top: 1rem;
        padding: 1rem;
        background-color: rgba(239, 68, 68, 0.05);
        border-left: 3px solid var(--danger);
        border-radius: 4px;
      }
      
      .din8-paper-card-rejection-header {
        display: flex;
        align-items: flex-start;
        margin-bottom: 0.5rem;
      }
      
      .din8-paper-card-rejection-header svg {
        margin-right: 0.5rem;
        color: var(--danger);
        flex-shrink: 0;
      }
      
      .din8-paper-card-rejection-title {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--danger);
      }
      
      .din8-paper-card-rejection-text {
        font-size: 0.95rem;
        color: var(--gray-700);
        margin-left: 1.75rem;
      }
      
      /* Empty State */
      .din8-empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow);
        padding: 3rem 2rem;
        text-align: center;
      }
      
      .din8-empty-state svg {
        color: var(--gray-400);
        margin-bottom: 1.5rem;
      }
      
      .din8-empty-state-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 0.5rem;
      }
      
      .din8-empty-state-text {
        color: var(--gray-600);
        max-width: 24rem;
        margin-left: auto;
        margin-right: auto;
      }
      
      /* Paper Preview Styles */
      .din8-approval-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }
      
      .din8-preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        border-bottom: 1px solid var(--gray-200);
        padding-bottom: 1rem;
      }
      
      .din8-preview-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--gray-900);
      }
      
      .din8-preview-actions {
        display: flex;
        gap: 0.75rem;
      }
      
      .din8-preview-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.625rem 1.25rem;
        background-color: var(--white);
        border: 1px solid var(--gray-300);
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--gray-700);
        transition: var(--transition);
        cursor: pointer;
      }
      
      .din8-preview-button:hover {
        background-color: var(--gray-100);
        color: var(--gray-900);
      }
      
      .din8-preview-button svg {
        width: 1.25rem;
        height: 1.25rem;
      }
      
      .din8-a4-paper {
        background-color: var(--white);
        box-shadow: var(--shadow-lg);
        margin: 2rem auto;
        width: 210mm;
        border-radius: 4px;
        overflow: hidden;
      }
      
      /* Loading Animation */
      .din8-loading-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      
      .din8-loading-spinner {
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        border: 3px solid var(--gray-200);
        border-top-color: var(--primary);
        animation: spinner 1s linear infinite;
      }
      
      @keyframes spinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      /* PDF download loading styles */
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
        font-size: 1.125rem;
        backdrop-filter: blur(3px);
      }
      
      /* Responsive Styles */
      @media (min-width: 768px) {
        .din8-filters-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      
      /* Print Styles */
      @media print {
        .din8-preview-header,
        .din8-preview-actions,
        .din8-paper-card-actions {
          display: none !important;
        }
      
        .din8-a4-paper {
          box-shadow: none;
          margin: 0;
          width: 100%;
        }
      
        body {
          background-color: var(--white);
        }
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await axios.get('/api/endpapers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        const fetchedPapers = response.data.papers || [];
        setPapers(fetchedPapers);
        setFilteredPapers(fetchedPapers);

        // Extract unique semesters and subject codes
        const semesters = [...new Set(fetchedPapers.map(p => p.examDetails.semester))];
        const subjectCodes = [...new Set(fetchedPapers.map(p => p.examDetails.subjectCode))];
        
        setUniqueSemesters(semesters);
        setUniqueSubjectCodes(subjectCodes);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = papers;

    if (filters.semester) {
      result = result.filter(p => p.examDetails.semester === filters.semester);
    }

    if (filters.subjectCode) {
      result = result.filter(p => p.examDetails.subjectCode === filters.subjectCode);
    }

    if (filters.status) {
      result = result.filter(p => p.status === filters.status);
    }

    setFilteredPapers(result);
  }, [filters, papers]);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // View/Preview Paper
  const viewPaper = (paper) => {
    try {
      console.log("View paper requested for:", paper._id);
      setPreviewingPaper(paper);
      setShowPaper(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error in viewPaper function:", error);
      alert("An error occurred while trying to view the paper. Please try again.");
    }
  };

  // Exit preview mode
  const exitPreview = () => {
    setPreviewingPaper(null);
    setShowPaper(false);
  };

  // Print paper
  const printPaper = () => {
    window.print();
  };

  // Edit Paper
  const editPaper = (paper) => {
    navigate('/create-papers', { 
      state: { 
        paperDetails: paper,
        editMode: true,
        enableInlineEditing: true,
        disableReplaceButtons: true,
        hideReplaceButtons: true,
        removeReplaceButtons: true
      } 
    });
  };

  const downloadPaper = (paper) => {
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
        
        // Prepare paper data from the selected paper
        const paperDetails = {
          university: paper.university.name || "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
          maxMarks: paper.examDetails.maxMarks || "60"
        };
        
        const examDetails = paper.examDetails;
        
        // Make sure questions arrays exist
        const questionsPartA = Array.isArray(paper.paperStructure.parts.find(p => p.partId === 'A')?.questions) 
          ? paper.paperStructure.parts.find(p => p.partId === 'A').questions 
          : [];
        const questionsPartB = Array.isArray(paper.paperStructure.parts.find(p => p.partId === 'B')?.questions) 
          ? paper.paperStructure.parts.find(p => p.partId === 'B').questions 
          : [];
        const questionsPartC = Array.isArray(paper.paperStructure.parts.find(p => p.partId === 'C')?.questions) 
          ? paper.paperStructure.parts.find(p => p.partId === 'C').questions 
          : [];
        
        // Current Y position on the page
        let yPos = margin;
        let currentPage = 1;
        
        // Registration Number and Date box in extreme right corner
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
        
        // Function to add university logo
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
            
            logo.src = paper.university.logoUrl || '/SJU.png';
            
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
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, pageWidth/2, yPos, { align: 'center' });
          yPos += 8;
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(instructions[0].toUpperCase(), margin, yPos);
          pdf.text(instructions[1], pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          
          for (let i = 0; i < questionsList.length; i++) {
            const question = questionsList[i];
            
            const questionText = question.questionText || "No question text available";
            
            pdf.text(`${startNumber + i}.`, margin, yPos);
            
            const textLines = pdf.splitTextToSize(questionText, contentWidth - 10);
            pdf.text(textLines, margin + 7, yPos);
            
            if (textLines.length > 1) {
              yPos += 5;
              yPos += 4 * (textLines.length - 1);
            } else {
              yPos += 5;
            }
            
            if (question.hasImage && question.imageUrl) {
              try {
                const img = new Image();
                img.src = question.imageUrl;
                
                if (img.complete) {
                  const imgWidth = Math.min(contentWidth - 20, 100);
                  const imgHeight = (img.height * imgWidth) / img.width;
                  
                  if (yPos + imgHeight > pageHeight - margin) {
                    checkPageBreak(imgHeight);
                  }
                  
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
            
            yPos += 5;
          }
          
          yPos += 5;
        };
  
        // Function to render Part C with special handling
        const renderPartC = (partTitle, instructions, questionsList, startNumber) => {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text(partTitle, pageWidth/2, yPos, { align: 'center' });
          yPos += 8;
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(instructions[0].toUpperCase(), margin, yPos);
          pdf.text(instructions[1], pageWidth - margin, yPos, { align: 'right' });
          yPos += 8;
          
          pdf.setFont('helvetica', 'normal');
          
          for (let i = 0; i < questionsList.length; i++) {
            const question = questionsList[i];
            
            const questionText = question.questionText || "No question text available";
            
            const textLines = pdf.splitTextToSize(questionText, contentWidth - 10);
            
            const neededSpace = textLines.length * 5 + 10;
            
            if (yPos + neededSpace > pageHeight - margin) {
              pdf.addPage();
              currentPage++;
              yPos = margin;
            }
            
            pdf.text(`${startNumber + i}.`, margin, yPos);
            
            pdf.text(textLines, margin + 7, yPos);
            
            if (textLines.length > 1) {
              yPos += 5;
              yPos += 4 * (textLines.length - 1);
            } else {
              yPos += 5;
            }
            
            if (question.hasImage && question.imageUrl) {
              try {
                const img = new Image();
                img.src = question.imageUrl;
                
                if (img.complete) {
                  const imgWidth = Math.min(contentWidth - 20, 100);
                  const imgHeight = (img.height * imgWidth) / img.width;
                  
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
            
            yPos += 5;
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

  // Delete Paper
  const deletePaper = async (paper) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this paper?');
    
    if (confirmDelete) {
      try {
        await axios.delete(`/api/endpapers/${paper._id}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Remove the paper from the list
        setPapers(papers.filter(p => p._id !== paper._id));
        setFilteredPapers(filteredPapers.filter(p => p._id !== paper._id));
        
        alert('Paper deleted successfully');
      } catch (error) {
        console.error('Error deleting paper:', error);
        alert('Failed to delete paper');
      }
    }
  };

  // Send for approval function
  const sendForApproval = async (paper) => {
    try {
      console.log("=== SEND FOR APPROVAL - START ===");
      
      // Check if the paper status is already "Submitted"
      if (paper.status === 'Submitted') {
        alert("This paper has already been submitted for approval.");
        return;
      }
      
      // Check if the paper can be submitted for approval
      const { canSubmit, reason } = canSubmitForApproval(paper);
      
      if (!canSubmit) {
        alert(reason);
        return;
      }
      
      console.log("Sending approval request to backend...");
      
      // Direct API URL from console logs
      const API_URL = "/api";
      
      // Call the dedicated approval endpoint
      const approvalResponse = await axios.post(`${API_URL}/endpapers/${paper._id}/approval`, 
        {
          comments: 'Submitted for approval'
        }, 
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );

      console.log("Response received:", approvalResponse.data);

      if (approvalResponse.data.success) {
        // Update frontend state to match the new status
        const updatedPapers = papers.map(p => 
          p._id === paper._id 
            ? { 
                ...p, 
                status: 'Submitted',
                metadata: { 
                  ...p.metadata, 
                  status: 'submitted'
                },
                reviewComments: ''
              } 
            : p
        );

        setPapers(updatedPapers);
        setFilteredPapers(
          filteredPapers.map(p => 
            p._id === paper._id 
              ? { 
                  ...p, 
                  status: 'Submitted',
                  metadata: { 
                    ...p.metadata, 
                    status: 'submitted'
                  },
                  reviewComments: ''
                } 
              : p
          )
        );

        alert('Paper sent for approval successfully. Please check the approvals page.');
      } else {
        console.error("API reported failure:", approvalResponse.data);
        alert('Error: ' + (approvalResponse.data.message || 'Failed to send paper for approval'));
      }
    } catch (error) {
      console.error('=== ERROR SENDING PAPER FOR APPROVAL ===');
      console.error('Error object:', error);
      
      let errorMessage = 'Failed to send paper for approval';
      if (error.response && error.response.data) {
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`Failed to send paper for approval: ${errorMessage}`);
    }
  };

  // Get status class based on paper status
  const getStatusClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch(statusLower) {
      case 'draft': return 'din8-status-draft';
      case 'submitted': return 'din8-status-submitted';
      case 'approved': return 'din8-status-approved';
      case 'rejected': return 'din8-status-rejected';
      default: return 'din8-status-draft';
    }
  };

  // If we're in loading state, show loading spinner
  if (loading) {
    return (
      <div className="din8-loading-container">
        <div className="din8-loading-spinner"></div>
      </div>
    );
  }

  // If there was an error fetching the papers
  if (error) {
    return (
      <div className="din8-container">
        <div className="din8-page-header">
          <h1>Question Papers</h1>
        </div>
        <div className="din8-empty-state">
          <AlertTriangle size={48} />
          <h3 className="din8-empty-state-title">Error Loading Papers</h3>
          <p className="din8-empty-state-text">Something went wrong: {error}</p>
        </div>
      </div>
    );
  }

  // If we're previewing a paper, render the preview
  if (previewingPaper && showPaper) {
    const { university, examDetails, paperStructure } = previewingPaper;
    
    // Transform paperStructure to questions format needed by the paper viewer
    const questions = {
      partA: [],
      partB: [],
      partC: []
    };

    // Process each part's questions
    paperStructure.parts.forEach(part => {
      if (part.partId === 'A') {
        questions.partA = part.questions.map(q => ({
          _id: q.questionId,
          question: q.questionText,
          questionNumber: q.questionNumber,
          hasImage: q.hasImage,
          imageUrl: q.imageUrl,
          unit: q.unit,
          bloomLevel: q.bloomLevel,
          marks: q.marks
        }));
      } else if (part.partId === 'B') {
        questions.partB = part.questions.map(q => ({
          _id: q.questionId,
          question: q.questionText,
          questionNumber: q.questionNumber,
          hasImage: q.hasImage,
          imageUrl: q.imageUrl,
          unit: q.unit,
          bloomLevel: q.bloomLevel,
          marks: q.marks
        }));
      } else if (part.partId === 'C') {
        questions.partC = part.questions.map(q => ({
          _id: q.questionId,
          question: q.questionText,
          questionNumber: q.questionNumber,
          hasImage: q.hasImage,
          imageUrl: q.imageUrl,
          unit: q.unit,
          bloomLevel: q.bloomLevel,
          marks: q.marks
        }));
      }
    });

    // Paper details
    const paperDetails = {
      university: university?.name || "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
      maxMarks: examDetails?.maxMarks || "60",
      duration: examDetails?.duration || "2"
    };

    return (
      <div className="din8-approval-container">
        <div className="din8-preview-header">
          <h1>Paper Preview: {examDetails?.subjectCode} - {examDetails?.subjectName}</h1>
          <div className="din8-preview-actions">
            <button className="din8-preview-button" onClick={exitPreview}>
              <ArrowLeft size={16} /> Back to Papers
            </button>
            <button className="din8-preview-button" onClick={printPaper}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        <div className="din8-paper-container" id="din8-paper-container">
          <div className="din8-a4-paper" ref={componentRef}>
            <div className="din8-a4-page">
              <div className="din8-university-header">
                <div className="din8-header-flex">
                  <img 
                    src={university?.logoUrl || "/SJU.png"} 
                    alt="University Logo" 
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
                This paper contains {paperStructure.totalPages || 2} printed pages and {paperStructure.parts.length} parts
              </div>
              
              {/* Part A */}
              <div className="din8-part-title">PART-A</div>
              <div className="din8-part-instructions">
                <div>{paperStructure.parts.find(p => p.partId === 'A')?.instructions[0] || "Answer all FIVE questions"}</div>
                <div>{paperStructure.parts.find(p => p.partId === 'A')?.instructions[1] || "(2 X 5 = 10)"}</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partA.length > 0 ? (
                  questions.partA.map((question, index) => (
                    <div className="din8-question" id={question._id} key={question._id || index}>
                      <span className="din8-question-number">{question.questionNumber}.</span>
                      <span className="din8-question-text">{question.question}</span>
                      
                      {/* Show image if available */}
                      {question.hasImage && question.imageUrl && (
                        <div className="din8-question-image-container">
                          <img 
                            src={question.imageUrl} 
                            alt={`Image for question ${question.questionNumber}`}
                            className="din8-question-image"
                            loading="eager"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part A</div>
                )}
              </div>
              
              {/* Part B */}
              <div className="din8-part-title">PART-B</div>
              <div className="din8-part-instructions">
                <div>{paperStructure.parts.find(p => p.partId === 'B')?.instructions[0] || "Answer any FIVE questions"}</div>
                <div>{paperStructure.parts.find(p => p.partId === 'B')?.instructions[1] || "(4 X 5 = 20)"}</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partB.length > 0 ? (
                  questions.partB.map((question, index) => (
                    <div className="din8-question" id={question._id} key={question._id || index}>
                      <span className="din8-question-number">{question.questionNumber}.</span>
                      <span className="din8-question-text">{question.question}</span>
                      
                      {/* Show image if available */}
                      {question.hasImage && question.imageUrl && (
                        <div className="din8-question-image-container">
                          <img 
                            src={question.imageUrl} 
                            alt={`Image for question ${question.questionNumber}`}
                            className="din8-question-image"
                            loading="eager"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part B</div>
                )}
              </div>
              
              {/* Part C */}
              <div className="din8-part-title">PART-C</div>
              <div className="din8-part-instructions">
                <div>{paperStructure.parts.find(p => p.partId === 'C')?.instructions[0] || "Answer any THREE questions"}</div>
                <div>{paperStructure.parts.find(p => p.partId === 'C')?.instructions[1] || "(10 X 3 = 30)"}</div>
              </div>
              
              <div className="din8-question-list">
                {questions.partC.length > 0 ? (
                  questions.partC.map((question, index) => (
                    <div className="din8-question" id={question._id} key={question._id || index}>
                      <span className="din8-question-number">{question.questionNumber}.</span>
                      <span className="din8-question-text">{question.question}</span>
                      
                      {/* Show image if available */}
                      {question.hasImage && question.imageUrl && (
                        <div className="din8-question-image-container">
                          <img 
                            src={question.imageUrl} 
                            alt={`Image for question ${question.questionNumber}`}
                            className="din8-question-image"
                            loading="eager"
                          />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="din8-no-questions">Not enough questions available for Part C</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main component rendering
  return (
    <div className="din8-container">
      <div className="din8-page-header">
        <h1>Question Papers for End Semester</h1>
      </div>

      {/* Filters Section */}
      <div className="din8-filters-container">
        <div className="din8-filters-header">
          <span className="din8-icon">
            <Filter size={20} />
          </span>
          <h2>Filter Papers</h2>
        </div>
        <div className="din8-filters-grid">
          <div className="din8-filter-select">
            <select 
              name="semester"
              value={filters.semester}
              onChange={(e) => setFilters({...filters, semester: e.target.value})}
            >
              <option value="">All Semesters</option>
              {uniqueSemesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>

          <div className="din8-filter-select">
            <select 
              name="subjectCode"
              value={filters.subjectCode}
              onChange={(e) => setFilters({...filters, subjectCode: e.target.value})}
            >
              <option value="">All Subjects</option>
              {uniqueSubjectCodes.map(subjectCode => (
                <option key={subjectCode} value={subjectCode}>{subjectCode}</option>
              ))}
            </select>
          </div>

          <div className="din8-filter-select">
            <select 
              name="status"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Papers List */}
      <div className="din8-papers-grid">
        {filteredPapers.map((paper, index) => (
          <div key={paper._id} className="din8-paper-card">
            <div className="din8-paper-card-inner">
              <div className="din8-paper-card-top">
                <div className="din8-paper-card-content">
                  <div className="din8-paper-card-icon">
                    <FileText size={24} />
                  </div>
                  <div className="din8-paper-card-info">
                    <h2 className="din8-paper-card-title">
                      {paper.examDetails.subjectName} - {paper.examDetails.subjectCode}
                    </h2>
                    <p className="din8-paper-card-subtitle">
                      {paper.examDetails.course} | {paper.examDetails.semester} Semester
                    </p>
                    <div className="din8-paper-card-meta">
                      <span className={`din8-paper-card-status ${getStatusClass(paper.status)}`}>
                        {paper.status}
                      </span>
                      <span className="din8-paper-card-creator">
                        <User size={12} />
                        {paper.metadata?.creatorName || "Unknown"}
                      </span>
                      <span className="din8-paper-card-date">
                        <Calendar size={12} />
                        {formatDate(paper.metadata?.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="din8-paper-card-actions">
                  <button 
                    onClick={() => viewPaper(paper)}
                    className="din8-paper-card-action-btn din8-action-view"
                    data-tooltip="View"
                  >
                    <Eye size={20} />
                  </button>
                  
                  <button 
                    onClick={() => downloadPaper(paper)}
                    className="din8-paper-card-action-btn din8-action-download"
                    data-tooltip="Download"
                  >
                    <Download size={20} />
                  </button>
                  
                  <button 
                    onClick={() => editPaper(paper)}
                    className="din8-paper-card-action-btn din8-action-edit"
                    data-tooltip="Edit"
                  >
                    <Edit size={20} />
                  </button>
                  
                  <button 
                    onClick={() => sendForApproval(paper)}
                    className="din8-paper-card-action-btn din8-action-approve"
                    data-tooltip="Send for Approval"
                  >
                    <Send size={20} />
                  </button>
                  
                  <button 
                    onClick={() => deletePaper(paper)}
                    className="din8-paper-card-action-btn din8-action-delete"
                    data-tooltip="Delete"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              
              {/* Show rejection comments if paper is rejected */}
              {paper.status === 'Rejected' && paper.reviewComments && (
                <div className="din8-paper-card-rejection">
                  <div className="din8-paper-card-rejection-header">
                    <AlertTriangle size={16} />
                    <h4 className="din8-paper-card-rejection-title">Rejection Reason:</h4>
                  </div>
                  <p className="din8-paper-card-rejection-text">{paper.reviewComments}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Empty state when no papers match the filters */}
      {filteredPapers.length === 0 && (
        <div className="din8-empty-state">
          <FileText size={48} />
          <h3 className="din8-empty-state-title">No Papers Found</h3>
          <p className="din8-empty-state-text">Try adjusting your filters or create a new paper.</p>
        </div>
      )}
    </div>
  );
}

export default EndSemSide;