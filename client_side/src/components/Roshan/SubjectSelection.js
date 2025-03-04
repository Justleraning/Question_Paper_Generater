import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SubjectSelection = () => {
  const navigate = useNavigate();

  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);

  const semesterSubjects = {
    "1st Semester": ["CA1121: Fundamentals of Computers", "CA1221: Programming in C", "CA1321: Mathematical Foundations"],
    "2nd Semester": ["CA2121: Data Structures using C", "CA2221: Object Oriented Concepts using JAVA", "CA2321: Discrete Mathematical Structures"],
    "3rd Semester": ["CA3122: Database Management Systems", "CA3222: C# and DOT NET Framework", "CA3322: Computer Communication and Networks"],
    "4th Semester": ["CA4122: Python Programming", "CA4222: Computer Multimedia and Animation", "CA4322: Operating System Concepts"],
    "5th Semester": ["CA5123: E-commerce", "CA5223: Internet Technologies", "CA5323: Cyberlaw and Cybersecurity", "CADE5423: Cloud Computing", "CAV01: AWS - Cloud Practitioner Essentials"],
    "6th Semester": ["CA6123: Software Engineering", "CA6223: Artificial Intelligence", "CA6323: Internet of Things", "CADE6423: Mobile Application Development", "DAV02: Vocational PowerBI"],
  };

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

  const styles = {
    page: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background:"none",
    },
    container: {
      padding: "20px",
      fontFamily: "verdana, serif",
      maxWidth: "500px",
      width: "100%",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    },
    backLink: {
      textAlign: "left",
      display: "block",
      fontWeight: "bold",
      marginBottom: "20px",
      textDecoration: "none",
      fontSize:"17px",
      color: "#007bff",
      transition: "backgroundcolor 0.3s ease",
    },
    formGroup: {
      marginBottom: "20px",
      marginTop: "50px",
    },
    label: {
      display: "block",
      marginBottom: "10px",
      fontSize: "16px",
      fontWeight: "600",
    },
    select: {
      width: "100%",
      padding: "10px",
      fontSize: "16px",
      border: "1px solid #ddd",
      borderRadius: "4px",
      outline: "none",
      marginTop: "5px",
    },
    button: {
      width: "100%",
      padding: "12px",
      backgroundColor: "#007bff",
      color: "#fff",
      fontSize: "16px",
      fontWeight: "bold",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      transition: "background-color 0.3s ease",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <a href="/mainp" style={styles.backLink}
        onMouseOver={(e) => (e.target.style.color = "#0056b3")}
        onMouseOut={(e) => (e.target.style.color = "#007bff")}
        >
          &#129092; Back
        </a>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Select a semester:
            <select
              value={semester}
              onChange={handleSemesterChange}
              style={styles.select}
            >
              <option value="">-- Select Semester --</option>
              {Object.keys(semesterSubjects).map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Select a subject:
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={!semester}
              style={styles.select}
            >
              <option value="">-- Select Subject --</option>
              {subjects.map((sub, index) => (
                <option key={index} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button onClick={handleNext} style={styles.button}>
          Next &#129094;
        </button>
      </div>
    </div>
  );
};

export default SubjectSelection;
