import { useAuth } from "../../Contexts/AuthContext.js";
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Check, X, Eye, Download, FileSearch, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { 
  getAllOpenPapers, 
  getOpenPaperById,
  updatePaperStatus 
} from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/image.png';
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
const PaperApprovals = () => {
    const { authState } = useAuth(); // Add this line
    const isAdmin = authState?.user?.role === "Admin" || authState?.user?.role === "SuperAdmin"; // Add this line
    // Rest of your existing state declarations...
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    course: '',
    paperType: '',
    subjectName: '',
  });
  const [showPreview, setShowPreview] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [paperType, setPaperType] = useState('openelective'); // Default to open elective
  const paperRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract paper type from URL query parameter
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    if (type) {
      setPaperType(type);
    }
    fetchPapers();
  }, [location.search]);

  const fetchPapers = async () => {
    try {
      setLoading(true);
      
      // For now, only implementing the open electives papers
      // In a real system, you'd have different API calls for different paper types
      let response;
      
      if (paperType === 'openelective') {
        response = await getAllOpenPapers();
      } else {
        // Mock data for other paper types - replace with actual API calls
        response = [];
        setError(`Papers for ${paperType} type are not implemented yet.`);
      }
      
      if (Array.isArray(response)) {
        // Filter only papers with 'Submitted' status
        const submittedPapers = response.filter(paper => paper.status === 'Submitted');
        setPapers(submittedPapers);
        setFilteredPapers(submittedPapers);
        console.log("✅ Fetched papers for approval:", submittedPapers);
      } else {
        console.error("❌ Unexpected response format:", response);
        setPapers([]);
        setFilteredPapers([]);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("❌ Error fetching papers:", err);
      setError("Failed to load papers for approval. Please try again later.");
      setLoading(false);
    }
  };

  const getPaperTypeName = () => {
    switch(paperType) {
      case 'entrance':
        return 'Entrance Exam';
      case 'midsem':
        return 'Mid Semester';
      case 'endsem':
        return 'End Semester';
      case 'openelective':
        return 'Open Elective';
      default:
        return 'Papers';
    }
  };

  // Helper function to strip HTML tags and properly decode HTML entities
  const stripHtmlTags = (input) => {
    if (!input) return "";
    
    // Create a temporary element to properly decode HTML entities
    const tempElement = document.createElement('div');
    tempElement.innerHTML = input;
    
    // Get the text content which automatically removes HTML tags and decodes entities
    return tempElement.textContent || tempElement.innerText || "";
  };

  // View Paper for Review
  const viewPaper = async (paper) => {
    try {
      // Get full paper details
      const paperDetails = await getOpenPaperById(paper._id);
      setCurrentPaper(paperDetails);
      setShowPreview(true);
      
      // Scroll to top when preview is shown
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("❌ Error viewing paper:", error);
      setError("Failed to load paper details. Please try again.");
    }
  };

  // Approve Paper
  const approvePaper = async (paper) => {
    try {
      await updatePaperStatus(paper._id, 'Approved');
      
      // Refresh the papers list
      fetchPapers();
      
      // If in preview mode, close it
      if (showPreview && currentPaper?._id === paper._id) {
        setShowPreview(false);
        setCurrentPaper(null);
      }
      
      showPopup("Paper approved successfully!");
    } catch (error) {
      console.error("❌ Error approving paper:", error);
      setError("Failed to approve paper. Please try again.");
    }
  };

  // Open rejection modal
  const openRejectModal = (paper) => {
    setCurrentPaper(paper);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  // Reject Paper
  const rejectPaper = async () => {
    if (!currentPaper) return;
    
    if (!rejectionReason.trim()) {
      showPopup("Please provide a reason for rejection.");
      return;
    }
    
    try {
      await updatePaperStatus(currentPaper._id, 'Rejected', rejectionReason);
      
      // Close modal
      setShowRejectionModal(false);
      
      // Refresh the papers list
      fetchPapers();
      
      // If in preview mode, close it
      if (showPreview) {
        setShowPreview(false);
        setCurrentPaper(null);
      }
      
      showPopup("Paper rejected successfully!");
    } catch (error) {
      console.error("❌ Error rejecting paper:", error);
      setError("Failed to reject paper. Please try again.");
    }
  };

  // Download Paper as PDF
  const downloadPaper = async (paper) => {
    try {
      setIsGeneratingPDF(true);
      
      // Get full paper details if not in preview mode
      const paperToDownload = showPreview ? currentPaper : await getOpenPaperById(paper._id);
      
      if (paperRef.current && showPreview) {
        // If we're in preview mode, use the current DOM element
        html2canvas(paperRef.current, { 
          scale: 2,
          logging: false,
          useCORS: true
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // A4 dimensions in mm
          const pdfWidth = 210;
          const pdfHeight = 297;
          
          // Calculate image dimensions
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Add multi-page support if needed
          let heightLeft = imgHeight;
          let position = 0;
          let pageNumber = 1;
          
          // First page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          
          // Additional pages if needed
          while (heightLeft > 0) {
            position = -pdfHeight * pageNumber;
            pageNumber++;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
          
          pdf.save(`${paperToDownload.subjectName || 'Question'}_Paper.pdf`);
          setIsGeneratingPDF(false);
        });
      } else if (paperToDownload.htmlSnapshot) {
        // If we have HTML snapshot but not in preview mode
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = paperToDownload.htmlSnapshot;
        document.body.appendChild(tempDiv);
        
        const element = tempDiv.firstChild;
        
        html2canvas(element, { 
          scale: 2,
          logging: false,
          useCORS: true
        }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          // A4 dimensions
          const pdfWidth = 210;
          const pdfHeight = 297;
          
          // Calculate dimensions
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          // Multi-page support
          let heightLeft = imgHeight;
          let position = 0;
          let pageNumber = 1;
          
          // First page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          
          // Additional pages if needed
          while (heightLeft > 0) {
            position = -pdfHeight * pageNumber;
            pageNumber++;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
          
          pdf.save(`${paperToDownload.subjectName || 'Question'}_Paper.pdf`);
          
          // Clean up
          document.body.removeChild(tempDiv);
          setIsGeneratingPDF(false);
        });
      } else {
        setIsGeneratingPDF(false);
        showPopup("No paper content available to download.");
      }
    } catch (error) {
      console.error("❌ Error downloading paper:", error);
      setError("Failed to download paper. Please try again.");
      setIsGeneratingPDF(false);
    }
  };

  // Close preview and return to list view
  const closePreview = () => {
    setShowPreview(false);
    setCurrentPaper(null);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    
    // Update the filters state
    setFilters({
      ...filters,
      [name]: value
    });
    
    // Apply filters
    let filtered = [...papers];
    
    // Apply all active filters
    Object.entries({ ...filters, [name]: value }).forEach(([filterName, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(paper => {
          if (filterName === 'subjectName') {
            return paper.subjectName?.toLowerCase().includes(filterValue.toLowerCase());
          }
          return paper[filterName] === filterValue;
        });
      }
    });
    
    setFilteredPapers(filtered);
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    if (!papers || papers.length === 0) return [];
    
    const values = [...new Set(papers.map(paper => paper[field]))].filter(Boolean);
    return values;
  };

  // Render the paper preview
  const renderPaperPreview = () => {
    if (!currentPaper) return null;

    const currentDate = new Date().toLocaleDateString();
    const questions = currentPaper.questions || [];
    
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top action bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <button 
            onClick={closePreview}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <X className="w-5 h-5 mr-2" />
            Close Preview
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={() => approvePaper(currentPaper)}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </button>
            
            <button
              onClick={() => openRejectModal(currentPaper)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </button>
            
            <button
              onClick={() => downloadPaper(currentPaper)}
              disabled={isGeneratingPDF}
              className={`bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center ${
                isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        </div>
        
        {/* Paper content */}
        <div className="flex-1 overflow-auto p-4 flex flex-col items-center">
          <div
            ref={paperRef}
            className="w-full max-w-3xl border p-6 bg-white mb-6 shadow-md"
          >
            {/* Header with logo and registration box */}
            <div className="flex justify-between items-start mb-2">
              {/* Logo on left */}
              <div className="w-24 h-24">
                <img src={logo} alt="University Logo" className="w-full h-full" />
              </div>
              
              {/* Registration box on right */}
              <div className="border border-gray-400 p-2 text-xs w-40">
                <p className="font-medium">Registration Number:</p>
                <p className="font-medium mt-1">Date & Session: {currentDate}</p>
              </div>
            </div>

            {/* University information centered */}
            <div className="text-center">
              <h2 className="text-sm font-bold">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h2>
              <h3 className="text-sm font-bold">Course : {currentPaper.course || 'BCA'}</h3>
              <h3 className="text-sm font-bold uppercase mt-1">SEMESTER EXAMINATION</h3>
              <h4 className="text-sm font-bold mt-1">
                {currentPaper.subjectCode || ""}: {currentPaper.subjectName || ""}
              </h4>
              <p className="text-xs italic mt-1">( For current batch students only )</p>
            </div>
            
            {/* Time and marks section */}
            <div className="flex justify-between items-center mt-4 mb-3 text-center">
              <p className="text-xs font-medium w-1/4">Time: 1 Hours</p>
              <p className="text-xs font-medium w-1/2">This paper contains MCQ Questions</p>
              <p className="text-xs font-medium w-1/4">Max Marks: {currentPaper.totalMarks || '20'}</p>
            </div>

            {/* Part A section heading - centered */}
            <p className="mb-3 font-medium text-center text-sm">Answer all questions</p>
          
            {/* Questions section */}
            {questions.map((question, index) => (
              <div key={index} className="mb-6 text-left">
                <p className="font-medium break-words">
                  {index + 1}. {stripHtmlTags(question.text)}
                </p>

                {/* Options display with proper handling for both array and object formats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-6">
                  {Array.isArray(question.options) ? (
                    question.options.map((option, i) => (
                      <div key={`option-${index}-${i}`}>
                        <p className="break-words">
                          {String.fromCharCode(65 + i)}. {stripHtmlTags(option)}
                        </p>
                      </div>
                    ))
                  ) : (
                    Object.entries(question.options || {}).map(([key, value]) => (
                      <div key={`option-${index}-${key}`}>
                        <p className="break-words">
                          {key}. {stripHtmlTags(value)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render the papers list view
  const renderPapersList = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-medium text-gray-600">Loading papers for approval...</div>
      </div>
    );
  
    if (error) return (
      <div className="flex items-center justify-center h-64">
        <div className="text-xl font-medium text-red-600">{error}</div>
      </div>
    );
  
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{getPaperTypeName()} Approvals</h1>
          </div>
          <div className="text-sm bg-blue-100 text-blue-800 p-2 rounded-md">
            <p className="flex items-center">
              <FileSearch className="w-4 h-4 mr-1" />
              {filteredPapers.length} papers requiring approval
            </p>
          </div>
        </div>
  
        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            name="course"
            value={filters.course}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Courses</option>
            {getUniqueValues('course').map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
  
          <select 
            name="paperType"
            value={filters.paperType}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Paper Types</option>
            <option value="Mid Sem">Mid Sem</option>
            <option value="End Sem">End Sem</option>
            
          </select>
  
          <input 
            type="text"
            name="subjectName"
            value={filters.subjectName}
            onChange={handleFilterChange}
            placeholder="Search by subject name..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
  
        {/* Papers List */}
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600">No papers are currently awaiting approval.</p>
            <p className="text-gray-500 mt-2">When faculty members submit papers for approval, they will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPapers.map((paper) => (
              <div 
                key={paper._id} 
                className="bg-white shadow-md rounded-lg p-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex justify-between">
                  <div className="flex items-center space-x-4">
                    <FileText className="text-blue-500 w-10 h-10" />
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800">
                        {paper.title || `${paper.subjectName} Paper`}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {paper.subjectCode ? `${paper.subjectCode} | ` : ''}{paper.subjectName} | {paper.paperType}
                      </p>
                      <div className="flex items-center mt-1 space-x-2">
                        <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                          Submitted
                        </span>
                        <span className="text-xs text-gray-500">
                          {paper.totalMarks} marks
                        </span>
                        <span className="text-xs text-gray-500">
                          {paper.questions?.length || 0} questions
                        </span>
                        <span className="text-xs text-gray-500">
                          Submitted: {new Date(paper.submittedAt || paper.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => viewPaper(paper)}
                      className="text-blue-500 hover:bg-blue-100 p-2 rounded-full transition-colors"
                      title="Preview Paper"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => approvePaper(paper)}
                      className="text-green-500 hover:bg-green-100 p-2 rounded-full transition-colors"
                      title="Approve Paper"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => openRejectModal(paper)}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                      title="Reject Paper"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render rejection modal
  const renderRejectionModal = () => {
    if (!showRejectionModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">Reject Paper</h2>
          <p className="mb-2">Please provide a reason for rejecting <strong>{currentPaper?.title || currentPaper?.subjectName}</strong>:</p>
          
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="w-full p-2 border rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter rejection reason..."
          ></textarea>
          
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowRejectionModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={rejectPaper}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              disabled={!rejectionReason.trim()}
            >
              Reject Paper
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {showPreview ? renderPaperPreview() : renderPapersList()}
      {renderRejectionModal()}
    </>
  );
};

export default PaperApprovals;