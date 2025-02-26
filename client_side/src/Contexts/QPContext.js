import React, { createContext, useState, useContext, useEffect } from 'react';

const QPContext = createContext();

export const QPProvider = ({ children }) => {
  const [subjectDetails, setSubjectDetails] = useState({ name: '', code: '', id: '' });
  const [numUnits, setNumUnits] = useState(1);
  const [marks, setMarks] = useState(20);
  const [questions, setQuestions] = useState([]);

  // When subject changes, reset the questions
  useEffect(() => {
    setQuestions([]);
  }, [subjectDetails.id]); // Only trigger when subject ID changes

  const updateNumUnits = (units) => {
    setNumUnits(units);
    setQuestions((prevQuestions) => {
      return Array.from({ length: units }, (_, i) => prevQuestions[i] || []);
    });
  };

  const updateMarks = (selectedMarks) => {
    setMarks(selectedMarks);
  };

  const updateSubjectDetails = (details) => {
    // When subject changes, reset the state
    if (details.id !== subjectDetails.id) {
      console.log("Subject changed, resetting questions");
      setQuestions([]); // Clear questions when subject changes
    }
    setSubjectDetails(details);
  };

  const value = {
    subjectDetails,
    numUnits,
    marks,
    questions,
    setSubjectDetails: updateSubjectDetails,
    updateNumUnits,
    updateMarks,
    setQuestions,
  };

  return <QPContext.Provider value={value}>{children}</QPContext.Provider>;
};

export const useQPContext = () => useContext(QPContext);