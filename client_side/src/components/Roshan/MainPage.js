import React from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "none",
        alignItems: "center",
        justifyContent: "center",
        opacity: "95%",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Container Box */}
      <div
        style={{
          width: "80%",
          maxWidth: "600px",
          padding: "20px",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "20px" }}>Mid-Semester Examination</h1>

        {/* Add Questions Button */}
        <button
          onClick={() => navigate("/subjectselection")}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#007BFF",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#1e2aa7")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#007BFF")}
        >
          &#43; Create Questions
        </button>

        {/* Create Paper Button */}
        <button
          onClick={() => {
            navigate("/createpapermidsem")
          }}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "16px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            backgroundColor: "#28A745",
            color: "#fff",
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = "#37d45b")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#079b3a")}
        >
          &#128196; Generate Paper
        </button>
      </div>
    </div>
  );
}

export default MainPage;
