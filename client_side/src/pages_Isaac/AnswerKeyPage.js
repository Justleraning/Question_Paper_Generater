import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { motion } from 'framer-motion';
import { FaFileDownload, FaArrowLeft, FaSearch, FaCheckCircle, FaFilePdf, FaFileWord } from 'react-icons/fa';

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

  // Download Answer Key
  const handleDownload = () => {
    if (correctAnswers.length === 0) {
      alert('No answer key available for download.');
      return;
    }

    const doc = createDocument();

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `AnswerKey_${new Date().toISOString().split('T')[0]}.docx`);
    });
  };

  // Handles PDF export (placeholder - would need PDF library integration)
  const handlePdfExport = () => {
    alert('PDF export functionality would be implemented here with an appropriate PDF library.');
    // In a real implementation, you would use a library like pdfmake or jsPDF
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
                onClick={exportFormat === 'pdf' ? handlePdfExport : handleDownload}
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