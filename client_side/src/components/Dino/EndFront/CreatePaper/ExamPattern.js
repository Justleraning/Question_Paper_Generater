import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExamPattern.css';

const ExamDetails = () => {
  const navigate = useNavigate();
  
  // Initial exam pattern configuration with corrected distribution
  const [examConfig, setExamConfig] = useState({
    totalMarks: 60,
    units: [
      { id: 1, name: 'Unit 1', enabled: true },
      { id: 2, name: 'Unit 2', enabled: true },
      { id: 3, name: 'Unit 3', enabled: true },
      { id: 4, name: 'Unit 4', enabled: true },
      { id: 5, name: 'Unit 5', enabled: true },
    ],
    blooms: [
      { id: 1, name: 'Remember, Understand', enabled: true },
      { id: 2, name: 'Apply, Analyze', enabled: true },
      { id: 3, name: 'Evaluate, Create', enabled: true },
    ],
    parts: [
      { 
        id: 'A', 
        name: 'Part A',
        description: 'Short answer',
        questionMarks: 2,
        totalMarks: 10,
        questionsByUnit: [1, 1, 1, 1, 1], // 5 questions total (2×5=10 marks)
        questionsByBloom: [3, 2, 0]
      },
      { 
        id: 'B', 
        name: 'Part B',
        description: 'Application-based',
        questionMarks: 4,
        totalMarks: 20,
        questionsByUnit: [1, 1, 1, 1, 1], // 5 questions total (4×5=20 marks)
        questionsByBloom: [2, 2, 1]
      },
      { 
        id: 'C', 
        name: 'Part C',
        description: 'Higher-order thinking',
        questionMarks: 10,
        totalMarks: 30,
        questionsByUnit: [1, 0, 1, 0, 1], // 3 questions total (10×3=30 marks)
        questionsByBloom: [1, 1, 1]
      }
    ]
  });

  // Calculate unit marks
  const [unitMarks, setUnitMarks] = useState([]);

  // Update unit marks whenever the configuration changes
  useEffect(() => {
    calculateUnitMarks();
  }, [examConfig]);

  // Function to calculate marks per unit based on the current configuration
  const calculateUnitMarks = () => {
    const newUnitMarks = [];
    
    for (let i = 0; i < examConfig.units.length; i++) {
      if (!examConfig.units[i].enabled) {
        newUnitMarks.push(0);
        continue;
      }
      
      let unitTotal = 0;
      examConfig.parts.forEach(part => {
        unitTotal += part.questionsByUnit[i] * part.questionMarks;
      });
      
      newUnitMarks.push(unitTotal);
    }
    
    setUnitMarks(newUnitMarks);
  };

  // Function to handle unit checkbox toggle
  const handleUnitToggle = (unitId) => {
    const updatedUnits = examConfig.units.map(unit => 
      unit.id === unitId ? { ...unit, enabled: !unit.enabled } : unit
    );
    
    setExamConfig({
      ...examConfig,
      units: updatedUnits
    });
  };

  // Function to handle bloom checkbox toggle
  const handleBloomToggle = (bloomId) => {
    const updatedBlooms = examConfig.blooms.map(bloom => 
      bloom.id === bloomId ? { ...bloom, enabled: !bloom.enabled } : bloom
    );
    
    setExamConfig({
      ...examConfig,
      blooms: updatedBlooms
    });
  };

  // Function to handle question distribution changes
  const handleQuestionDistributionChange = (partId, unitIndex, value) => {
    const updatedParts = examConfig.parts.map(part => {
      if (part.id === partId) {
        const updatedQuestionsByUnit = [...part.questionsByUnit];
        updatedQuestionsByUnit[unitIndex] = parseInt(value) || 0;
        
        return {
          ...part,
          questionsByUnit: updatedQuestionsByUnit
        };
      }
      return part;
    });
    
    setExamConfig({
      ...examConfig,
      parts: updatedParts
    });
  };

  // Function to handle bloom distribution changes
  const handleBloomDistributionChange = (partId, bloomIndex, value) => {
    const updatedParts = examConfig.parts.map(part => {
      if (part.id === partId) {
        const updatedQuestionsByBloom = [...part.questionsByBloom];
        updatedQuestionsByBloom[bloomIndex] = parseInt(value) || 0;
        
        return {
          ...part,
          questionsByBloom: updatedQuestionsByBloom
        };
      }
      return part;
    });
    
    setExamConfig({
      ...examConfig,
      parts: updatedParts
    });
  };

  // Function to handle generate paper button click
  // UPDATED: Changed the route to connect with CreatePapers component
  const handleGeneratePaper = () => {
    // Navigate to the CreatePapers component with exam configuration data
    navigate('/create-papers', { state: { examConfig } });
  };

  // Calculate totals for validation and display
  const calculateTotals = () => {
    const partTotals = examConfig.parts.map(part => {
      const unitTotal = part.questionsByUnit.reduce((sum, count, index) => 
        examConfig.units[index].enabled ? sum + count : sum, 0) * part.questionMarks;
      
      const bloomTotal = part.questionsByBloom.reduce((sum, count, index) => 
        examConfig.blooms[index].enabled ? sum + count : sum, 0) * part.questionMarks;
      
      return { unitTotal, bloomTotal };
    });
    
    const grandTotal = partTotals.reduce((sum, part) => sum + part.unitTotal, 0);
    
    return { partTotals, grandTotal };
  };
  
  const totals = calculateTotals();

  return (
    <div className="din7-exam-details-container">
      <header className="din7-exam-header">
        <h1>Exam Pattern Configuration</h1>
        <p className="din7-header-description">
          Configure your exam pattern with units, Bloom's taxonomy levels, and question distribution
        </p>
      </header>

      <div className="din7-config-section">
        <h2>Units and Bloom's Taxonomy</h2>
        
        <div className="din7-config-row">
          <div className="din7-config-column">
            <h3>Units</h3>
            <div className="din7-checkbox-grid">
              {examConfig.units.map(unit => (
                <div key={unit.id} className="din7-checkbox-item">
                  <input
                    type="checkbox"
                    id={`unit-${unit.id}`}
                    checked={unit.enabled}
                    onChange={() => handleUnitToggle(unit.id)}
                  />
                  <label htmlFor={`unit-${unit.id}`}>
                    {unit.name} <span className="din7-marks-badge">{unitMarks[unit.id - 1]} marks</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="din7-config-column">
            <h3>Bloom's Taxonomy Levels</h3>
            <div className="din7-checkbox-grid">
              {examConfig.blooms.map(bloom => (
                <div key={bloom.id} className="din7-checkbox-item">
                  <input
                    type="checkbox"
                    id={`bloom-${bloom.id}`}
                    checked={bloom.enabled}
                    onChange={() => handleBloomToggle(bloom.id)}
                  />
                  <label htmlFor={`bloom-${bloom.id}`}>
                    Level {bloom.id}: {bloom.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="din7-config-section">
        <h2>Question Distribution</h2>
        
        <div className="din7-table-container">
          <table className="din7-distribution-table">
            <thead>
              <tr>
                <th rowSpan="2">Part</th>
                <th rowSpan="2">Description</th>
                <th rowSpan="2">Marks per Question</th>
                <th colSpan={examConfig.units.filter(u => u.enabled).length}>Questions per Unit</th>
                <th colSpan={examConfig.blooms.filter(b => b.enabled).length}>Questions per Bloom Level</th>
                <th rowSpan="2">Total Marks</th>
              </tr>
              <tr>
                {examConfig.units.map(unit => 
                  unit.enabled && <th key={`unit-header-${unit.id}`}>{unit.name}</th>
                )}
                {examConfig.blooms.map(bloom => 
                  bloom.enabled && <th key={`bloom-header-${bloom.id}`}>Level {bloom.id}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {examConfig.parts.map((part, partIndex) => (
                <tr key={part.id}>
                  <td>{part.name}</td>
                  <td>{part.description}</td>
                  <td>{part.questionMarks}</td>
                  
                  {examConfig.units.map((unit, unitIndex) => 
                    unit.enabled && (
                      <td key={`unit-cell-${unit.id}`}>
                        <input
                          type="number"
                          min="0"
                          value={part.questionsByUnit[unitIndex]}
                          onChange={(e) => handleQuestionDistributionChange(
                            part.id, 
                            unitIndex, 
                            e.target.value
                          )}
                        />
                      </td>
                    )
                  )}
                  
                  {examConfig.blooms.map((bloom, bloomIndex) => 
                    bloom.enabled && (
                      <td key={`bloom-cell-${bloom.id}`}>
                        <input
                          type="number"
                          min="0"
                          value={part.questionsByBloom[bloomIndex]}
                          onChange={(e) => handleBloomDistributionChange(
                            part.id, 
                            bloomIndex, 
                            e.target.value
                          )}
                        />
                      </td>
                    )
                  )}
                  
                  <td>{totals.partTotals[partIndex].unitTotal}</td>
                </tr>
              ))}
              <tr className="din7-total-row">
                <td colSpan="3">Grand Total</td>
                {examConfig.units.map((unit, index) => 
                  unit.enabled && <td key={`unit-total-${unit.id}`}>{unitMarks[index]}</td>
                )}
                {examConfig.blooms.map((bloom, index) => 
                  bloom.enabled && <td key={`bloom-total-${bloom.id}`}>
                    {examConfig.parts.reduce((sum, part) => 
                      sum + part.questionsByBloom[index] * part.questionMarks, 0
                    )}
                  </td>
                )}
                <td>{totals.grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="din7-action-section">
        <div className="din7-validation-message">
          {totals.grandTotal !== examConfig.totalMarks ? (
            <p className="din7-error">
              Warning: Total marks ({totals.grandTotal}) don't match expected total ({examConfig.totalMarks})
            </p>
          ) : (
            <p className="din7-success">Pattern is valid: Total marks = {totals.grandTotal}</p>
          )}
        </div>
        
        <button 
          className="din7-generate-btn"
          onClick={handleGeneratePaper}
          disabled={totals.grandTotal !== examConfig.totalMarks}
        >
          Generate Paper
        </button>
      </div>
    </div>
  );
};

export default ExamDetails;