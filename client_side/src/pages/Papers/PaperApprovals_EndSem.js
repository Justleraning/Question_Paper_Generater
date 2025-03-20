import React, { useState, useEffect } from 'react';
import { FileText, Check, X, Eye } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PaperApprovals_EndSem() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionComment, setRejectionComment] = useState('');
  const [rejectingPaperId, setRejectingPaperId] = useState(null);
  const navigate = useNavigate();

  // Fetch papers with submitted status
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        // We'll filter papers that have status = 'Submitted'
        const response = await axios.get('/api/endpapers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });

        // Filter papers with submitted status
        const submittedPapers = response.data.papers.filter(
          paper => paper.status === 'Submitted' || paper.metadata.status === 'submitted'
        );
        
        setPapers(submittedPapers);
        setLoading(false);
      } catch (err) {
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

  // View Paper in read-only mode
  const viewPaper = (paper) => {
    navigate('/create-papers', { 
      state: { 
        paperDetails: paper,
        previewMode: true,
        viewOnly: true,
        disableEditing: true,
        removeAllButtons: true,
        removeReplaceButtons: true,
        hideUIControls: true,
        cleanViewMode: true,
        hideNavigation: true,
        hideActionBar: true,
        paperContentOnly: true
      } 
    });
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Paper Approvals</h1>
      
      {papers.length === 0 ? (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md">
          No papers are pending approval at this time.
        </div>
      ) : (
        <div className="grid gap-4">
          {papers.map((paper) => (
            <div 
              key={paper._id} 
              className="bg-white shadow-md rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-grow">
                  <FileText className="text-blue-500 w-10 h-10" />
                  <div className="flex-grow">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {paper.examDetails.subjectName} - {paper.examDetails.subjectCode}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {paper.examDetails.course} | {paper.examDetails.semester} Semester
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        Submitted - Pending Approval
                      </span>
                      <span className="text-xs text-gray-500">
                        Created by: {paper.metadata.creatorName || "Unknown"}
                      </span>
                      <span className="text-xs text-gray-500">
                        Date: {formatDate(paper.metadata.createdAt)}
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