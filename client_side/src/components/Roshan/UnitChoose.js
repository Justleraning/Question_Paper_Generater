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
        background: "#a247cc",
      },
      textWrapper: {
        textAlign: "center",
        marginBottom: "20px",
      },
      gradientText: {
        fontSize: "25px",
        fontWeight: "bold",
        background: "linear-gradient(to right, #e10c0c, rgb(115, 48, 9))",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      },
    container: { padding: '20px', marginTop:"45px", borderRadius:'20px', textAlign: 'center', boxShadow:'4px 4px 4px 6px rgba(0, 0, 0, 0.1)', background: "linear-gradient(to right,rgb(218, 225, 232),rgb(208, 222, 222))"},
    subject: { fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' },
    label: { display: 'block', margin: '15px 0', fontWeight: 'bold' },
    baseButton: {
      padding: "9px 8px",
      fontSize: "18px",
      letterSpacing: "0.5px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.25s ease",
      position: "relative",
      marginTop: "22px",
      overflow: "hidden",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      minWidth: "120px",
      textAlign: "center",
    },
    nextbutton: {
      backgroundColor: "#1dce6c",
      border: "2px solid transparent",
      flex: "1",
    },
    backbutton: {
      backgroundColor: "#3c8ec8",
      border: "2px solid transparent",
    },
    unitButton: {
      display: 'inline-block',
      margin: '10px',
      padding: '10px 20px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      cursor: 'pointer',
      backgroundColor: '#f0f0f0',
      transition: "all 0.20s ease",
      position: "relative"
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
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(3px)";
          }}
          onClick={(e) => {handleSelection(unit)}}
          >
            Unit {unit}
          </div>
        ))}
      </div>
      <div>
      <button 
        style={{...styles.baseButton, ...styles.backbutton}}
        className="backbutton" 
        onClick={handleBack}
        onMouseOver={(e) => {
          e.target.style.transform = "translateX(-7px)";
          e.target.style.boxShadow = "0 7px 14px rgba(0, 0, 0, 0.15)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "translateX(0)";
          e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        }}
      >
        &#129136; Back
      </button>
      <button 
        style={{...styles.baseButton, ...styles.nextbutton,  marginLeft: "30px"}}
        className="nextbutton"
        onClick={handleSubmit}
        onMouseOver={(e) => {
          e.target.style.transform = "translateX(7px)";
          e.target.style.boxShadow = "0 7px 14px rgba(0, 0, 0, 0.15)";
        }}
        onMouseOut={(e) => {
          e.target.style.transform = "translateX(0)";
          e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
        }}
      >
        Next &#129138;
      </button>
      </div>
    </div>
    </div>
  );
};

export default UnitChoose;
