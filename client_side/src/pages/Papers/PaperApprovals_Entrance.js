import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, XCircle, ChevronDown, ChevronRight, Eye, Filter, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingPapers, 
  approvePaper, 
  rejectPaper
} from '../../services/paperService.js';

const EntranceAdminApprovalPage = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(null);
  
  // Filters state
  const [filters, setFilters] = useState({
    courseName: '',
    customSubjectName: ''
  });
  
  // Show filters UI
  const [showFilters, setShowFilters] = useState(false);
  
  // Unique courses and subjects lists for filter dropdowns
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [uniqueSubjects, setUniqueSubjects] = useState([]);

  // Fetch papers when component mounts or filters change
  useEffect(() => {
    fetchPendingPapers();
  }, [filters]);

  // Extract unique courses and subjects from papers
  useEffect(() => {
    if (papers && papers.length > 0) {
      const courses = [...new Set(papers.map(paper => paper.courseName))];
      const subjects = [...new Set(papers.map(paper => paper.customSubjectName).filter(Boolean))];
      
      setUniqueCourses(courses);
      setUniqueSubjects(subjects);
    }
  }, [papers]);

  // Function to fetch pending papers
  const fetchPendingPapers = async () => {
    try {
      setLoading(true);
      const response = await getPendingPapers(filters);
      
      if (response && response.success && response.papers) {
        setPapers(response.papers);
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.error('Error fetching pending papers:', err);
      setError('Failed to load papers. Please try again.');
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      courseName: '',
      customSubjectName: ''
    });
  };

  // Toggle expanded view for a paper
  const toggleExpandPaper = (paperId) => {
    setExpandedPaper(expandedPaper === paperId ? null : paperId);
  };

  // View paper details
  const handleViewPaper = (paperId, event) => {
    if (event) event.stopPropagation();
    navigate(`/papers/view/${paperId}`);
  };

  // Approve paper
  const handleApprovePaper = async (paperId, event) => {
    if (event) event.stopPropagation();
    
    try {
      setLoading(true);
      const result = await approvePaper(paperId);
      
      if (result && result.success) {
        setNotification('Paper approved successfully!');
        // Refresh papers list
        fetchPendingPapers();
      } else {
        setError(result?.message || 'Failed to approve paper.');
      }
    } catch (err) {
      console.error('Error approving paper:', err);
      setError('An error occurred while approving the paper.');
    } finally {
      setLoading(false);
    }
    
    setTimeout(() => setNotification(null), 3000);
  };

  // Show reject dialog
  const openRejectDialog = (paperId, event) => {
    if (event) event.stopPropagation();
    setShowRejectDialog(paperId);
    setRejectReason('');
  };

  // Close reject dialog
  const closeRejectDialog = () => {
    setShowRejectDialog(null);
    setRejectReason('');
  };

  // Reject paper
  const handleRejectPaper = async (paperId) => {
    // Validate rejection reason
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection.');
      return;
    }
    
    try {
      setLoading(true);
      const result = await rejectPaper(paperId, rejectReason);
      
      if (result && result.success) {
        setNotification('Paper rejected successfully!');
        // Close dialog and refresh papers list
        closeRejectDialog();
        fetchPendingPapers();
      } else {
        setError(result?.message || 'Failed to reject paper.');
      }
    } catch (err) {
      console.error('Error rejecting paper:', err);
      setError('An error occurred while rejecting the paper.');
    } finally {
      setLoading(false);
    }
    
    setTimeout(() => setNotification(null), 3000);
  };

  // Count questions by subject
  const countSubjectQuestions = (questions) => {
    const counts = {};
    if (!questions || !Array.isArray(questions)) return counts;
    
    questions.forEach(question => {
      const subject = question.subject || 'Unknown';
      counts[subject] = (counts[subject] || 0) + 1;
    });
    
    return counts;
  };

  // Format date string
  const formatDate = (dateString) => {
    try {
      // Check if date is valid before formatting
      if (!dateString) return 'N/A';
      
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString();
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Papers Pending Approval</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-1"
          >
            <Filter size={18} />
            <span>Filters</span>
            {(filters.courseName || filters.customSubjectName) && (
              <span className="ml-1 bg-blue-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Filter Papers</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Name
              </label>
              <select
                name="courseName"
                value={filters.courseName}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                name="customSubjectName"
                value={filters.customSubjectName}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="w-full mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded flex justify-between items-center">
          <span>{notification}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-blue-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="w-full mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-red-700 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Papers List */}
          {papers.length > 0 ? (
            <div className="grid gap-4">
              {papers.map((paper) => {
                const questionCounts = countSubjectQuestions(paper.questions);
                const hasSubjects = Object.keys(questionCounts).length > 0;
                const totalQuestions = paper.questions?.length || 0;
                return (
                <div 
                  key={paper._id} 
                  className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Paper Header - Always visible */}
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer border-b"
                    onClick={() => toggleExpandPaper(paper._id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <FileText className="text-yellow-500 w-7 h-7" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {paper.courseName}
                          {paper.customSubjectName && ` - ${paper.customSubjectName}`}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">
                            {paper.totalMarks} Marks
                          </span>
                          <span className="inline-flex items-center bg-green-100 text-green-800 px-2 py-1 rounded">
                            {totalQuestions} Questions
                          </span>
                          <span className="ml-2 inline-flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            Pending Approval
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <p className="text-sm text-gray-500">
                          Created: {formatDate(paper.date || paper.createdAt)}
                        </p>
                        <p className="text-sm text-gray-500">
                          By: {paper.createdBy?.name || 'Unknown'}
                        </p>
                      </div>
                      <div className="text-gray-400">
                        {expandedPaper === paper._id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded View */}
                  {expandedPaper === paper._id && (
                    <div className="p-4 bg-gray-50 border-b">
                      {/* Paper Details */}
                      <div className="mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Course</h3>
                            <p className="font-semibold">{paper.courseName}</p>
                          </div>
                          {paper.customSubjectName && (
                            <div className="bg-white p-3 rounded border">
                              <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                              <p className="font-semibold">{paper.customSubjectName}</p>
                            </div>
                          )}
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Total Marks</h3>
                            <p className="font-semibold">{paper.totalMarks}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Exam Time</h3>
                            <p className="font-semibold">{paper.examTime || 1} Hours</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Created On</h3>
                            <p className="font-semibold">{formatDate(paper.date || paper.createdAt)}</p>
                          </div>
                          <div className="bg-white p-3 rounded border">
                            <h3 className="text-sm font-medium text-gray-500">Created By</h3>
                            <p className="font-semibold">{paper.createdBy?.name || 'Unknown'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Subject breakdown */}
                      {hasSubjects && (
                        <div className="mb-4">
                          <h3 className="text-md font-semibold mb-2">Question Distribution</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {Object.entries(questionCounts).map(([subject, count]) => (
                              <div key={subject} className="bg-white px-3 py-2 rounded border flex justify-between">
                                <span className="text-gray-700">{subject}</span>
                                <span className="font-semibold">{count} questions</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* View All Questions Button */}
                      {paper.questions && paper.questions.length > 0 && (
                        <div className="mb-4 text-center">
                          <button 
                            onClick={(e) => handleViewPaper(paper._id, e)}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                          >
                            View all {paper.questions.length} questions
                          </button>
                        </div>
                      )}
                      
                      {/* Approval/Rejection Actions */}
                      <div className="flex justify-center gap-4 mt-6">
                        <button
                          onClick={(e) => handleApprovePaper(paper._id, e)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          <span>Approve Paper</span>
                        </button>
                        
                        <button
                          onClick={(e) => openRejectDialog(paper._id, e)}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                        >
                          <XCircle size={18} />
                          <span>Reject Paper</span>
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons (always visible) */}
                  <div className="flex items-center justify-end gap-1 p-3 bg-gray-50 border-t">
                    <button 
                      onClick={(e) => handleViewPaper(paper._id, e)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={(e) => handleApprovePaper(paper._id, e)}
                      className="text-green-500 hover:bg-green-50 p-2 rounded-full transition-colors"
                      title="Approve"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    
                    <button
                      onClick={(e) => openRejectDialog(paper._id, e)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Reject"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 mb-4">No papers pending approval.</p>
              {Object.values(filters).some(Boolean) ? (
                <button 
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mx-auto"
                >
                  Clear Filters
                </button>
              ) : (
                <p className="text-gray-500">
                  When teachers submit papers for approval, they will appear here.
                </p>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Rejection Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Reject Paper</h3>
            <p className="mb-4 text-gray-600">
              Please provide a reason for rejecting this paper. This will be shown to the teacher.
            </p>
            
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-md mb-4"
              rows={4}
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRejectDialog}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              
              <button
                onClick={() => handleRejectPaper(showRejectDialog)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                disabled={!rejectReason.trim()}
              >
                Reject Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default  EntranceAdminApprovalPage;