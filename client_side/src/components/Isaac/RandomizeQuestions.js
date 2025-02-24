import React, { useState } from "react";

const RandomizationPanel = ({ onRandomize, units, totalMarks }) => {
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [marks, setMarks] = useState(totalMarks || 20);

  const handleUnitSelection = (unitId) => {
    setSelectedUnits((prev) =>
      prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]
    );
  };

  const handleRandomize = () => {
    if (selectedUnits.length === 0) {
      alert("Please select at least one unit.");
      return;
    }

    // Pass data to parent or handler
    onRandomize({ unitIds: selectedUnits, totalMarks: marks });
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Randomize Questions</h2>

      {/* Units Selection */}
      <div>
        <label className="block font-medium mb-2">Select Units</label>
        <div className="space-y-2">
          {units.map((unit) => (
            <div key={unit.unitId} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                checked={selectedUnits.includes(unit.unitId)}
                onChange={() => handleUnitSelection(unit.unitId)}
              />
              <label>{unit.unitName}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Marks Selection */}
      <div className="mt-4">
        <label className="block font-medium mb-2">Total Marks</label>
        <select
          className="w-full border rounded-lg p-2"
          value={marks}
          onChange={(e) => setMarks(Number(e.target.value))}
        >
          <option value={20}>20 Marks</option>
          <option value={30}>30 Marks</option>
        </select>
      </div>

      {/* Randomize Button */}
      <button
        onClick={handleRandomize}
        className="w-full bg-blue-600 text-white py-2 px-4 mt-4 rounded-lg hover:bg-blue-700"
      >
        Randomize Questions
      </button>
    </div>
  );
};

export default RandomizationPanel;
