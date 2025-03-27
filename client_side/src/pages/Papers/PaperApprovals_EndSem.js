import React, { useState, useEffect, useRef } from 'react';
import { FileText, Check, X, Eye, Calendar, ArrowLeft, Printer, Download, User, Filter, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PaperApprovals_EndSem() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rejectingPaperId, setRejectingPaperId] = useState(null);
  const [previewingPaper, setPreviewingPaper] = useState(null);
  const [showPaper, setShowPaper] = useState(false);
  const componentRef = useRef();
  const navigate = useNavigate();

  // Add enhanced styles to the page
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* Enhanced Paper Approvals Stylesheet */
      
      /* Base Variables */
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
      
      /* Page Layout */
      .din8-container {
        max-width: 1280px;
        margin-left: auto;
        margin-right: auto;
        padding: 2rem 1.5rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
      
      /* Empty State */
      .din8-empty-state {
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow);
        padding: 2.5rem 1.5rem;
        text-align: center;
        margin-top: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      .din8-empty-state svg {
        color: var(--primary-light);
        margin-bottom: 1.5rem;
      }
      
      .din8-empty-state-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 0.5rem;
      }
      
      .din8-empty-state-message {
        color: var(--gray-600);
        max-width: 32rem;
        margin: 0 auto;
      }
      
      .din8-empty-state-note {
        font-size: 0.875rem;
        color: var(--gray-500);
        margin-top: 1rem;
      }
      
      /* Paper Cards */
      .din8-approvals-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1rem;
        margin-top: 1.5rem;
      }
      
      .din8-approval-card {
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow);
        overflow: hidden;
        transition: var(--transition);
      }
      
      .din8-approval-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }
      
      .din8-approval-card-inner {
        padding: 1.5rem;
      }
      
      .din8-approval-card-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
      }
      
      .din8-approval-card-content {
        display: flex;
        align-items: flex-start;
        flex-grow: 1;
      }
      
      .din8-approval-card-icon {
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
      
      .din8-approval-card-info {
        flex-grow: 1;
      }
      
      .din8-approval-card-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--gray-800);
        margin-bottom: 0.25rem;
      }
      
      .din8-approval-card-subtitle {
        font-size: 0.95rem;
        color: var(--gray-600);
        margin-bottom: 0.5rem;
      }
      
      .din8-approval-card-meta {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      
      .din8-approval-card-status {
        display: inline-flex;
        align-items: center;
        padding: 0.375rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        border-radius: 9999px;
      }
      
      .din8-status-submitted {
        background-color: rgba(245, 158, 11, 0.1);
        color: var(--warning);
      }
      
      .din8-approval-card-creator,
      .din8-approval-card-date {
        display: flex;
        align-items: center;
        font-size: 0.75rem;
        color: var(--gray-500);
      }
      
      .din8-approval-card-creator svg,
      .din8-approval-card-date svg {
        margin-right: 0.25rem;
      }
      
      .din8-approval-card-actions {
        display: flex;
        gap: 0.25rem;
      }
      
      .din8-approval-card-action-btn {
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
      
      .din8-approval-card-action-btn svg {
        width: 1.25rem;
        height: 1.25rem;
      }
      
      .din8-approval-card-action-btn:hover {
        transform: translateY(-2px);
      }
      
      .din8-action-view { color: var(--secondary); }
      .din8-action-view:hover { background-color: rgba(14, 165, 233, 0.1); }
      
      .din8-action-approve { color: var(--success); }
      .din8-action-approve:hover { background-color: rgba(16, 185, 129, 0.1); }
      
      .din8-action-reject { color: var(--danger); }
      .din8-action-reject:hover { background-color: rgba(239, 68, 68, 0.1); }
      
      /* Paper Preview Styles */
      .din8-approval-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1.5rem;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
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
      
      .din8-action-buttons {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 2rem;
        margin-bottom: 3rem;
      }
      
      .din8-approve-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background-color: var(--success);
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--white);
        transition: var(--transition);
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
      }
      
      .din8-approve-button:hover {
        background-color: #0d9668;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(16, 185, 129, 0.25);
      }
      
      .din8-reject-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        background-color: var(--white);
        border: 2px solid var(--danger);
        border-radius: 8px;
        font-size: 1rem;
        font-weight: 600;
        color: var(--danger);
        transition: var(--transition);
        cursor: pointer;
      }
      
      .din8-reject-button:hover {
        background-color: rgba(239, 68, 68, 0.05);
        transform: translateY(-2px);
      }
      
      /* Paper View Container */
      .din8-paper-container {
        position: relative;
      }
      
      .din8-a4-paper {
        background-color: var(--white);
        box-shadow: var(--shadow-lg);
        margin: 2rem auto;
        width: 210mm;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .din8-a4-page {
        width: 210mm;
        height: auto;
        padding: 20mm 15mm 15mm 15mm;
        position: relative;
        box-sizing: border-box;
      }
      
      .din8-university-header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .din8-header-flex {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .din8-university-logo {
        width: 120px;
        height: auto;
        margin-right: 15px;
      }
      
      .din8-header-text {
        text-align: center;
      }
      
      .din8-university-name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .din8-course-details {
        font-size: 14px;
        margin-bottom: 3px;
      }
      
      .din8-paper-title {
        font-size: 14px;
        font-weight: bold;
        margin: 8px 0;
      }
      
      .din8-registration-box {
        border: 1px solid #000;
        padding: 5px;
        position: absolute;
        top: 20mm;
        right: 15mm;
        width: 50mm;
        font-size: 12px;
      }
      
      .din8-exam-info {
        display: flex;
        justify-content: space-between;
        margin: 15px 0;
        font-size: 14px;
      }
      
      .din8-paper-info {
        text-align: center;
        margin: 10px 0;
        font-size: 12px;
      }
      
      .din8-part-title {
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0 10px 0;
      }
      
      .din8-part-instructions {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-bottom: 10px;
      }
      
      .din8-question-list {
        margin-bottom: 20px;
      }
      
      .din8-question {
        display: flex;
        margin-bottom: 15px;
      }
      
      .din8-question-number {
        margin-right: 10px;
        font-weight: bold;
        min-width: 20px;
      }
      
      .din8-question-text {
        flex: 1;
      }
      
      .din8-question-image-container {
        margin-top: 10px;
        text-align: center;
      }
      
      .din8-question-image {
        max-width: 100%;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
      
      /* Rejection Dialog */
      .din8-modal-backdrop {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
        z-index: 50;
        animation: fadeIn 0.2s ease-out;
      }
      
      .din8-modal {
        background-color: var(--white);
        border-radius: 12px;
        box-shadow: var(--shadow-xl);
        width: 100%;
        max-width: 32rem;
        overflow: hidden;
        animation: scaleIn 0.2s ease-out;
      }
      
      .din8-modal-header {
        padding: 1.5rem;
        border-bottom: 1px solid var(--gray-200);
      }
      
      .din8-modal-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--gray-900);
      }
      
      .din8-modal-body {
        padding: 1.5rem;
      }
      
      .din8-modal-label {
        display: block;
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--gray-700);
        margin-bottom: 0.5rem;
      }
      
      .din8-modal-textarea {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid var(--gray-300);
        border-radius: 8px;
        font-size: 0.95rem;
        resize: vertical;
        min-height: 8rem;
        transition: var(--transition);
      }
      
      .din8-modal-textarea:focus {
        outline: none;
        border-color: var(--primary-light);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
      }
      
      .din8-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        padding: 1.5rem;
        border-top: 1px solid var(--gray-200);
      }
      
      .din8-modal-cancel-button {
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
      
      .din8-modal-cancel-button:hover {
        background-color: var(--gray-100);
      }
      
      .din8-modal-confirm-button {
        padding: 0.625rem 1.25rem;
        background-color: var(--danger);
        border: none;
        border-radius: 8px;
        font-size: 0.95rem;
        font-weight: 500;
        color: var(--white);
        transition: var(--transition);
        cursor: pointer;
      }
      
      .din8-modal-confirm-button:hover {
        background-color: #dc2626;
      }
      
      /* Loading Animation */
      .din8-loading-container {
        display: flex;
        flex-direction: column;
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
      
      .din8-loading-text {
        margin-top: 1rem;
        font-size: 1.125rem;
        font-weight: 500;
        color: var(--gray-600);
      }
      
      @keyframes spinner {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes fadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes scaleIn {
        0% { transform: scale(0.95); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      
      /* PDF Loading Overlay */
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
      @media (max-width: 767px) {
        .din8-approval-card-top {
          flex-direction: column;
        }
        
        .din8-approval-card-actions {
          margin-top: 1rem;
          justify-content: flex-end;
        }
        
        .din8-approval-card-meta {
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
        }
        
        .din8-a4-paper {
          width: 100%;
        }
        
        .din8-a4-page {
          width: 100%;
          padding: 10mm;
        }
      }
      
      /* Print styles */
      @media print {
        .din8-preview-header,
        .din8-preview-actions,
        .din8-action-buttons {
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

  // Fetch papers pending approval
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        console.log("Fetching papers pending approval...");
        
        // Use the dedicated pending approvals endpoint
        const response = await axios.get('/api/endpapers/approvals', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        console.log('Papers pending approval:', response.data.papers);
        
        setPapers(response.data.papers || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching papers for approval:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

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
      // Scroll to top when viewing paper
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

  // Download paper as PDF
  const downloadPaper = () => {
    if (!previewingPaper) return;
    
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
        const { examDetails, university, paperStructure } = previewingPaper;
        
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
        
        // Prepare paper data
        const paperDetails = {
          university: university?.name || "ST. JOSEPH'S UNIVERSITY, BENGALURU - 27",
          maxMarks: examDetails?.maxMarks || "60"
        };
        
        // Current Y position on the page
        let yPos = margin;
        let currentPage = 1;
        
        // Registration Number and Date box in extreme right corner
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.1);
        const boxWidth = 50;
        const boxHeight = 15;
        const boxX = pageWidth - boxWidth - margin;
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
            
            logo.src = university?.logoUrl || '/SJU.png';
            
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
          
          const totalPages = paperStructure?.totalPages || 2;
          const totalParts = paperStructure?.parts?.length || 3;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
          pdf.text(`This paper contains ${totalPages} printed pages and ${totalParts} parts`, pageWidth/2, yPos, { align: 'center' });
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
        
        // Find parts
        const partA = paperStructure?.parts?.find(p => p.partId === 'A');
        const partB = paperStructure?.parts?.find(p => p.partId === 'B');
        const partC = paperStructure?.parts?.find(p => p.partId === 'C');
        
        // Function to render a part with its questions
        const renderPart = (part, startNumber) => {
          if (!part) return startNumber;
          
          // Add part title
          checkPageBreak(15);
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text(part.partTitle, pageWidth/2, yPos, { align: 'center' });
          yPos += 8;
          
          // Add instructions
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          for (const instruction of part.instructions) {
            pdf.text(instruction, pageWidth/2, yPos, { align: 'center' });
            yPos += 5;
          }
          yPos += 5;
          
          // Add questions
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          
          part.questions.forEach((question, index) => {
            const questionNumber = question.questionNumber || (startNumber + index);
            
            // Check if we need a new page for this question
            checkPageBreak(15); // Minimum space for a question
            
            // Question number and text
            const questionText = `${questionNumber}. ${question.questionText}`;
            
            // Split long text into multiple lines
            const textLines = pdf.splitTextToSize(questionText, contentWidth);
            
            // Calculate space needed for text
            const textHeight = textLines.length * 5; // 5mm per line
            
            // Check again with the actual text height
            if (checkPageBreak(textHeight + 10)) { // 10mm buffer
              // If we added a new page, reset yPos
              yPos = margin;
            }
            
            // Add text
            pdf.text(textLines, margin, yPos);
            yPos += textHeight + 8; // Space after text
            
            // Add image if present
            if (question.hasImage && question.imageUrl) {
              // Handle image later - this is complex in jsPDF
              yPos += 10; // Space for image placeholder
            }
          });
          
          return startNumber + part.questions.length;
        };
        
        // Add first page header
        addPageHeader().then(() => {
          try {
            // Render Part A
            let nextQuestionNumber = renderPart(partA, 1);
            
            // Render Part B
            nextQuestionNumber = renderPart(partB, nextQuestionNumber);
            
            // Render Part C
            renderPart(partC, nextQuestionNumber);
            
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
        if (document.body.contains(loadingOverlay)) {
          document.body.removeChild(loadingOverlay);
        }
        alert('Error generating PDF: ' + error.message);
      }
    };
  };

  // Handle paper approval
  const approvePaper = async (paperId) => {
    try {
      const response = await axios.put(`/api/endpapers/${paperId}/approval`, 
        { 
          status: 'approved',
          comments: 'Paper approved'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        // Update local state to remove the approved paper from the list
        setPapers(papers.filter(paper => paper._id !== paperId));
        
        // Exit preview mode if we were previewing the approved paper
        if (previewingPaper && previewingPaper._id === paperId) {
          setPreviewingPaper(null);
          setShowPaper(false);
        }
        
        alert('Paper approved successfully');
      } else {
        alert('Error: ' + (response.data.message || 'Failed to approve paper'));
      }
    } catch (error) {
      console.error('Error approving paper:', error);
      alert('Failed to approve paper: ' + (error.response?.data?.message || error.message));
    }
  };

  // Show rejection dialog
  const showRejectionDialog = (paperId) => {
    setRejectingPaperId(paperId);
    setRejectionComment('');
  };

  // Cancel rejection
  const cancelRejection = () => {
    setRejectingPaperId(null);
    setRejectionComment('');
  };

  // Handle paper rejection
  const rejectPaper = async () => {
    if (!rejectionComment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await axios.put(`/api/endpapers/${rejectingPaperId}/approval`, 
        { 
          status: 'rejected',
          comments: rejectionComment 
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        // Update local state to remove the rejected paper from the list
        setPapers(papers.filter(paper => paper._id !== rejectingPaperId));
        
        // Exit preview mode if we were previewing the rejected paper
        if (previewingPaper && previewingPaper._id === rejectingPaperId) {
          setPreviewingPaper(null);
          setShowPaper(false);
        }
        
        // Clear rejection state
        setRejectingPaperId(null);
        setRejectionComment('');
        
        alert('Paper rejected successfully');
      } else {
        alert('Error: ' + (response.data.message || 'Failed to reject paper'));
      }
    } catch (error) {
      console.error('Error rejecting paper:', error);
      alert('Failed to reject paper: ' + (error.response?.data?.message || error.message));
    }
  };

  // Get status class for paper
  const getStatusClass = (status) => {
    const statusLower = (status || '').toLowerCase();
    switch(statusLower) {
      case 'submitted': return 'din8-status-submitted';
      default: return 'din8-status-submitted';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="din8-loading-container">
        <div className="din8-loading-spinner"></div>
        <div className="din8-loading-text">Loading papers for approval...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="din8-container">
        <div className="din8-page-header">
          <h1>Paper Approvals</h1>
        </div>
        <div className="din8-empty-state">
          <AlertTriangle size={48} />
          <h3 className="din8-empty-state-title">Error Loading Papers</h3>
          <p className="din8-empty-state-message">Something went wrong while fetching papers: {error}</p>
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
              <ArrowLeft size={18} /> Back to Approvals
            </button>
            <button className="din8-preview-button" onClick={printPaper}>
              <Printer size={18} /> Print
            </button>
            <button className="din8-preview-button" onClick={downloadPaper}>
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>

        <div className="din8-paper-container">
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
              
              <div className="din8-paper-info">
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

        {/* Action buttons for approval/rejection */}
        <div className="din8-action-buttons">
          <button 
            className="din8-approve-button"
            onClick={() => approvePaper(previewingPaper._id)}
          >
            <Check size={20} /> Approve Paper
          </button>
          <button 
            className="din8-reject-button"
            onClick={() => showRejectionDialog(previewingPaper._id)}
          >
            <X size={20} /> Reject Paper
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, render the list of papers pending approval
  return (
    <div className="din8-container">
      <div className="din8-page-header">
        <h1>Paper Approvals for End Semester</h1>
      </div>
      
      {papers.length === 0 ? (
        <div className="din8-empty-state">
          <FileText size={48} />
          <h3 className="din8-empty-state-title">No Papers Pending Approval</h3>
          <p className="din8-empty-state-message">There are no papers waiting for your approval at this time.</p>
          <p className="din8-empty-state-note">Note: If you've just received a paper submission, it may take a moment to appear here.</p>
        </div>
      ) : (
        <div className="din8-approvals-grid">
          {papers.map((paper) => (
            <div key={paper._id} className="din8-approval-card">
              <div className="din8-approval-card-inner">
                <div className="din8-approval-card-top">
                  <div className="din8-approval-card-content">
                    <div className="din8-approval-card-icon">
                      <FileText size={24} />
                    </div>
                    <div className="din8-approval-card-info">
                      <h2 className="din8-approval-card-title">
                        {paper.examDetails?.subjectName || "Unknown Subject"} - {paper.examDetails?.subjectCode || "No Code"}
                      </h2>
                      <p className="din8-approval-card-subtitle">
                        {paper.examDetails?.course || "Unknown Course"} | {paper.examDetails?.semester || "Unknown"} Semester
                      </p>
                      <div className="din8-approval-card-meta">
                        <span className={`din8-approval-card-status ${getStatusClass(paper.status)}`}>
                          {paper.status || "Unknown"} - Pending Approval
                        </span>
                        <span className="din8-approval-card-creator">
                          <User size={12} />
                          {paper.metadata?.creatorName || "Unknown"}
                        </span>
                        <span className="din8-approval-card-date">
                          <Calendar size={12} />
                          Created: {paper.metadata?.createdAt ? formatDate(paper.metadata.createdAt) : "Unknown date"}
                        </span>
                        {paper.metadata?.submittedAt && (
                          <span className="din8-approval-card-date">
                            <Calendar size={12} />
                            Submitted: {formatDate(paper.metadata.submittedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="din8-approval-card-actions">
                    <button 
                      onClick={() => viewPaper(paper)}
                      className="din8-approval-card-action-btn din8-action-view"
                      data-tooltip="View"
                    >
                      <Eye size={20} />
                    </button>
                    <button 
                      onClick={() => approvePaper(paper._id)}
                      className="din8-approval-card-action-btn din8-action-approve"
                      data-tooltip="Approve"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => showRejectionDialog(paper._id)}
                      className="din8-approval-card-action-btn din8-action-reject"
                      data-tooltip="Reject"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectingPaperId && (
        <div className="din8-modal-backdrop">
          <div className="din8-modal">
            <div className="din8-modal-header">
              <h3 className="din8-modal-title">Reject Paper</h3>
            </div>
            <div className="din8-modal-body">
              <label className="din8-modal-label">Please provide a reason for rejection:</label>
              <textarea
                value={rejectionComment}
                onChange={(e) => setRejectionComment(e.target.value)}
                className="din8-modal-textarea"
                placeholder="Enter detailed feedback for the paper creator..."
              />
            </div>
            <div className="din8-modal-footer">
              <button
                onClick={cancelRejection}
                className="din8-modal-cancel-button"
              >
                Cancel
              </button>
              <button
                onClick={rejectPaper}
                className="din8-modal-confirm-button"
              >
                Reject Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaperApprovals_EndSem;