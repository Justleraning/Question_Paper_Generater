import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext.js";
import { FileText, Eye, Check, X, AlertTriangle } from 'lucide-react';

const PaperApprovals_MidSem = () => {
  const { authState } = useAuth();
  const isAdmin = authState?.user?.role === "Admin" || authState?.user?.role === "SuperAdmin";
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingPaperId, setRejectingPaperId] = useState(null);
  const [viewingPaper, setViewingPaper] = useState(null);
  const [showPaperModal, setShowPaperModal] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAdmin) {
      // Redirect if not admin
      navigate("/dashboard");
      return;
    }
    
    console.log("Fetching submitted papers for admin review...");
    
    // First check if there are any papers at all
    fetch("http://localhost:5000/get-questions")
      .then(res => res.json())
      .then(allPapers => {
        console.log("✅ All papers:", allPapers);
        console.log("Papers with 'Submitted' status:", allPapers.filter(p => p.status === "Submitted"));
        
        // Now fetch only submitted papers
        return fetch("http://localhost:5000/get-submitted-papers");
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ Submitted Papers API response:", data);
        if (Array.isArray(data)) {
          setPapers(data);
        } else {
          console.error("API didn't return an array:", data);
          setPapers([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching submitted papers:", error);
        // Fallback: Try to get submitted papers from all papers endpoint
        fetch("http://localhost:5000/get-questions")
          .then(res => res.json())
          .then(allPapers => {
            console.log("Fallback: filtering submitted papers client-side");
            const submittedPapers = allPapers.filter(p => p.status === "Submitted");
            setPapers(submittedPapers);
          })
          .catch(err => console.error("Fallback also failed:", err))
          .finally(() => setLoading(false));
      });
  }, [isAdmin, navigate]);

  // View paper details
  const handleViewPaper = (paperId) => {
    try {
      console.log(`Admin attempting to view paper with ID: ${paperId}`);
      
      // Find the paper in our existing data
      const paperToView = papers.find(p => p._id === paperId);
      
      if (!paperToView) {
        // If not found in our current data, fetch it
        fetch(`http://localhost:5000/get-questions/${paperId}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch paper: ${res.status}`);
            }
            return res.json();
          })
          .then(paper => {
            console.log("Paper fetched successfully:", paper);
            setViewingPaper(paper);
            setShowPaperModal(true);
          })
          .catch(error => {
            console.error("Error fetching paper:", error);
            alert("Could not find the requested paper. It may have been deleted.");
          });
      } else {
        // Use the paper we already have
        setViewingPaper(paperToView);
        setShowPaperModal(true);
      }
    } catch (error) {
      console.error("Error in handleViewPaper:", error);
      alert("An error occurred while trying to view the paper. Please try again.");
    }
  };

  // Add this function to close the modal
  const closePaperModal = () => {
    setShowPaperModal(false);
    setViewingPaper(null);
  };

  // Approve paper
  const handleApprovePaper = async (paperId) => {
    if (!window.confirm("Are you sure you want to approve this paper?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/update-paper-status/${paperId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Approved",
          approvedBy: authState?.user?._id,
          approvedAt: new Date()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve paper");
      }

      // Update UI
      setPapers(papers.filter(paper => paper._id !== paperId));
      alert("Paper approved successfully!");
    } catch (error) {
      console.error("❌ Error approving paper:", error);
      alert("Failed to approve paper. Please try again.");
    }
  };

  // Helper function to extract units
  const extractUnits = (paper) => {
    if (paper.units && paper.units.length > 0) {
      return paper.units.join(", ");
    }
    
    if (paper.questions && paper.questions.length > 0) {
      const units = paper.questions
        .map(q => q.unit)
        .filter((unit, index, self) => 
          unit && self.indexOf(unit) === index
        );
      return units.length > 0 ? units.join(", ") : paper.unit || "Unit 1";
    }
    
    return paper.unit || "Unit 1";
  };

  // Open rejection dialog
  const openRejectionDialog = (paperId) => {
    setRejectingPaperId(paperId);
  };

  // Cancel rejection
  const cancelRejection = () => {
    setRejectingPaperId(null);
    setRejectionReason("");
  };

  // Submit rejection
  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/update-paper-status/${rejectingPaperId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "Rejected",
          rejectedBy: authState?.user?._id,
          rejectedAt: new Date(),
          rejectionReason: rejectionReason.trim()
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to reject paper");
      }

      // Update UI
      setPapers(papers.filter(paper => paper._id !== rejectingPaperId));
      alert("Paper rejected. Feedback sent to teacher.");
      
      // Reset state
      cancelRejection();
    } catch (error) {
      console.error("❌ Error rejecting paper:", error);
      alert("Failed to reject paper. Please try again.");
    }
  };

  // Get status badge styling
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'Submitted':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAdmin) {
    return null; // Prevent rendering if not admin
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Paper Approval Requests</h1>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading paper approval requests...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-xl text-gray-600 font-medium">No papers awaiting approval</p>
          <p className="text-gray-500 mt-2">All submitted papers have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {papers.map((paper) => (
            <div
              key={paper._id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300"
            >
              <div className="flex items-center justify-between p-4">
                {/* Paper information */}
                <div className="flex items-center space-x-4">
                  <FileText className="text-blue-500 w-10 h-10" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {paper.subject || "Untitled"} {paper.subjectCode ? `- ${paper.subjectCode}` : ""}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {paper.course || "BCA"} | {paper.semester || " "} | Units: {extractUnits(paper)}
                    </p>
                    <div className="flex items-center mt-1">
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(paper.status)}`}
                      >
                        {'Pending-Approval'}
                      </span>
                      {paper.submittedAt && (
                        <span className="text-xs text-gray-500 ml-2">
                          Submitted: {new Date(paper.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewPaper(paper._id)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg flex items-center hover:bg-blue-200 text-sm"
                    title="View Paper"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </button>
                  <button 
                    onClick={() => handleApprovePaper(paper._id)}
                    className="bg-green-100 text-green-700 px-3 py-1 rounded-lg flex items-center hover:bg-green-200 text-sm"
                    title="Approve Paper"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectionDialog(paper._id)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-lg flex items-center hover:bg-red-200 text-sm"
                    title="Reject Paper"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection reason modal */}
      {rejectingPaperId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Provide Rejection Reason <br></br> (in less than 50 words)</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feedback will be shared with the teacher. Please provide a valid reason.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-4 h-32"
              placeholder="Enter reason for rejection..."
            ></textarea>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelRejection}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject Paper
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paper View Modal */}
      {showPaperModal && viewingPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">{viewingPaper.subject || "Untitled Paper"}</h2>
              <button 
                onClick={closePaperModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">

              {/* Paper Header */}
              <div className="text-center mb-6 p-4 border rounded bg-gray-50">
                <h3 className="font-bold text-lg">ST. JOSEPH'S UNIVERSITY, BENGALURU - 27</h3>
                <p className="font-medium">BCA - {viewingPaper.semester}</p>
                <p className="font-medium mt-2">MID SEMESTER EXAMINATION</p>
                <p className="font-medium mt-2">{viewingPaper.subject}</p>
              </div>
              
              {/* Paper Content */}
              <div className="border rounded p-4">
                <div className="flex justify-between mb-4">
                  <p className="font-medium">Time: 1hr</p>
                  <p className="font-medium">Max Marks: 30</p>
                </div>
                
                {/* Part A Questions */}
                <div className="mb-6">
                  <h4 className="font-bold text-center mb-2">PART A</h4>
                  <p className="italic mb-3">Answer all FIVE questions (2 * 5 = 10)</p>
                  
                  <div className="space-y-3">
                    {viewingPaper.questions
                      .filter(q => q.marks === 2)
                      .slice(0, 5)
                      .map((q, idx) => (
                        <div key={idx} className="pl-4">
                          <p><span className="font-bold">{idx + 1}.</span> {q.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
                
                {/* Part B Questions */}
                <div>
                  <h4 className="font-bold text-center mb-2">PART B</h4>
                  <p className="italic mb-3">Answer any FIVE questions (4 * 5 = 20)</p>
                  
                  <div className="space-y-3">
                    {viewingPaper.questions
                      .filter(q => q.marks === 4)
                      .slice(0, 6)
                      .map((q, idx) => (
                        <div key={idx} className="pl-4">
                          <p><span className="font-bold">{idx + 6}.</span> {q.text}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer with Action Buttons */}
            <div className="border-t p-4 flex justify-end space-x-3">
              <button
                onClick={() => {
                  handleApprovePaper(viewingPaper._id);
                  closePaperModal();
                }}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              >
                Approve
              </button>
              <button
                onClick={() => {
                  closePaperModal();
                  openRejectionDialog(viewingPaper._id);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaperApprovals_MidSem;