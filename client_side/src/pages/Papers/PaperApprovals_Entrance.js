import React, { useState, useEffect, useRef } from 'react';
import { FileText, CheckCircle, XCircle, ChevronDown, ChevronRight, Eye, RefreshCw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  getPendingPapers, 
  approvePaper, 
  rejectPaper
} from '../../services/paperService.js';
import universityLogo from '../../assets/image.png';

const EntranceAdminApprovalPage = () => {
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expandedPaper, setExpandedPaper] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(null);
  
  // Auto-refresh setup (hidden from UI)
  const autoRefreshIntervalRef = useRef(null);
  const AUTO_REFRESH_INTERVAL = 30000; // 30 seconds refresh interval
  
  // Modal states for viewing paper
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPaper, setSelectedPaper] = useState(null);

  // Setup auto-refresh on component mount and cleanup on unmount
  useEffect(() => {
    // Initial data fetch
    fetchPendingPapers();
    
    // Setup auto-refresh interval
    startAutoRefresh();
    
    // Cleanup function to clear interval when component unmounts
    return () => {
      if (autoRefreshIntervalRef.current) {
        clearInterval(autoRefreshIntervalRef.current);
      }
    };
  }, []); // No dependencies since we removed filters

  // Function to start auto-refresh
  const startAutoRefresh = () => {
    // Clear any existing interval first
    if (autoRefreshIntervalRef.current) {
      clearInterval(autoRefreshIntervalRef.current);
    }
    
    // Set up new interval
    autoRefreshIntervalRef.current = setInterval(() => {
      if (!showViewModal && !showRejectDialog) { // Don't refresh if modals are open
        fetchPendingPapers(true); // true flag indicates it's an auto-refresh
      }
    }, AUTO_REFRESH_INTERVAL);
  };

  // Function to fetch pending papers
  const fetchPendingPapers = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) {
        setLoading(true);
      }
      
      const response = await getPendingPapers();
      
      if (response && response.success && response.papers) {
        // Check if there's a change in the papers count to show notification
        if (isAutoRefresh && papers.length !== response.papers.length && papers.length > 0) {
          const diff = response.papers.length - papers.length;
          if (diff > 0) {
            setNotification(`${diff} new paper${diff > 1 ? 's' : ''} pending approval`);
            // Play a notification sound if browser supports it
            try {
              const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');
              audio.volume = 0.5;
              audio.play();
            } catch (soundError) {
              console.log('Notification sound not supported');
            }
          }
        }
        
        setPapers(response.papers);
      } else {
        setPapers([]);
      }
    } catch (err) {
      console.error('Error fetching pending papers:', err);
      if (!isAutoRefresh) {
        setError('Failed to load papers. Please try again.');
      }
      // Don't show error for background refreshes to avoid disrupting the user
    } finally {
      if (!isAutoRefresh) {
        setLoading(false);
      }
    }
  };

  // Manual refresh button handler
  const handleManualRefresh = () => {
    fetchPendingPapers();
  };

  // Toggle expanded view for a paper
  const toggleExpandPaper = (paperId) => {
    setExpandedPaper(expandedPaper === paperId ? null : paperId);
  };

  // View paper details in a modal (changed from navigation to modal)
  const handleViewPaper = (paper, event) => {
    if (event) event.stopPropagation();
    setSelectedPaper(paper);
    setShowViewModal(true);
  };

  // Close the view modal
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedPaper(null);
  };

  // Approve paper
  const handleApprovePaper = async (paperId, event) => {
    if (event) event.stopPropagation();
    
    try {
      setLoading(true);
      const result = await approvePaper(paperId);
      
      if (result && result.success) {
        setNotification('Paper approved successfully!');
        
        // First update the local state to reflect changes immediately
        setPapers(prevPapers => prevPapers.filter(paper => paper._id !== paperId));
        
        // Then refresh data from server
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
        closeRejectDialog();
        
        // First update the local state to reflect changes immediately
        setPapers(prevPapers => prevPapers.filter(paper => paper._id !== paperId));
        
        // Then refresh data from server
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

  // Helper function to strip HTML tags
  const stripHTMLTags = (html) => {
    if (!html) return '';
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Papers Pending Approval</h1>
        
        <div className="flex items-center space-x-2">
          {/* Manual refresh button only */}
          <button
            onClick={handleManualRefresh}
            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

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
                            {paper.status || 'Pending Approval'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <p className="text-sm text-gray-500">
                        Created: {formatDate(paper.date || paper.createdAt)}
                      </p>
                      <p className="text-sm font-medium text-indigo-600">
                        By: {paper.createdBy?.username || 'Unknown'}
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
                          {/* Removed the Created By field as it's already shown in the header */}
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
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-1 p-3 bg-gray-50 border-t">
                    <button 
                      onClick={(e) => handleViewPaper(paper, e)}
                      className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                      title="View"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 mb-4">No papers pending approval.</p>
              <p className="text-gray-500">
                When teachers submit papers for approval, they will appear here.
              </p>
            </div>
          )}
        </>
      )}
      
      {/* Paper View Modal */}
      {showViewModal && selectedPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {selectedPaper.courseName}
                {selectedPaper.customSubjectName && ` - ${selectedPaper.customSubjectName}`}
              </h2>
              <div className="flex items-center gap-2">
                <button 
                  onClick={closeViewModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Paper Header */}
              <div className="text-center mb-8 pb-8 border-b">
                <div className="flex justify-center mb-4">
                  <img src={universityLogo} alt="University Logo" className="h-16" />
                </div>
                <h1 className="text-2xl font-bold mb-2">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h1>
                <h2 className="text-xl mb-4">
                  {selectedPaper.customSubjectName 
                    ? `${selectedPaper.courseName} - ${selectedPaper.customSubjectName}`
                    : selectedPaper.courseName}
                </h2>
                <p className="text-lg font-medium mb-4">SEMESTER EXAMINATION</p>
                
                <div className="flex justify-between max-w-md mx-auto mt-6">
                  <p><span className="font-medium">Date:</span> {formatDate(selectedPaper.date || selectedPaper.createdAt)}</p>
                  <p><span className="font-medium">Time:</span> {selectedPaper.examTime || 1} Hours</p>
                  <p><span className="font-medium">Marks:</span> {selectedPaper.totalMarks}</p>
                </div>
                
                <p className="mt-4 font-medium">Answer all questions</p>
              </div>
              
              {/* Questions Section */}
              {selectedPaper.questions && selectedPaper.questions.length > 0 ? (
                <div>
                  {/* Group questions by subject */}
                  {(() => {
                    // Group questions by subject
                    const subjectGroups = {};
                    selectedPaper.questions.forEach(q => {
                      const subjectName = q.subject || 'Unknown';
                      if (!subjectGroups[subjectName]) {
                        subjectGroups[subjectName] = [];
                      }
                      subjectGroups[subjectName].push(q);
                    });
                    
                    // Render each subject group
                    let questionNumber = 1;
                    return Object.entries(subjectGroups).map(([subjectName, questions]) => (
                      <div key={subjectName} className="mb-8">
                        <h3 className="text-lg font-bold mb-4 text-center bg-gray-100 py-2 rounded">
                          {subjectName}
                        </h3>
                        
                        <div className="space-y-6">
                          {questions.map((question, idx) => {
                            const qNum = questionNumber++;
                            return (
                              <div key={question._id || idx} className="border-b pb-4">
                                <p className="mb-2 font-medium">
                                  {qNum}. {stripHTMLTags(question.question)}
                                </p>
                                
                                {question.options && Array.isArray(question.options) && (
                                  <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                    {question.options.map((option, optionIdx) => (
                                      <div key={optionIdx} className="flex items-start">
                                        <span className="font-medium mr-2">{['A', 'B', 'C', 'D'][optionIdx]}.</span>
                                        <span>{stripHTMLTags(option.value || '')}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No questions found for this paper.</p>
                </div>
              )}
            </div>
          </div>
        </div>
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

export default EntranceAdminApprovalPage;