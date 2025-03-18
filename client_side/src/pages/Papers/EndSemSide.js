import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Edit, Trash2, Eye, Send } from 'lucide-react';
import axios from 'axios';

export function EndSemSide() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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
      result = result.filter(p => p.metadata.status === filters.status);
    }

    setFilteredPapers(result);
  }, [filters, papers]);

  // View/Preview Paper
  const viewPaper = (paper) => {
    navigate('/create-papers', { 
      state: { 
        paperDetails: paper,
        previewMode: true,
        disableReplaceButtons: true
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

  // Edit Paper
  const editPaper = (paper) => {
    navigate('/create-papers', { 
      state: { 
        paperDetails: paper,
        editMode: true,
        enableInlineEditing: true,
        disableReplaceButtons: true
      } 
    });
  };

  // Delete Paper
  const deletePaper = async (paper) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this paper?');
    
    if (confirmDelete) {
      try {
        await axios.delete(`/api/endpapers/${paper._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  // Send for Approval
  const sendForApproval = async (paper) => {
    try {
      await axios.post(`/api/endpapers/${paper._id}/approval`, {}, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      // Update the paper's status locally
      const updatedPapers = papers.map(p => 
        p._id === paper._id 
          ? { ...p, metadata: { ...p.metadata, status: 'submitted' } } 
          : p
      );

      setPapers(updatedPapers);
      setFilteredPapers(updatedPapers);

      alert('Paper sent for approval successfully');
    } catch (error) {
      console.error('Error sending paper for approval:', error);
      alert('Failed to send paper for approval');
    }
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Question Papers</h1>

      {/* Filters */}
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
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Papers List */}
      <div className="grid gap-4">
        {filteredPapers.map((paper, index) => (
          <div 
            key={paper._id} 
            className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
          >
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
                <div className="flex items-center space-x-2">
                  <span 
                    className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(paper.metadata.status)}`}
                  >
                    {paper.metadata.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created by: {paper.metadata.createdBy}
                  </span>
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
              {paper.metadata.status === 'draft' && (
                <button 
                  onClick={() => sendForApproval(paper)}
                  className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition-colors"
                  title="Send for Approval"
                >
                  <Send className="w-5 h-5" />
                </button>
              )}
              <button 
                onClick={() => deletePaper(paper)}
                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EndSemSide;