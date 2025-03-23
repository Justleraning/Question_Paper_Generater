import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Trash2 } from 'lucide-react'

const CreatePaper = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/get-questions")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ API Response:", data);  // Debugging
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
        const text = await response.text(); // Read response as text in case of an HTML error
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

  return (
    <div className="font-sans p-5 text-center bg-gray-100 min-h-screen">
      {/* Back Button */}
      <a 
        href="/mainp" 
        className="no-underline text-indigo-700 bg-blue-200 font-bold text-lg inline-block rounded-full p-2.5 mr-auto cursor-pointer transition-colors duration-300 hover:bg-blue-300"
      >
        &#129136; Back
      </a>
      
      {/* Main Heading */}
      <h1 className="text-3xl font-bold my-4">Mid Semester Examination</h1>
      
      {/* Subheading */}
      <h2 className="bg-blue-200 text-center inline-block rounded-xl px-4 py-2.5 mb-5 font-semibold">
        Saved Question Papers
      </h2>
      
      {/* Conditional Rendering for Papers */}
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : papers.length === 0 ? (
        <p className="text-red-700 font-bold">-- No saved question papers ⚠️ --</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper, index) => (
            <div 
              key={paper._id} 
              className={`
                relative p-4 bg-white rounded-lg cursor-pointer shadow-md
                transition-all duration-300 transform
                ${deleting === paper._id ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}
              `}
              onMouseOver={(e) => e.target.style.color = " #0056b3"}
              onMouseOut={(e) => e.target.style.color = ""}
            > 
              {/* Delete Button */}
              <span 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleDelete(paper._id); 
                }} 
                className="
                  absolute -top-2.5 -right-2.5 bg-red-500 text-white text-2xl font-bold
                  rounded-full w-8 h-8 flex justify-center items-center cursor-pointer shadow-md
                  hover:bg-red-500 text-gray-100  transition-colors
                "
              >
              <Trash2 size={18}/>
              </span>

              {/* Title Section */}
              <h3 className="text-lg font-semibold mb-2">
                {paper.subject ? paper.subject : "❌ No Subject"}
                <br />
                {paper.semester ? paper.semester : "❌ No Semester"}
              </h3>

              {/* Units */}
              <h4 className="text-md font-medium mb-1">Units: {extractUnits(paper)}</h4>
              
              {/* Questions Count */}
              <p className="text-gray-700 mb-3">Questions: {paper.questions ? paper.questions.length : 0}</p>

              {/* View Paper Button */}
              <button 
                onClick={() => handleViewPaper(paper._id)} 
                className="
                  text-blue-500 hover:bg-blue-100 p-2 rounded-full transition-colors"
                  title="View Paper"
              >
                <Eye />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatePaper;