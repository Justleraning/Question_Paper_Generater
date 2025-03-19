import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

  // Helper function to extract units from questions
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
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", textAlign: "center", background: "#e3e8f0", minHeight: "100vh" }}>
      <a href="/mainp" style={{ textDecoration: "none", color: "#4e45a6", background: "lightblue", fontWeight: "bold", fontSize: "18px", display: "inline-block", borderRadius: "20px", padding: "10px", marginRight: "100%", cursor: "pointer", transition: "color 0.3s ease" }}>
        &#129136; Back
      </a>
      <h1>Mid Semester Examination</h1>
      <h2 style={{ background:"lightblue", textAlign:"center", display:"inline-block", borderRadius: "15px", padding:"10px 10px 10px 10px", marginBottom: "20px"}}>Saved Question Papers</h2>
      {loading ? <p>Loading...</p> : papers.length === 0 ? <p style={{color:'#ac1d1d', fontWeight:'bold'}}>-- No saved question papers ⚠️ --</p> :
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "15px" }}>
          
          {papers.map((paper, index) => (
          <div 
            key={paper._id} 
            style={{
              position: "relative",
              padding: "15px",
              background: "#fff",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
              transition: "opacity 0.3s ease-out, transform 0.3s ease-out",
              opacity: deleting === paper._id ? 0 : 1,
              transform: deleting === paper._id ? "scale(0.9)" : "scale(1)",
            }}
            onMouseOver={() => (e) => (e.target.style.color = "#0056b3")}
            onMouseOut={() => (e) => (e.target.style.color = "#fff")}
          > 
            {/* Delete Button */}
            <span onClick={(e) => { e.stopPropagation(); handleDelete(paper._id); }} 
              style={{ position: 'absolute',
                top: '-10px',
                right: '-10px',
                backgroundColor: '#ff5555',
                color: 'white',
                fontSize:'22px',
                fontWeight: 'bolder',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
              &#10799;
            </span>

            {/* Title Section */}
            <h3>
              {paper.subject ? paper.subject : "❌ No Subject"}
              <br />
              {paper.semester ? paper.semester : "❌ No Semester"}
            </h3>

            {/* Units */}
            <h4>Units : {extractUnits(paper)}</h4>
            
            {/* Questions Count */}
            <p>Questions: {paper.questions ? paper.questions.length : 0}</p>

            {/* View Paper Button */}
            <button 
              onClick={() => handleViewPaper(paper._id)} 
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                transition: "all 0.20s ease",
                position: 'relative',
                fontSize: "15px",
                cursor: "pointer"
              }}
              onMouseOver={(e) => {
                e.target.style.background = "#3a85ff";
                e.target.style.transform = "translateY(0)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "#007bff";
                e.target.style.transform = "translateY(2px)";
              }}>
              View Paper
            </button>
          </div>
        ))}
        </div>
      }
    </div>
  );
};

export default CreatePaper;