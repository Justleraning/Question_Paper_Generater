import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SubjectSelection = () => {
  const navigate = useNavigate();
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const semesterSubjects = {
    "1st Semester": ["CA1121: Fundamentals of Computers", "CA1221: Programming in C", "CA1321: Mathematical Foundations"],
    "2nd Semester": ["CA2121: Data Structures using C", "CA2221: Object Oriented Concepts using JAVA", "CA2321: Discrete Mathematical Structures"],
    "3rd Semester": ["CA3122: Database Management Systems", "CA3222: C# and DOT NET Framework", "CA3322: Computer Communication and Networks"],
    "4th Semester": ["CA4122: Python Programming", "CA4222: Computer Multimedia and Animation", "CA4322: Operating System Concepts"],
    "5th Semester": ["CA5123: E-commerce", "CA5223: Internet Technologies", "CA5323: Cyberlaw and Cybersecurity", "CADE5423: Cloud Computing", "CAV01: AWS - Cloud Practitioner Essentials"],
    "6th Semester": ["CA6123: Software Engineering", "CA6223: Artificial Intelligence", "CA6323: Internet of Things", "CADE6423: Mobile Application Development", "DAV02: Vocational PowerBI"],
  };

  useEffect(() => {
    // Trigger animation on component mount
    setLoaded(true);
    
    // Create and animate background particles
    const particlesContainer = document.createElement('div');
    particlesContainer.id = 'subject-selection-particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 40; i++) {
      const particle = document.createElement('div');
      particle.className = 'subject-particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${5 + Math.random() * 15}s`;
      particle.style.opacity = `${0.1 + Math.random() * 0.2}`;
      particle.style.width = `${3 + Math.random() * 8}px`;
      particle.style.height = particle.style.width;
      particlesContainer.appendChild(particle);
    }
    
    return () => {
      if (particlesContainer && document.body.contains(particlesContainer)) {
        document.body.removeChild(particlesContainer);
      }
    };
  }, []);

  const handleSemesterChange = (e) => {
    const selectedSemester = e.target.value;
    setSemester(selectedSemester);
    setSubjects(semesterSubjects[selectedSemester] || []);
    setSubject(""); // Reset the selected subject when semester changes
  };

  const handleNext = () => {
    if (!semester || !subject) {
      alert("Please select both a semester and a subject.");
      return;
    }
    navigate("/unitchoose", { state: { selectedSubject: subject, semester: semester } });
  };

  return (
    <>
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-15px) rotate(5deg); }
            100% { transform: translateY(0) rotate(0deg); }
          }
          
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shine {
            from { background-position: 200% center; }
            to { background-position: -200% center; }
          }
          
          @keyframes wave {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          #subject-selection-particles {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
          }
          
          .subject-particle {
            position: absolute;
            background-color: rgba(255, 255, 255, 0.4);
            border-radius: 50%;
          }
          
          .selectable-option {
            transition: all 0.3s ease;
            background-color: white;
          }
          
          .selectable-option:hover {
            background-color: #f0f8ff;
          }
          
          .select-container {
            position: relative;
          }
          
          .select-container::after {
            content: "▼";
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: #3a86ff;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .select-container:hover::after {
            color: #0056b3;
          }
        `}
      </style>

      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(-45deg, #3a86ff, #00d4ff, #4cc9f0, #0077b6)",
        backgroundSize: "400% 400%",
        padding: "20px",
        boxSizing: "border-box",
        overflow: "hidden",
        position: "relative"
      }}>
        <div style={{
          maxWidth: "550px",
          width: "100%",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "20px",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2), 0 5px 15px rgba(0, 0, 0, 0.1)",
          padding: "30px",
          fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
          backdropFilter: "blur(10px)",
          transform: loaded ? "translateY(0) scale(1)" : "translateY(30px) scale(0.95)",
          opacity: loaded ? 1 : 0,
          transition: "all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          boxSizing: "border-box"
        }}>
          <a 
            href="/" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              color: "#3a86ff",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "18px",
              marginBottom: "30px",
              padding: "8px 16px",
              borderRadius: "50px",
              transition: "all 0.3s ease",
              background: "rgba(58, 134, 255, 0.1)",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(58, 134, 255, 0.2)";
              e.target.style.transform = "translateX(-4px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(58, 134, 255, 0.1)";
              e.target.style.transform = "translateX(0)";
            }}
          >
            <span style={{ marginRight: "8px", fontSize: "16px" }}>&#129136;</span> Back
          </a>

          <div style={{
            marginBottom: "25px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease",
            transitionDelay: "0.6s",
          }}>
            <label style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a3a5f",
            }}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "8px" }}></span> Select a semester:
              </span>
            </label>
            <div className="select-container">
              <select
                value={semester}
                onChange={handleSemesterChange}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  outline: "none",
                  appearance: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "white",
                }}
                onFocus={(e) => e.target.style.borderColor = "#3a86ff"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              >
                <option value="" className="selectable-option">-- Select Semester --</option>
                {Object.keys(semesterSubjects).map((sem) => (
                  <option key={sem} value={sem} className="selectable-option">
                    {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{
            marginBottom: "30px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.6s ease",
            transitionDelay: "0.8s",
          }}>
            <label style={{
              display: "block",
              marginBottom: "12px",
              fontSize: "18px",
              fontWeight: "600",
              color: "#1a3a5f",
            }}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <span style={{ marginRight: "8px" }}></span> Select a subject:
              </span>
            </label>
            <div className="select-container">
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!semester}
                style={{
                  width: "100%",
                  padding: "15px 20px",
                  fontSize: "16px",
                  border: "2px solid #e5e7eb",
                  borderRadius: "12px",
                  outline: "none",
                  appearance: "none",
                  cursor: semester ? "pointer" : "not-allowed",
                  backgroundColor: semester ? "white" : "#f5f5f5",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
                  opacity: semester ? 1 : 0.7,
                }}
                onFocus={(e) => e.target.style.borderColor = "#3a86ff"}
                onBlur={(e) => e.target.style.borderColor = "#e5e7eb"}
              >
                <option value="" className="selectable-option">-- Select Subject --</option>
                {subjects.map((sub, index) => (
                  <option key={index} value={sub} className="selectable-option">
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleNext} 
            style={{
              width: "100%",
              padding: "16px",
              backgroundColor: "#3a86ff",
              color: "white",
              fontSize: "18px",
              fontWeight: "600",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 10px 20px rgba(58, 134, 255, 0.3)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              Next <span style={{ marginLeft: "10px", fontSize: "20px" }}>&#129138;</span>
            </span>
            <div style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
            }}/>
          </button>
        </div>
      </div>
    </>
  );
};

export default SubjectSelection;