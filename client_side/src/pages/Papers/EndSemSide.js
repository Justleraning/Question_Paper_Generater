import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Edit, Trash2, Eye, Send, Calendar, AlertTriangle, ArrowLeft, Printer } from 'lucide-react';
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
  
  // State for view mode - Using the same approach as PaperApprovals_EndSem
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

  // Apply filters - updated to use root level status
  useEffect(() => {
    let result = papers;

    if (filters.semester) {
      result = result.filter(p => p.examDetails.semester === filters.semester);
    }

    if (filters.subjectCode) {
      result = result.filter(p => p.examDetails.subjectCode === filters.subjectCode);
    }

    if (filters.status) {
      // Use the root level status property
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

  // View/Preview Paper - Using the same approach as PaperApprovals_EndSem
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

  // Edit Paper - No replace buttons
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

  // Download Paper
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

  // Delete Paper - Updated to use sessionStorage
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
                status: 'Submitted',  // Use consistent capitalization with other parts of the app
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

  // Status color mapping - Updated to include Submitted status
  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return 'bg-blue-100 text-blue-800';       // Draft (blue)
      case 'draft': return 'bg-blue-100 text-blue-800';       // draft (blue)
      case 'Submitted': return 'bg-yellow-100 text-yellow-800'; // Submitted papers (yellow)
      case 'submitted': return 'bg-yellow-100 text-yellow-800'; // Same as 'Submitted'
      case 'Approved': return 'bg-green-100 text-green-800';    // Approved papers (green)
      case 'approved': return 'bg-green-100 text-green-800';    // Same as 'Approved'
      case 'Rejected': return 'bg-red-100 text-red-800';        // Rejected papers (red)
      case 'rejected': return 'bg-red-100 text-red-800';        // Same as 'Rejected'
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add CSS styles for paper preview - Using the same CSS as PaperApprovals_EndSem
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .approval-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
        font-family: Arial, sans-serif;
      }

      .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .preview-actions {
        display: flex;
        gap: 10px;
      }

      .preview-button {
        display: flex;
        align-items: center;
        gap: 5px;
        padding: 8px 16px;
        background-color: #f3f4f6;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      .preview-button:hover {
        background-color: #e5e7eb;
      }

      .din8-paper-container {
        position: relative;
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
        width: 130px;
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
        font-size: 16px;
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
        top: 5mm;
        right: 5mm;
        width: 50mm;
        font-size: 12px;
      }
      
      .din8-exam-info {
        display: flex;
        justify-content: space-between;
        margin: 15px 0;
        font-size: 16px;
      }
      
      .din8-paper-info {
        text-align: center;
        margin: 10px 0;
        font-weight: normal;
      }
      
      .din8-part-title {
        font-size: 14px;
        font-weight: bold;
        margin: 15px 0 5px 0;
      }
      
      .din8-part-instructions {
        font-size: 16px;
        margin-bottom: 10px;
      }
      
      .din8-question-list {
        margin-bottom: 20px;
      }
      
      .din8-question {
        display: flex;
        margin-bottom: 15px;
        align-items: flex-start;
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

      .din8-loading-spinner {
        border: 4px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 4px solid white;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      .action-buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
        margin-bottom: 30px;
      }

      @media print {
        .preview-header, .preview-actions, .action-buttons {
          display: none;
        }
        
        .din8-a4-paper {
          box-shadow: none;
          border: none;
        }

        body {
          margin: 0;
          padding: 0;
          background: white;
        }
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

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
      <div className="approval-container">
        <div className="preview-header">
          <h1 className="text-2xl font-bold">Paper Preview: {examDetails?.subjectCode} - {examDetails?.subjectName}</h1>
          <div className="preview-actions">
            <button className="preview-button" onClick={exitPreview}>
              <ArrowLeft size={16} /> Back to Papers
            </button>
          </div>
        </div>

        {showPaper && (
          <div className="din8-paper-container" id="din8-paper-container">
            <div className="din8-a4-paper" ref={componentRef}>
              {/* Page content with auto height instead of fixed height */}
              <div className="din8-a4-page">
                <div className="din8-university-header">
                  <div className="din8-header-flex">
                    <img 
                      src={university?.logoUrl || "/SJU.png"} 
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
        )}
      </div>
    );
  }

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Question Papers</h1>

      {/* Filters - Updated to include both status types */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <select 
          name="semester"
          value={filters.semester}
          onChange={(e) => setFilters({...filters, semester: e.target.value})}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Semesters</option>
          {uniqueSemesters.map(semester => (
            <option key={semester} value={semester}>{semester}</option>
          ))}
        </select>

        <select 
          name="subjectCode"
          value={filters.subjectCode}
          onChange={(e) => setFilters({...filters, subjectCode: e.target.value})}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Subjects</option>
          {uniqueSubjectCodes.map(subjectCode => (
            <option key={subjectCode} value={subjectCode}>{subjectCode}</option>
          ))}
        </select>

        <select 
          name="status"
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="Draft">Draft</option>
          <option value="draft">draft</option>
          <option value="Submitted">Submitted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Papers List - Updated to use the paper's root status and include creation date */}
      <div className="grid gap-4">
        {filteredPapers.map((paper, index) => (
          <div 
            key={paper._id} 
            className="bg-white shadow-md rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-grow">
                <div className="flex-shrink-0">
                  <span className="font-bold text-gray-500 mr-2">
                    {filteredPapers.length - index}.
                  </span>
                  <FileText className="text-blue-500 w-10 h-10" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {paper.examDetails.subjectName} - {paper.examDetails.subjectCode}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {paper.examDetails.course} | {paper.examDetails.semester} Semester
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span 
                      className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(paper.status)}`}
                    >
                      {paper.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      Created by: {paper.metadata?.creatorName || "Unknown"}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      Created: {formatDate(paper.metadata?.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {/* All buttons are always visible */}
                <button 
                  onClick={() => viewPaper(paper)}
                  className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                  title="View"
                >
                  <Eye className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => downloadPaper(paper)}
                  className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => editPaper(paper)}
                  className="text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-colors"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => sendForApproval(paper)}
                  className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition-colors"
                  title="Send for Approval"
                >
                  <Send className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => deletePaper(paper)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Show rejection comments if paper is rejected */}
            {paper.status === 'Rejected' && paper.reviewComments && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-700">Rejection Reason:</h4>
                    <p className="text-sm text-red-600">{paper.reviewComments}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredPapers.length === 0 && (
        <div className="bg-gray-50 text-gray-600 p-8 rounded-md text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">No Papers Found</h3>
          <p>Try adjusting your filters or create a new paper.</p>
        </div>
      )}
    </div>
  );
}

export default EndSemSide;