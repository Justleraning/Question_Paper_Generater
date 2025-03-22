import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { motion } from 'framer-motion';
import { FaFileDownload, FaArrowLeft, FaSearch, FaCheckCircle, FaFilePdf, FaFileWord } from 'react-icons/fa';
import { jsPDF } from 'jspdf';
 // Add this function at the beginning of your PaperApprovals component
 const showPopup = (message) => {
  // Create the popup container
  const popupContainer = document.createElement('div');
  popupContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  // Create the popup content
  popupContainer.innerHTML = `
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md text-center">
      <div class="flex justify-center mb-4">
        <div class="bg-green-500 rounded-full p-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>
      <h2 class="text-xl font-bold mb-4">${message}</h2>
      <button class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
        OK
      </button>
    </div>
  `;
  
  // Add to document
  document.body.appendChild(popupContainer);
  
  // Add event listener to OK button
  const okButton = popupContainer.querySelector('button');
  okButton.addEventListener('click', () => {
    document.body.removeChild(popupContainer);
  });
  
  // Auto-close after 3 seconds
  setTimeout(() => {
    if (document.body.contains(popupContainer)) {
      document.body.removeChild(popupContainer);
    }
  }, 3000);
};
// Function to strip HTML tags
const stripHtmlTags = (html) => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const AnswerKeyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const finalPaper = location.state?.finalPaper || [];
  const correctAnswers = location.state?.correctAnswers || [];
  const [searchTerm, setSearchTerm] = useState('');
  const [exportFormat, setExportFormat] = useState('docx');

  // Filter answers based on search term
  const filteredAnswers = correctAnswers.filter((answer) => 
    stripHtmlTags(answer.question).toLowerCase().includes(searchTerm.toLowerCase()) ||
    stripHtmlTags(answer.correctOption).toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Generate document with branding and formatting
  const createDocument = () => {
    // Create a document header with styling
    const header = [
      new Paragraph({
        text: "ANSWER KEY",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 200,
        },
      }),
      new Paragraph({
        text: `Generated on ${new Date().toLocaleDateString()}`,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 400,
        },
      }),
    ];

    // Create content for each answer
    const content = filteredAnswers.map((answer, index) => {
      return new Paragraph({
        children: [
          new TextRun({ 
            text: `Question ${index + 1}: `, 
            bold: true,
          }),
          new TextRun({ 
            text: stripHtmlTags(answer.question), 
            break: 1,
          }),
          new TextRun({ 
            text: `Correct Answer: `, 
            bold: true,
            break: 1,
          }),
          new TextRun({ 
            text: stripHtmlTags(answer.correctOption),
            color: "2E7D32", // Green color for correct answers
          }),
        ],
        spacing: {
          after: 300,
        },
      });
    });

    // Combine header and content
    return new Document({
      sections: [
        {
          children: [...header, ...content],
          properties: {
            page: {
              margin: {
                top: 1000,
                right: 1000,
                bottom: 1000,
                left: 1000,
              },
            },
          },
        },
      ],
    });
  };

  // Download Answer Key as DOCX
  const handleDocxDownload = () => {
    if (correctAnswers.length === 0) {
      showPopup('No answer key available for download.');
      return;
    }

    const doc = createDocument();

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `AnswerKey_${new Date().toISOString().split('T')[0]}.docx`);
    });
  };

  // Generate and download PDF
  const handlePdfExport = () => {
    if (correctAnswers.length === 0) {
      showPopup('No answer key available for download.');
      return;
    }

    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(22);
    doc.setTextColor(0, 100, 0); // Dark green color
    doc.text("ANSWER KEY", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 
             doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
    
    let yPos = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // Add header row
    doc.setFillColor(46, 125, 50); // Green color
    doc.setDrawColor(46, 125, 50);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.rect(margin, yPos, contentWidth, 10, 'F');
    doc.text("#", margin + 5, yPos + 7);
    doc.text("Question", margin + 20, yPos + 7);
    doc.text("Correct Answer", pageWidth - margin - 40, yPos + 7);
    
    yPos += 15;
    
    // Add answers
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    
    filteredAnswers.forEach((answer, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        
        // Add page number at the bottom
        doc.setFontSize(8);
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, margin, pageHeight - 10);
      }
      
      // Draw background for alternating rows
      if (index % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, yPos - 5, contentWidth, 20, 'F');
      }
      
      // Question number
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`${index + 1}`, margin + 5, yPos);
      
      // Question text (may need to split long text)
      const questionText = stripHtmlTags(answer.question);
      const splitQuestion = doc.splitTextToSize(questionText, contentWidth - 70);
      doc.text(splitQuestion, margin + 20, yPos);
      
      // Make room for multiple lines if needed
      const lineHeight = splitQuestion.length * 5;
      
      // Correct answer
      doc.setTextColor(46, 125, 50);
      doc.setFillColor(232, 245, 233);
      doc.rect(pageWidth - margin - 45, yPos - 3, 40, 8, 'F');
      doc.text(stripHtmlTags(answer.correctOption), pageWidth - margin - 40, yPos);
      
      yPos += Math.max(lineHeight, 15);
    });
    
    // Add page number on the last page
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, margin, pageHeight - 10);
    
    // Save the PDF
    doc.save(`AnswerKey_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Handle download based on selected format
  const handleDownload = () => {
    if (exportFormat === 'pdf') {
      handlePdfExport();
    } else {
      handleDocxDownload();
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <h1 className="text-3xl font-bold">Answer Key</h1>
            <p className="mt-2 opacity-90">View and export the correct answers for your question paper</p>
          </div>
          
          {/* Search and Export Controls */}
          <div className="p-6 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Search questions or answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setExportFormat('docx')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                    exportFormat === 'docx' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 rounded-l-lg focus:z-10 focus:ring-2 focus:ring-green-500 focus:text-green-600`}
                >
                  <FaFileWord className="mr-2" />
                  DOCX
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('pdf')}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                    exportFormat === 'pdf' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } border border-gray-300 rounded-r-lg focus:z-10 focus:ring-2 focus:ring-green-500 focus:text-green-600`}
                >
                  <FaFilePdf className="mr-2" />
                  PDF
                </button>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={correctAnswers.length === 0}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <FaFileDownload className="mr-2" />
                Export
              </button>
            </div>
          </div>
          
          {/* Answer Key Content */}
          <div className="p-6">
            {correctAnswers.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-12 bg-gray-100 p-3 rounded-lg mb-4 font-medium">
                  <div className="col-span-1">#</div>
                  <div className="col-span-9">Question</div>
                  <div className="col-span-2">Answer</div>
                </div>
                
                <motion.div 
                  className="space-y-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredAnswers.map((answer, index) => (
                    <motion.div 
                      key={index} 
                      variants={itemVariants}
                      className="grid grid-cols-12 border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="col-span-1 flex items-center justify-center font-medium text-gray-500">
                        {index + 1}
                      </div>
                      <div className="col-span-9 pr-4">{stripHtmlTags(answer.question)}</div>
                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full">
                          <FaCheckCircle className="mr-1 text-green-600" />
                          {stripHtmlTags(answer.correctOption)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FaFileDownload className="text-gray-300 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No answers available.</p>
              </div>
            )}
          </div>
          
          {/* Bottom actions */}
          <div className="bg-gray-50 p-6 border-t">
            <button
              onClick={() => navigate('/final-paper', { state: { finalPaper, correctAnswers } })}
              className="flex items-center mx-auto px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2" />
              Back to Final Paper
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AnswerKeyPage;