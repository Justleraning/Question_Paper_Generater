import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Trash2, Eye, ArrowLeft, Download } from 'lucide-react';
import { 
  getAllOpenPapers, 
  getOpenPaperById, 
  deleteOpenPaper 
} from '../../services/paperService.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import logo from '../../assets/image.png'; // Adjust path as needed

export function OpenElectiveSide() {
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

  // Helper function to strip HTML tags
  const stripHtmlTags = (input) => {
    if (!input) return "";
    
    // First decode any HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = input;
    const decodedInput = textarea.value;
    
    // Then remove any HTML tags
    return decodedInput.replace(/<[^>]*>/g, "").trim();
  };

  // View/Preview Paper
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

  // Close preview and return to list view
  const closePreview = () => {
    setShowPreview(false);
    setCurrentPaper(null);
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
            <button
              onClick={() => downloadPaper(currentPaper)}
              disabled={isGeneratingPDF}
              className={`bg-green-500 text-white px-4 py-2 rounded-lg ${
                isGeneratingPDF ? 'opacity-70 cursor-not-allowed' : 'hover:bg-green-600'
              }`}
            >
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
            {currentPaper.questions && currentPaper.questions.map((question, index) => (
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
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
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
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold 
                          ${paper.status === 'Draft' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : paper.status === 'Published' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'}`}
                      >
                        {paper.status || 'Draft'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {paper.totalMarks} marks
                      </span>
                      <span className="text-xs text-gray-500">
                        {paper.questions?.length || 0} questions
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => viewPaper(paper)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    title="View Paper"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeletePaper(paper)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                    title="Delete Paper"
                  >
                    <Trash2 className="w-5 h-5" />
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