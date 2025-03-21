import React, { useState, useEffect, useRef } from 'react';
import { FileText, Check, X, Eye, Calendar, ArrowLeft, Printer, Download } from 'lucide-react';
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

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'Submitted': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Add CSS styles for paper preview and loading overlay
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

      .approval-button {
        padding: 10px 20px;
        background-color: #10b981;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .approval-button:hover {
        background-color: #059669;
      }

      .rejection-button {
        padding: 10px 20px;
        background-color: #ef4444;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .rejection-button:hover {
        background-color: #dc2626;
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

      .approval-list {
        margin-top: 20px;
      }
    `;
    
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

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
    
    // Variables for conditional rendering
    const isEditMode = false;
    const disableReplaceButtons = true;

    return (
      <div className="approval-container">
        <div className="preview-header">
          <h1 className="text-2xl font-bold">Paper Preview: {examDetails?.subjectCode} - {examDetails?.subjectName}</h1>
          <div className="preview-actions">
            <button className="preview-button" onClick={exitPreview}>
              <ArrowLeft size={16} /> Back to Approvals
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

        {/* Action buttons for approval/rejection */}
        <div className="action-buttons">
          <button 
            className="approval-button"
            onClick={() => approvePaper(previewingPaper._id)}
          >
            Approve Paper
          </button>
          <button 
            className="rejection-button"
            onClick={() => showRejectionDialog(previewingPaper._id)}
          >
            Reject Paper
          </button>
        </div>
      </div>
    );
  }

  // Otherwise, render the list of papers pending approval
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Paper Approvals</h1>
      
      {papers.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
          <p>No papers are pending approval at this time.</p>
          <p className="mt-2 text-sm">Note: If you've just submitted a paper, it may take a moment to appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 approval-list">
          {papers.map((paper) => (
            <div 
              key={paper._id} 
              className="bg-white shadow-md rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-grow">
                  <div className="flex-shrink-0">
                    <FileText className="text-blue-500 w-10 h-10" />
                  </div>
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {paper.examDetails?.subjectName || "Unknown Subject"} - {paper.examDetails?.subjectCode || "No Code"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {paper.examDetails?.course || "Unknown Course"} | {paper.examDetails?.semester || "Unknown"} Semester
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(paper.status)}`}
                      >
                        {paper.status || "Unknown"} - Pending Approval
                      </span>
                      <span className="text-xs text-gray-500">
                        Created by: {paper.metadata?.creatorName || "Unknown"}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        Created: {paper.metadata?.createdAt ? formatDate(paper.metadata.createdAt) : "Unknown date"}
                      </div>
                      {paper.metadata?.submittedAt && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          Submitted: {formatDate(paper.metadata.submittedAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => viewPaper(paper)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => approvePaper(paper._id)}
                    className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                    title="Approve"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => showRejectionDialog(paper._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    title="Reject"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectingPaperId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Reject Paper</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            
            <textarea
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
              className="w-full p-2 border rounded-md mb-4 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter reason for rejection..."
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelRejection}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={rejectPaper}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaperApprovals_EndSem;