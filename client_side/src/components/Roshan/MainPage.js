import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);
  
  useEffect(() => {
    // Navigate programmatically
    navigate("/mainp");
    
    // Trigger fade-in animation
    setTimeout(() => setFadeIn(true), 100);
    
    // Add particles effect
    const particlesContainer = document.createElement('div');
    particlesContainer.id = 'particles-background';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      particle.style.animationDuration = `${5 + Math.random() * 10}s`;
      particlesContainer.appendChild(particle);
    }
    
    return () => {
      if (particlesContainer && document.body.contains(particlesContainer)) {
        document.body.removeChild(particlesContainer);
      }
    };
  }, [navigate]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg,rgb(182, 189, 202) 0%,rgb(167, 172, 180) 100%)",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
    fontFamily: "'Poppins', sans-serif",
  };

  const contentBoxStyle = {
    width: "85%",
    maxWidth: "650px",
    padding: "40px",
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    borderRadius: "20px",
    boxShadow: "0 15px 35px rgba(0, 0, 0, 0.2)",
    textAlign: "center",
    transform: fadeIn ? "translateY(0) scale(1)" : "translateY(50px) scale(0.95)",
    opacity: fadeIn ? 1 : 0,
    transition: "all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  };

  const headingStyle = {
    marginBottom: "30px",
    color: "#1e3c72",
    fontSize: "36px",
    fontWeight: "700",
    textShadow: "0px 1px 2px rgba(0,0,0,0.1)",
    position: "relative",
    display: "inline-block",
  };

  const headingAfterStyle = {
    content: '""',
    position: "absolute",
    bottom: "-10px",
    left: "50%",
    width: "80px",
    height: "4px",
    background: "linear-gradient(to right, #1e3c72, #2a5298)",
    transform: "translateX(-50%)",
    borderRadius: "2px",
  };

  const buttonContainerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "100%",
    marginTop: "30px",
    "@media (min-width: 600px)": {
      flexDirection: "row",
      justifyContent: "center",
    },
  };

  const createButtonStyle = {
    padding: "16px 30px",
    fontSize: "18px",
    borderRadius: "50px",
    border: "none",
    backgroundColor: " #4776E6",
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 10px 20px rgba(71, 118, 230, 0.3)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
  };

  const generateButtonStyle = {
    ...createButtonStyle,
    backgroundColor: "rgb(48, 187, 48)",
    boxShadow: "0 10px 20px rgba(56, 239, 126, 0.2)",
  };

  return (
    <>
      {/* Particle Effect CSS */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
            100% { transform: translateY(0) rotate(360deg); }
          }
          
          #particles-background {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
          }
          
          .particle {
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            animation: float infinite linear;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          @keyframes shine {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          
          @media (min-width: 600px) {
            .button-container {
              flex-direction: row !important;
              justify-content: center;
            }
            .action-button {
              width: auto !important;
            }
          }
          
          .action-button:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
          }
          
          .action-button:active {
            transform: translateY(0);
          }
          
          .button-icon {
            margin-right: 10px;
            font-size: 20px;
          }
          
          .shine-effect {
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              rgba(255, 255, 255, 0) 0%,
              rgba(255, 255, 255, 0.1) 50%,
              rgba(255, 255, 255, 0) 100%
            );
            animation: shine 3s infinite;
            pointer-events: none;
            transform: rotate(25deg);
          }
        `}
      </style>

      <div style={containerStyle}>
        <div style={contentBoxStyle}>
          <h1 style={headingStyle}>
            Mid-Semester Examination
            <div style={headingAfterStyle}></div>
          </h1>

          <div style={buttonContainerStyle} className="button-container">
            <button
              onClick={() => navigate("/subjectselection")}
              style={createButtonStyle}
              className="action-button"
            >
              <div className="shine-effect"></div>
              <span className="button-icon">&#43;</span>
              Create
            </button>

            <button
              onClick={() => navigate("/createpapermidsem")}
              style={generateButtonStyle}
              className="action-button"
            >
              <div className="shine-effect"></div>
              <span className="button-icon">&#128196;</span>
              Saved Papers
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default MainPage;