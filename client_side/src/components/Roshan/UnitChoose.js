import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UnitChoose = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedSubject, semester } = location.state || {}; // Retrieve the subject and semester from the state
  const [selectedUnits, setSelectedUnits] = useState([]);

  const handleSelection = (unit) => {
    if (selectedUnits.includes(unit)) {
      setSelectedUnits(selectedUnits.filter((u) => u !== unit));
    } else if (selectedUnits.length < 3) {
      setSelectedUnits([...selectedUnits, unit]);
    } else {
      alert('You can ONLY select up to 3 units.');
    }
  };

  const handleBack = () => {
    navigate('/subjectselection', { state: { semester } }); // Navigate back with semester preserved
  };

  const handleSubmit = () => {
    if (selectedUnits.length > 0) {
      navigate('/questionentrymidsem', { state: { selectedUnits, semester, selectedSubject } });
    } else {
      alert('Please select at least ONE unit.');
    }
  };

  const styles = {
      page: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "none",
      },
      textWrapper: {
        textAlign: "center",
        marginBottom: "20px",
      },
      gradientText: {
        fontSize: "25px",
        fontWeight: "bold",
        background: "linear-gradient(to right, rgb(203, 36, 36), rgb(209, 91, 23))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
    container: { padding: '20px', marginTop:"45px", borderRadius:'20px', textAlign: 'center', background: "linear-gradient(to right,rgb(218, 225, 232),rgb(208, 222, 222))"},
    subject: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
    label: { display: 'block', margin: '15px 0', fontWeight: 'bold' },
    button: {
      padding: '10px 30px',
      marginTop: '20px',
      backgroundColor: '#4CAF50',
      color: 'white',
      fontSize: '17px',
      border: 'none',
      margin: '15px',
      borderRadius: '20px',
      cursor: 'pointer',
    },
    backButton: {
      padding: '10px 30px',
      marginTop: '20px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      fontSize: '17px',
      margin: '15px',
      borderRadius: '20px',
      cursor: 'pointer',
      marginRight: '10px',
    },
    unitButton: {
      display: 'inline-block',
      margin: '10px',
      padding: '10px 20px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: '#f0f0f0',
    },
    selectedUnit: {
      backgroundColor: '#8854E8',
      color: 'white',
    },
  };

  return(
  <div style={styles.page}>
  <div style={styles.textWrapper}>
    <p style={styles.gradientText}>&#9888; Kindly choose units orderwise &#9888;</p>
  </div>
  <div style={styles.container}>
      <h2>Select Units </h2>
      {selectedSubject && <div style={styles.subject}>Subject: {selectedSubject}</div>}
      <div>
        {[1, 2, 3, 4, 5].map((unit) => (
          <div
            key={unit}
            style={{
              ...styles.unitButton,
              ...(selectedUnits.includes(unit) ? styles.selectedUnit : {}),
            }}
            onClick={() => handleSelection(unit)}
          >
            Unit {unit}
          </div>
        ))}
      </div>
      <div>
        <button style={styles.backButton} onClick={handleBack} onMouseOver={(e) => (e.target.style.color = "rgb(15, 20, 72)")} onMouseOut={(e) => (e.target.style.color = "rgb(241, 243, 244)")}>
          Back
        </button>
        <button style={styles.button} onClick={handleSubmit} onMouseOver={(e) => (e.target.style.color = "rgb(8, 73, 18)")} onMouseOut={(e) => (e.target.style.color = "rgb(223, 231, 223)")}>
          Next
        </button>
      </div>
    </div>
    </div>
  );
};

export default UnitChoose;
