import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Contexts/AuthContext.js";
import { FileText, Eye, Trash2, Check, X, Upload, Filter } from 'lucide-react';

const MidSemSide = () => {
  const { authState } = useAuth();
  const isAdmin = authState?.user?.role === "Admin" || authState?.user?.role === "SuperAdmin";
  
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  // Filter states
  const [statusFilter, setStatusFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [availableSemesters, setAvailableSemesters] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/get-questions")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response:", data);
        setPapers(data);
        setFilteredPapers(data);
        
        // Extract unique semesters from data
        const semesters = [...new Set(data.map(paper => paper.semester).filter(Boolean))];
        setAvailableSemesters(semesters);
        
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching questions:", error);
        setLoading(false);
      });
  }, []);

  // Apply filters when filter states change
  useEffect(() => {
    let result = [...papers];
    
    // Apply status filter
    if (statusFilter !== "All") {
      result = result.filter(paper => (paper.status || "Draft") === statusFilter);
    }
    
    // Apply semester filter
    if (semesterFilter !== "All") {
      result = result.filter(paper => paper.semester === semesterFilter);
    }
    
    setFilteredPapers(result);
  }, [statusFilter, semesterFilter, papers]);

  const handleDelete = async (id) => {
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
      let newStatus;

      if (currentStatus === 'Draft') {
        newStatus = 'Submitted';
        if (!window.confirm(`Are you sure you want to submit "${paper.subject || paper.subjectCode}" for approval? Once submitted, you cannot edit it until it's approved or rejected.`)) {
          return;
        }
      } else if (currentStatus === 'Submitted') {
        newStatus = 'Approved';
        if (!window.confirm(`Are you sure you want to approve "${paper.subject || paper.subjectCode}"? This action represents approval from higher authority.`)) {
          return;
        }
      } else if (currentStatus === 'Approved') {
        alert("This paper is already approved.");
        return;
      } else if (currentStatus === 'Rejected') {
        newStatus = 'Submitted';
        if (!window.confirm(`Are you sure you want to resubmit "${paper.subject || paper.subjectCode}" for approval?`)) {
          return;
        }
      }

      // Call API to update paper status
      await fetch(`http://localhost:5000/update-paper-status/${paper._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      // Update state to reflect the new status
      setPapers(prevPapers => prevPapers.map(p =>
        p._id === paper._id ? { ...p, status: newStatus } : p
      ));

      alert(`Paper status changed to ${newStatus}!`);
    } catch (error) {
      console.error("❌ Error updating paper status:", error);
      alert("Failed to update paper status. Please try again.");
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
      await fetch(`http://localhost:5000/update-paper-status/${paper._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected', rejectionReason: reason })
      });

      // Update state to reflect the new status
      setPapers(prevPapers => prevPapers.map(p =>
        p._id === paper._id ? { ...p, status: 'Rejected', rejectionReason: reason } : p  
      ));

      alert("Paper has been rejected.");
    } catch (error) {
      console.error("❌ Error rejecting paper:", error);
      alert("Failed to reject paper. Please try again.");
    }
  };

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

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter("All");
    setSemesterFilter("All");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mid Semester Question Papers</h1>

      {/* Filter Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2">
            {/* Status Filter */}
            <div className="w-full sm:w-auto">
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Semester Filter */}
            <div className="w-full sm:w-auto">
              <select
                id="semesterFilter"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full sm:w-auto block rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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
            <div className="w-full sm:w-auto self-end">
              <button
                onClick={resetFilters}
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
              >
                Reset Filters
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
                      {paper.course || "BCA"} | {paper.semester || " "}
                    </p>
                    <div className="flex items-center mt-1 space-x-2">
                      <span 
                        className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(paper.status || 'Draft')}`}
                      >
                        {paper.status || 'Draft'}
                      </span>
                      {paper.status === 'Rejected' && paper.rejectionReason && (
                        <span className="text-xs text-red-600">
                          Rejected: {paper.rejectionReason}
                        </span>
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
                      className="text-purple-500 hover:bg-purple-50 p-2 rounded-full transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-1" />
                    </button>
                  )}
                  
                  {/* Approve/Reject buttons - only for admins with Submitted papers */}
                  {isAdmin && paper.status === 'Submitted' && (
                    <>
                      <button 
                        onClick={() => sendForApproval(paper)}
                        className="bg-green-500 text-white px-3 py-1 rounded-lg flex items-center hover:bg-green-600 text-sm"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => rejectPaper(paper)} 
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
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  
                  {/* Delete button - only for Draft and Rejected papers */}
                  {(
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(paper._id);
                      }}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                      title="Delete"
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
    </div>
  );
};

export default MidSemSide;