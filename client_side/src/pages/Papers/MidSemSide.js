import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext.js";
import { FileText, Eye, Edit, Trash2, Check, X, RefreshCw, AlertCircle, Send, Plus } from 'lucide-react';

const MidSemSide = () => {
  const { authState } = useAuth();
  const isAdmin = authState?.user?.role === "Admin" || authState?.user?.role === "SuperAdmin";
  
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  // For rejection dialog
  const [rejectingPaperId, setRejectingPaperId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [availableSemesters, setAvailableSemesters] = useState([]);

  useEffect(() => {
    console.log("Fetching papers...");
    
    // Prepare query params based on user role
    const params = new URLSearchParams();
    
    if (authState?.user?._id) {
      params.append('userId', authState.user._id);
    }
    
    if (authState?.user?.role) {
      params.append('role', authState.user.role);
    }
    
    // Fetch papers with user-specific filtering
    fetch(`http://localhost:5000/get-questions?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ API Response:", data);
        
        // Check if data is an array and not empty
        if (Array.isArray(data) && data.length > 0) {
          setPapers(data);
          setFilteredPapers(data);
          
          // Extract unique semesters from data
          const semesters = [...new Set(data.map(paper => paper.semester).filter(Boolean))];
          setAvailableSemesters(semesters);
        } else {
          console.log("No papers received or data is not an array:", data);
          setPapers([]);
          setFilteredPapers([]);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching questions:", error);
        setLoading(false);
      });
  }, [authState]);

  // Apply filters when filter states change
  useEffect(() => {
    if (papers.length === 0) return;
    
    let result = [...papers];
    
    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter(paper => (paper.status || "Draft") === statusFilter);
    }
    
    // Apply semester filter
    if (semesterFilter !== "All") {
      result = result.filter(paper => paper.semester === semesterFilter);
    }
    
    console.log(`Filtered papers: ${result.length} results`);
    setFilteredPapers(result);
  }, [statusFilter, semesterFilter, papers]);

  const refreshPapers = () => {
    setLoading(true);
    console.log("Manually refreshing papers...");
    
    // Prepare query params based on user role
    const params = new URLSearchParams();
    
    if (authState?.user?._id) {
      params.append('userId', authState.user._id);
    }
    
    if (authState?.user?.role) {
      params.append('role', authState.user.role);
    }
    
    fetch(`http://localhost:5000/get-questions?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Server responded with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("✅ API Response:", data);
        
        // Check if data is an array and not empty
        if (Array.isArray(data) && data.length > 0) {
          setPapers(data);
          setFilteredPapers(data);
          
          // Extract unique semesters from data
          const semesters = [...new Set(data.map(paper => paper.semester).filter(Boolean))];
          setAvailableSemesters(semesters);
        } else {
          console.log("No papers received or data is not an array:", data);
          setPapers([]);
          setFilteredPapers([]);
        }
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching questions:", error);
        setLoading(false);
        alert("Failed to refresh papers. Please try again.");
      });
  };

  const handleDelete = async (id) => {
    // Prevent deletion of non-draft papers for teachers
    const paperToDelete = papers.find(p => p._id === id);
    if (!isAdmin && paperToDelete && paperToDelete.status !== 'Draft' && paperToDelete.status !== 'Rejected') {
      alert("You cannot delete papers that have been submitted or approved.");
      return;
    }
    
    const confirmDelete = window.confirm("Are you sure you want to delete this paper?");
    if (!confirmDelete) return;
  
    setDeleting(id);
  
    try {
      const response = await fetch(`http://localhost:5000/delete-paper/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Server Error: ${text}`);
      }
  
      alert("Paper deleted successfully! ✅");
      setPapers((prevPapers) => prevPapers.filter((paper) => paper._id !== id));
    } catch (error) {
      console.error("❌ Error deleting paper:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };
  
  const handleViewPaper = (paperId) => {
    navigate(`/viewpaper/${paperId}`);
  };

  // Helper function to extract units from questions or use the units array
  const extractUnits = (paper) => {
    // First check if there's a units array
    if (paper.units && paper.units.length > 0) {
      return paper.units.join(", ");
    }
    
    // Fallback to extracting from questions
    if (paper.questions && paper.questions.length > 0) {
      const units = paper.questions
        .map(q => q.unit)
        .filter((unit, index, self) => 
          unit && self.indexOf(unit) === index
        );
        
      return units.length > 0 ? units.join(", ") : paper.unit || "Unit 1";
    }
    
    // Last resort, return the top-level unit
    return paper.unit || "Unit 1";
  };

  // Send for Approval
  const sendForApproval = async (paper) => {
    try {
      const currentStatus = paper.status || 'Draft';
      
      if (currentStatus !== 'Draft' && currentStatus !== 'Rejected') {
        alert(`This paper is already ${currentStatus.toLowerCase()}.`);
        return;
      }
      
      if (!window.confirm(`Are you sure you want to submit this "${paper.subject || 'paper'}" for approval?`)) {
        return;
      }

      // Call API to update paper status
      const response = await fetch(`http://localhost:5000/update-paper-status/${paper._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Submitted',
          submittedBy: authState?.user?._id,
          submittedAt: new Date()
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit paper for approval");
      }

      const result = await response.json();

      // Update state to reflect the new status
      setPapers(prevPapers => prevPapers.map(p =>
        p._id === paper._id ? { ...p, status: 'Submitted' } : p
      ));

      alert("Paper has been submitted for approval! ✅");
    } catch (error) {
      console.error("❌ Error submitting paper:", error);
      alert("Failed to submit paper. Please try again.");
    }
  };

  // For Admins: Approve Paper
  const handleApprovePaper = async (paperId) => {
    if (!isAdmin) return;
    
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
      setPapers(prevPapers => prevPapers.map(paper => 
        paper._id === paperId 
          ? { ...paper, status: "Approved", approvedAt: new Date() } 
          : paper
      ));
      
      alert("Paper approved successfully!");
    } catch (error) {
      console.error("❌ Error approving paper:", error);
      alert("Failed to approve paper. Please try again.");
    }
  };

  // For Admins: Open rejection dialog
  const openRejectionDialog = (paperId) => {
    if (!isAdmin) return;
    setRejectingPaperId(paperId);
  };

  // For Admins: Cancel rejection
  const cancelRejection = () => {
    setRejectingPaperId(null);
    setRejectionReason("");
  };

  // For Admins: Submit rejection
  const submitRejection = async () => {
    if (!isAdmin) return;
    
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
      setPapers(prevPapers => prevPapers.map(paper => 
        paper._id === rejectingPaperId 
          ? { 
              ...paper, 
              status: "Rejected", 
              rejectedAt: new Date(),
              rejectionReason: rejectionReason.trim()
            } 
          : paper
      ));
      
      alert("Paper rejected ⛔ Feedback sent to teacher 📩");
      
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
      case 'Draft':
        return 'bg-yellow-300 text-yellow-800';
      case 'Submitted':
        return 'bg-blue-300 text-blue-800';  
      case 'Approved':
        return 'bg-green-300 text-green-800';
      case 'Rejected':
        return 'bg-red-300 text-red-800';
      default:
        return 'bg-gray-300 text-gray-800';  
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("All");
    setSemesterFilter("All");
  };
  const navigateToCreatePaper = () => {
    navigate('/mainp', { state: { createdBy: authState?.user?._id } });
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mid Semester Question Papers</h1>

      {/* Filter Section */}
      <div className="flex items-center justify-between gap-0 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 w-full">
          {/* Status Filter */}
          <div className="w-full">
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full block rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Semester Filter */}
          <div className="w-full">
            <select
              id="semesterFilter"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full block rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2"
            >
              <option value="All">All Semesters</option>
              {availableSemesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className="flex gap-4">
            <button
              onClick={resetFilters}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-50 transition text-sm border border-gray-300 shadow-sm"
            >
              Reset Filters
            </button>
          </div>

          {/* Refresh and Create New Paper Buttons */}
          <div className="flex gap-3">
            <button
              onClick={refreshPapers}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md transition gap-2 text-sm gap-2"
              title="Refresh"
            >
              <RefreshCw size={18} /> Refresh
            </button>
            <button
              onClick={navigateToCreatePaper}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition text-sm gap-1"
            >
              <Plus size={15}/> New Paper
            </button>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      ) : filteredPapers.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-gray-600 font-medium">No question papers match your filter criteria.</p>
          {(statusFilter !== "All" || semesterFilter !== "All") && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPapers.map((paper) => (
  <div
    key={paper._id}
    className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
      deleting === paper._id ? "opacity-0 scale-90" : "opacity-100 scale-100"
    }`}
  >
    <div className="flex items-center justify-between p-4">
      {/* Left side with icon and information */}
      <div className="flex items-center space-x-4">
        <FileText className="text-blue-500 w-10 h-10" />
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            {paper.subject || "Untitled"} {paper.subjectCode ? `- ${paper.subjectCode}` : ""}
          </h3>
          <p className="text-sm text-gray-600">
            {paper.course || "BCA"} | {paper.semester || " "} | Units: {extractUnits(paper)}
          </p>         
          <div className="flex flex-col mt-1">
            <div className="flex items-center space-x-2">
              <span 
                className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(paper.status || 'Draft')}`}
              >
                {paper.status || 'Draft'}
              </span>
              
              {/* Show submission/approval/rejection date if available */}
              {paper.submittedAt && paper.status === 'Submitted' && (
                <span className="text-xs text-gray-500">
                  Submitted on: {new Date(paper.submittedAt).toLocaleDateString()}
                </span>
              )}
              
              {paper.approvedAt && paper.status === 'Approved' && (
                <span className="text-xs text-gray-500">
                  Approved on: {new Date(paper.approvedAt).toLocaleDateString()}
                </span>
              )}
              
              {paper.rejectedAt && paper.status === 'Rejected' && (
                <span className="text-xs text-gray-500">
                  Rejected on: {new Date(paper.rejectedAt).toLocaleDateString()}
                </span>
              )}
            </div>
            
            {/* Show rejection reason if available */}
            {paper.status === 'Rejected' && paper.rejectionReason && (
              <div className="flex items-start mt-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                <span>{paper.rejectionReason}</span>
              </div>
            )}
          </div>
        </div>
        </div>
          {/* Right side with action buttons */}
                <div className="flex space-x-2">
                  {/* Send for Approval - only for teachers with Draft/Rejected papers */}
                  {!isAdmin && (paper.status === 'Draft' || paper.status === 'Rejected') && (
                    <button
                      onClick={() => sendForApproval(paper)}
                      className="bg-purple-100 text-purple-700 px-3 py-1 rounded-lg flex items-center hover:bg-purple-200 text-sm"
                      title="Submit for Approval"
                    >
                      <Send size={18} />
                    </button>
                  )}
                  
                  {/* Approve/Reject buttons - only for admins with Submitted papers */}
                  {isAdmin && paper.status === 'Submitted' && (
                    <>
                      <button 
                        onClick={() => handleApprovePaper(paper._id)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-600 text-sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => openRejectionDialog(paper._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-red-600 text-sm"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleViewPaper(paper._id)}
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    title="View Paper"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  {(paper.status === 'Draft' || paper.status === 'Rejected' || isAdmin) && (
                    <button
                      onClick={() => handleViewPaper(paper._id)}
                      className="text-yellow-500 hover:bg-yellow-100 p-2 rounded-full transition-colors"
                      title="Edit Paper"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                  )}
                  {/* Delete button - only for Draft and Rejected papers or admin */}
                  {(paper.status === 'Draft' || paper.status === 'Rejected' || isAdmin) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(paper._id);
                      }}
                      className="text-red-500 hover:bg-red-100 p-2 rounded-full transition-colors"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rejection reason modal */}
      {isAdmin && rejectingPaperId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Provide Rejection Reason</h3>
            <p className="text-sm text-gray-600 mb-4">
              This feedback will be shared with the teacher. Please provide constructive criticism.
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
    </div>
  );
};

export default MidSemSide;