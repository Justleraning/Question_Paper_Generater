import React, { createContext, useState, useContext } from 'react';

const QPContext = createContext();

export const QPProvider = ({ children }) => {
  const [subjectDetails, setSubjectDetails] = useState({ name: '', code: '', id: '' }); // ✅ Add subjectId
  const [numUnits, setNumUnits] = useState(1);
  const [marks, setMarks] = useState(20);
  const [questions, setQuestions] = useState([]);

  const updateNumUnits = (units) => {
    setNumUnits(units);
    setQuestions((prevQuestions) => {
      return Array.from({ length: units }, (_, i) => prevQuestions[i] || []);
    });
  };

  const updateMarks = (selectedMarks) => {
    setMarks(selectedMarks);
    setQuestions((prevQuestions) => {
      return Array.from({ length: numUnits }, (_, i) => prevQuestions[i] || []);
    });
  };

  const updateSubjectDetails = (details) => {
    setSubjectDetails(details); // ✅ Ensure it stores subject ID too
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
