import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from "../../Contexts/AuthContext.js";
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, ArrowLeft, Download, Edit, Save, X, ArrowUpCircle } from 'lucide-react';
import { 
  getAllOpenPapers, 
  getOpenPaperById, 
  deleteOpenPaper,
  saveCompletedPaper,
  updatePaperStatus 
} from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/image.png'; // Adjust path as needed

export function OpenElectiveSide() {
  const { authState } = useAuth(); // Get auth state
  const isAdmin = authState?.user?.role === "Admin" || authState?.user?.role === "SuperAdmin";
  
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    course: '',
    paperType: '',
    subjectName: '',
    status: ''
  });
  const [showPreview, setShowPreview] = useState(false);
  const [currentPaper, setCurrentPaper] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuestions, setEditedQuestions] = useState([]);
  const paperRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        setLoading(true);
        const response = await getAllOpenPapers();
        
        if (Array.isArray(response)) {
          setPapers(response);
          setFilteredPapers(response);
          console.log("✅ Fetched open papers:", response);
        } else {
          console.error("❌ Unexpected response format:", response);
          setPapers([]);
          setFilteredPapers([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching papers:", err);
        setError("Failed to load question papers. Please try again later.");
        setLoading(false);
      }
    };

    fetchPapers();
  }, []);

  // Helper function to strip HTML tags and properly decode HTML entities
  const stripHtmlTags = (input) => {
    if (!input) return "";
    
    // Create a temporary element to properly decode HTML entities
    const tempElement = document.createElement('div');
    tempElement.innerHTML = input;
    
    // Get the text content which automatically removes HTML tags and decodes entities
    return tempElement.textContent || tempElement.innerText || "";
  };

  // View/Preview Paper - Show only the paper without edit capability
  const viewPaper = async (paper) => {
    try {
      // Get full paper details
      const paperDetails = await getOpenPaperById(paper._id);
      setCurrentPaper(paperDetails);
      setEditedQuestions(paperDetails.questions || []); // Initialize the edited questions
      setShowPreview(true);
      setIsEditing(false); // Ensure edit mode is off
      
      // Scroll to top when preview is shown
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("❌ Error viewing paper:", error);
      setError("Failed to load paper details. Please try again.");
    }
  };

  // Edit Paper - Directly show paper in edit mode
  const editPaper = async (paper) => {
    try {
      // Get full paper details
      const paperDetails = await getOpenPaperById(paper._id);
      setCurrentPaper(paperDetails);
      setEditedQuestions(paperDetails.questions || []); // Initialize the edited questions
      setShowPreview(true);
      setIsEditing(true); // Automatically enter edit mode
      
      // Scroll to top when preview is shown
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("❌ Error editing paper:", error);
      setError("Failed to load paper details for editing. Please try again.");
    }
  };

  // Delete Paper
  const handleDeletePaper = async (paper) => {
    if (!window.confirm(`Are you sure you want to delete this paper: ${paper.title || paper.subjectName}?`)) {
      return;
    }
    
    try {
      await deleteOpenPaper(paper._id);
      
      // Update state to remove the deleted paper
      setPapers(papers.filter(p => p._id !== paper._id));
      setFilteredPapers(filteredPapers.filter(p => p._id !== paper._id));
      
      alert("Paper deleted successfully!");
    } catch (error) {
      console.error("❌ Error deleting paper:", error);
      setError("Failed to delete paper. Please try again.");
    }
  };

  // Send for Approval
  const sendForApproval = async (paper) => {
    try {
      const currentStatus = paper.status || 'Draft';
      let newStatus;
      
      if (currentStatus === 'Draft') {
        newStatus = 'Submitted';
        if (!window.confirm(`Are you sure you want to submit "${paper.title || paper.subjectName}" for approval? Once submitted, you cannot edit it until it's approved or rejected.`)) {
          return;
        }
      } else if (currentStatus === 'Submitted') {
        newStatus = 'Approved';
        if (!window.confirm(`Are you sure you want to approve "${paper.title || paper.subjectName}"? This action represents approval from higher authority.`)) {
          return;
        }
      } else if (currentStatus === 'Approved') {
        alert("This paper is already approved.");
        return;
      } else if (currentStatus === 'Rejected') {
        newStatus = 'Submitted';
        if (!window.confirm(`Are you sure you want to resubmit "${paper.title || paper.subjectName}" for approval?`)) {
          return;
        }
      }
      
      // Call API to update paper status
      await updatePaperStatus(paper._id, newStatus);
      
      // Update state to reflect the new status
      const updatedPapers = papers.map(p => 
        p._id === paper._id ? { ...p, status: newStatus } : p
      );
      
      setPapers(updatedPapers);
      setFilteredPapers(filteredPapers.map(p => 
        p._id === paper._id ? { ...p, status: newStatus } : p
      ));
      
      alert(`Paper status changed to ${newStatus}!`);
    } catch (error) {
      console.error("❌ Error updating paper status:", error);
      setError("Failed to update paper status. Please try again.");
    }
  };

  // Reject Paper
  const rejectPaper = async (paper) => {
    if (paper.status !== 'Submitted') {
      alert("Only submitted papers can be rejected.");
      return;
    }
    
    const reason = window.prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User cancelled
    
    try {
      // Call API to update paper status
      await updatePaperStatus(paper._id, 'Rejected', reason);
      
      // Update state to reflect the new status
      const updatedPapers = papers.map(p => 
        p._id === paper._id ? { ...p, status: 'Rejected', rejectionReason: reason } : p
      );
      
      setPapers(updatedPapers);
      setFilteredPapers(filteredPapers.map(p => 
        p._id === paper._id ? { ...p, status: 'Rejected', rejectionReason: reason } : p
      ));
      
      alert("Paper has been rejected.");
    } catch (error) {
      console.error("❌ Error rejecting paper:", error);
      setError("Failed to reject paper. Please try again.");
    }
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

  // Download Paper
  const downloadPaper = async (paper) => {
    try {
      // If in preview mode, use the current paper, otherwise fetch it
      const paperToDownload = showPreview ? currentPaper : await getOpenPaperById(paper._id);
      setIsGeneratingPDF(true);
      
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
          
          // Clean up
          document.body.removeChild(tempDiv);
          setIsGeneratingPDF(false);
        });
      } else {
        // Fallback if no HTML snapshot
        navigate('/final-paper', { 
          state: { 
            finalPaper: paperToDownload.questions,
            fromOpenPapers: true,
            downloadPDF: true,
            subjectDetails: {
              id: paperToDownload.subject,
              name: paperToDownload.subjectName,
              code: paperToDownload.subjectCode
            }
          } 
        });
        setIsGeneratingPDF(false);
      }
    } catch (error) {
      console.error("❌ Error downloading paper:", error);
      setError("Failed to download paper. Please try again.");
      setIsGeneratingPDF(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // Discard changes and exit edit mode
      setEditedQuestions(currentPaper.questions || []);
    }
    setIsEditing(!isEditing);
  };

  // Handle question text edit using contentEditable
  const handleQuestionEdit = (index, field, value) => {
    const updatedQuestions = [...editedQuestions];
    
    if (field === 'text') {
      updatedQuestions[index].text = value;
    } else if (field === 'option') {
      // Check if options is an array or object
      const [optionIndex, optionValue] = value;
      if (Array.isArray(updatedQuestions[index].options)) {
        updatedQuestions[index].options[optionIndex] = optionValue;
      } else {
        // Handle object format options
        const optionKey = String.fromCharCode(65 + optionIndex);
        updatedQuestions[index].options[optionKey] = optionValue;
      }
    }
    
    setEditedQuestions(updatedQuestions);
  };
  
  // Save edited questions
  const saveEdits = async () => {
    try {
      if (!currentPaper || !currentPaper._id) {
        throw new Error("Cannot save: Paper ID is missing");
      }
      
      // Create updated paper object
      const updatedPaper = {
        ...currentPaper,
        questions: editedQuestions
      };
      
      // Call API to update the paper using saveCompletedPaper function
      await saveCompletedPaper(updatedPaper);
      
      // Update the current paper with edited questions
      setCurrentPaper(updatedPaper);
      
      // Exit edit mode
      setIsEditing(false);
      
      alert("Paper updated successfully!");
    } catch (error) {
      console.error("❌ Error saving paper:", error);
      setError("Failed to save changes. Please try again.");
    }
  };

  // Close preview and return to list view
  const closePreview = () => {
    setShowPreview(false);
    setCurrentPaper(null);
    setIsEditing(false);
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (field) => {
    if (!papers || papers.length === 0) return [];
    
    const values = [...new Set(papers.map(paper => paper[field]))].filter(Boolean);
    return values;
  };

  // Get the status badge color
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render the paper preview
  const renderPaperPreview = () => {
    if (!currentPaper) return null;

    const currentDate = new Date().toLocaleDateString();
    const questions = isEditing ? editedQuestions : currentPaper.questions;
    
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Top action bar */}
        <div className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <button 
            onClick={closePreview}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Papers
          </button>
          
          <div className="flex space-x-4">
            {/* Status indicator */}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(currentPaper.status || 'Draft')}`}>
              {currentPaper.status || 'Draft'}
            </span>
            
            {isEditing ? (
              <>
                <button
                  onClick={saveEdits}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600"
                  disabled={currentPaper.status === 'Submitted' || currentPaper.status === 'Approved'}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
                <button
                  onClick={toggleEditMode}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-gray-600"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => downloadPaper(currentPaper)}
                  disabled={isGeneratingPDF}
                  className={`bg-green-500 text-white px-4 py-2 rounded-lg flex items-center ${
                    isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-600'
                  }`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </button>
                
                {/* Only show Edit button for Draft papers */}
                {currentPaper.status === 'Draft' && (
                  <button
                    onClick={toggleEditMode}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                )}
                
                {/* Send for Approval - only for teachers with Draft/Rejected papers */}
                {!isAdmin && (currentPaper.status === 'Draft' || currentPaper.status === 'Rejected') && (
                  <button
                    onClick={() => sendForApproval(currentPaper)}
                    className="bg-purple-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-600"
                  >
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Send for Approval
                  </button>
                )}
                
                {/* Approve - only for admins with Submitted papers */}
                {isAdmin && currentPaper.status === 'Submitted' && (
                  <>
                    <button
                      onClick={() => sendForApproval(currentPaper)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => rejectPaper(currentPaper)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Rejection reason if applicable */}
        {currentPaper.status === 'Rejected' && currentPaper.rejectionReason && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <div className="flex">
              <div>
                <p className="text-sm text-red-700 font-medium">Rejection Reason:</p>
                <p className="text-sm text-red-700 mt-1">{currentPaper.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
        
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
            {questions && questions.map((question, index) => (
              <div key={index} className="mb-6 text-left">
                {isEditing ? (
                  <div className="mb-4">
                    <div 
                      className="font-medium break-words border border-blue-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => handleQuestionEdit(index, 'text', e.target.innerText)}
                      dangerouslySetInnerHTML={{ __html: question.text }}
                    />

                    {/* Options editing - directly editable spans */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-6">
                      {Array.isArray(question.options) ? (
                        question.options.map((option, i) => (
                          <div key={`edit-option-${index}-${i}`} className="flex">
                            <span className="mr-2 font-medium">{String.fromCharCode(65 + i)}.</span>
                            <div 
                              className="flex-1 border border-gray-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleQuestionEdit(index, 'option', [i, e.target.innerText])}
                              dangerouslySetInnerHTML={{ __html: option }}
                            />
                          </div>
                        ))
                      ) : (
                        Object.entries(question.options || {}).map(([key, value], i) => (
                          <div key={`edit-option-${index}-${key}`} className="flex">
                            <span className="mr-2 font-medium">{key}.</span>
                            <div 
                              className="flex-1 border border-gray-300 p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              contentEditable
                              suppressContentEditableWarning
                              onBlur={(e) => handleQuestionEdit(index, 'option', [i, e.target.innerText])}
                              dangerouslySetInnerHTML={{ __html: value }}
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <>
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
                  </>
                )}
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
        <div className="text-xl font-medium text-gray-600">Loading papers...</div>
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
          <h1 className="text-3xl font-bold text-gray-800">Open Elective Question Papers</h1>
          <button 
            onClick={() => navigate('/question-generator')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Paper
          </button>
        </div>
  
        {/* Filters */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <option value="Internal Assessment">Internal Assessment</option>
          </select>
  
          <input 
            type="text"
            name="subjectName"
            value={filters.subjectName}
            onChange={handleFilterChange}
            placeholder="Search by subject name..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
  
          <select 
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
  
        {/* Papers List */}
        {filteredPapers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-xl text-gray-600">No papers found matching your criteria.</p>
            <p className="text-gray-500 mt-2">Try adjusting your filters or create a new paper.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredPapers.map((paper) => (
              <div 
                key={paper._id} 
                className="bg-white shadow-md rounded-lg p-4 flex items-center justify-between"
              >
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
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(paper.status || 'Draft')}`}
                      >
                        {paper.status || 'Draft'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {paper.totalMarks} marks
                      </span>
                      <span className="text-xs text-gray-500">
                        {paper.questions?.length || 0} questions
                      </span>
                      {paper.status === 'Rejected' && paper.rejectionReason && (
                        <span className="text-xs text-red-600">
                          Rejected: {paper.rejectionReason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {/* Approval workflow buttons with role-based conditions */}
                  
                  {/* Send for Approval - only show to teachers for Draft/Rejected papers */}
                  {!isAdmin && (paper.status === 'Draft' || paper.status === 'Rejected') && (
                    <button 
                      onClick={() => sendForApproval(paper)}
                      className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition-colors"
                      title="Send for Approval"
                    >
                      <ArrowUpCircle className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Approve/Reject buttons - only show to admins for Submitted papers */}
                  {isAdmin && paper.status === 'Submitted' && (
                    <>
                      <button 
                        onClick={() => sendForApproval(paper)}
                        className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                        title="Approve Paper"
                      >
                        <ArrowUpCircle className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => rejectPaper(paper)}
                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Reject Paper"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {/* View Paper - available to everyone */}
                  <button 
                    onClick={() => viewPaper(paper)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    title="View Paper"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {/* Edit Paper - only available for Draft papers */}
                  {paper.status === 'Draft' && (
                    <button 
                      onClick={() => editPaper(paper)}
                      className="text-yellow-500 hover:bg-yellow-50 p-2 rounded-full transition-colors"
                      title="Edit Paper"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  
                  {/* Delete Paper - only available for Draft and Rejected papers */}
                  <button 
                    onClick={() => handleDeletePaper(paper)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    title="Delete Paper"
                    disabled={paper.status !== 'Draft' && paper.status !== 'Rejected'}
                  >
                    <Trash2 className={`w-5 h-5 ${paper.status !== 'Draft' && paper.status !== 'Rejected' ? 'opacity-50 cursor-not-allowed' : ''}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Main render method to switch between preview and list views
  return showPreview ? renderPaperPreview() : renderPapersList();
}

export default OpenElectiveSide;