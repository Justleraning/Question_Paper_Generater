import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQPContext } from "../Contexts/QPContext.js";

const IndexPage = () => {
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [selectedUnits, setSelectedUnits] = useState(1);
  const [selectedMarks, setSelectedMarks] = useState(20);

  const { setSubjectDetails, updateNumUnits, updateMarks } = useQPContext();
  const navigate = useNavigate();
  const handleNext = async () => {
    if (subjectName.trim() && subjectCode.trim() && selectedUnits > 0) {
      try {
        const normalizedSubject = {
          name: subjectName.trim().toLowerCase(), // ✅ Convert name to lowercase
          code: subjectCode.trim().toUpperCase(), // ✅ Convert code to uppercase
        };
  
        console.log("📡 Sending request to create subject:", normalizedSubject);
  
        const response = await fetch("http://localhost:5000/api/subjects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(normalizedSubject),
        });
  
        console.log("📩 Received response:", response.status, response.statusText);
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to create subject. Server Response: ${errorText}`);
        }
  
        const data = await response.json();
        console.log("✅ Subject Created Successfully:", data);
  
        setSubjectDetails({ name: normalizedSubject.name, code: normalizedSubject.code, id: data._id });
  
        updateNumUnits(selectedUnits);
        updateMarks(selectedMarks);
  
        navigate("/questions");
      } catch (error) {
        console.error("❌ Error creating subject:", error.message);
        alert(`Failed to create subject: ${error.message}`);
      }
    } else {
      alert("⚠️ Please fill out all fields before proceeding.");
    }
  };
  
  

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Enter Subject and Unit Details</h1>

      <div className="mb-4 w-80">
        <label className="block text-sm font-medium mb-2">Subject Name</label>
        <input
          type="text"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="border rounded-lg p-2 w-full"
          placeholder="Enter subject name"
        />
      </div>

      <div className="mb-4 w-80">
        <label className="block text-sm font-medium mb-2">Subject Code</label>
        <input
          type="text"
          value={subjectCode}
          onChange={(e) => setSubjectCode(e.target.value)}
          className="border rounded-lg p-2 w-full"
          placeholder="Enter subject code"
        />
      </div>

      {/* ✅ Added Missing Unit Selection */}
      <div className="mb-4 w-80">
        <label className="block text-sm font-medium mb-2">Number of Units</label>
        <select
          value={selectedUnits}
          onChange={(e) => setSelectedUnits(Number(e.target.value))}
          className="border rounded-lg p-2 w-full"
        >
          {[1, 2, 3, 4, 5].map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Added Missing Marks Selection */}
      <div className="mb-4 w-80">
        <label className="block text-sm font-medium mb-2">Marks</label>
        <div className="flex space-x-4">
          {[20, 30].map((mark) => (
            <label key={mark} className="flex items-center space-x-2">
              <input
                type="radio"
                value={mark}
                checked={selectedMarks === mark}
                onChange={() => setSelectedMarks(mark)}
                className="form-radio"
              />
              <span>{mark} Marks</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
      >
        Next
      </button>
    </div>
  );
};

export default IndexPage;
