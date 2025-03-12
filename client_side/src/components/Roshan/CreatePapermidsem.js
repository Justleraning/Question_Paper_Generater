import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CreatePaperRosh = () => {
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
    navigate(`/view-paper/${paperId}`);
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", textAlign: "center", background: "#e3e8f0", minHeight: "100vh" }}>
      <a href="/mainp" style={{ textDecoration: "none", color: "#890f50", fontWeight: "bold", fontSize: "18px", display: "inline-block", borderRadius: "20px", padding: "10px", marginRight: "100%", cursor: "pointer", transition: "color 0.3s ease" }}>
        &#129092; Back
      </a>
      <h2>Saved Question Papers</h2>
      {loading ? <p>Loading...</p> : papers.length === 0 ? <p style={{color:'rgb(172, 29, 29)', fontWeight:'bold'}}>-- No saved question sets --</p> :
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
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)' }}>
              &#120299;
            </span>

            {/* Title Section - Fix Subject and Semester */}
            <h3 style={{ fontWeight: "bold", color: "#333", textTransform: "uppercase" }}>
              {paper.subject ? paper.subject : "❌ No Subject"}
              <br />
              ({paper.semester ? paper.semester : "❌ No Semester"})
            </h3>

            {/* Units */}
            <p>Units: {paper.units && paper.units.length ? paper.units.join(", ") : "❌ No Units"}</p>

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

export default CreatePaperRosh;
