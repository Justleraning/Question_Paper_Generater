import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ArrowLeft, Eye, Trash2 } from 'lucide-react';

const MidSemSide = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/get-questions")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response:", data);
        setPapers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Error fetching questions:", error);
        setLoading(false);
      });
  }, []);

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

  const getPaperStatus = (paper) => {
    return paper.status || (paper.isPublished ? "published" : "draft");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Mid Semester Examination</h1>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      ) : papers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-red-600 font-bold">-- No saved question papers ⚠️ --</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {papers.map((paper) => (
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
                      {paper.course || "BCA"} | {paper.semester || "THIRD"} Semester
                    </p>
                    <span 
                      className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1
                        ${getPaperStatus(paper) === 'draft' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'}`}
                    >
                      {getPaperStatus(paper)}
                    </span>
                  </div>
                </div>

                {/* Right side with action buttons */}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleViewPaper(paper._id)} 
                    className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
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