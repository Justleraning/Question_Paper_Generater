import React, { useState } from "react";

const RandomizationPanel = ({ onRandomize, subjects, totalMarks }) => {
  const [selectedSubjects, setSelectedSubjects] = useState(
    subjects.reduce((acc, subject) => {
      acc[subject.code] = true;
      return acc;
    }, {})
  );
  const [marks, setMarks] = useState(totalMarks || 20);
  const [reservePercentage, setReservePercentage] = useState(20);

  const handleSubjectSelection = (subjectCode) => {
    setSelectedSubjects({
      ...selectedSubjects,
      [subjectCode]: !selectedSubjects[subjectCode]
    });
  };

  const handleRandomize = () => {
    const activeSubjects = Object.keys(selectedSubjects).filter(
      code => selectedSubjects[code]
    );

    if (activeSubjects.length === 0) {
      alert("Please select at least one subject.");
      return;
    }

    // Pass data to parent handler
    onRandomize({
      subjectCodes: activeSubjects,
      totalMarks: marks,
      reservePercentage
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Randomize Questions</h2>

      {/* Subjects Selection */}
      <div>
        <label className="block font-medium mb-2">Select Subjects</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {subjects.map((subject) => (
            <div key={subject.code} className="border rounded p-3">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedSubjects[subject.code]} 
                  onChange={() => handleSubjectSelection(subject.code)} 
                  className="mr-2" 
                />
                <span className="font-medium">{subject.name}</span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Marks & Reserve Percentage Selection */}
      <div className="flex flex-wrap justify-between items-center mt-4">
        <div className="mb-3">
          <label className="block font-medium mb-1">Total Marks:</label>
          <input 
            type="number" 
            value={marks} 
            onChange={(e) => setMarks(parseInt(e.target.value) || 20)} 
            className="w-20 border rounded p-1 text-center" 
            min="1"
          />
        </div>
        
        <div className="mb-3">
          <label className="block font-medium mb-1">Reserve Percentage:</label>
          <input 
            type="number" 
            value={reservePercentage} 
            onChange={(e) => setReservePercentage(parseInt(e.target.value) || 0)} 
            className="w-20 border rounded p-1 text-center" 
            min="0"
            max="50"
          />
        </div>
        
        <button
          onClick={handleRandomize}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Randomize Questions
        </button>
      </div>
    </div>
  );
};

export default RandomizationPanel;