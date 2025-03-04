import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQPContext } from "../Contexts/QPContext.js";
import { motion } from "framer-motion";
import { FaBook, FaArrowRight, FaUniversity, FaBarcode, FaLayerGroup, FaCheck } from "react-icons/fa";

const IndexPage = () => {
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");
  const [selectedUnits, setSelectedUnits] = useState(1);
  const [selectedMarks, setSelectedMarks] = useState(20);
  const [loading, setLoading] = useState(false);
  const [animateError, setAnimateError] = useState(false);

  const { setSubjectDetails, updateNumUnits, updateMarks } = useQPContext();
  const navigate = useNavigate();

  const handleNext = async () => {
    if (!subjectName.trim() || !subjectCode.trim() || selectedUnits <= 0) {
      setAnimateError(true);
      setTimeout(() => setAnimateError(false), 500);
      return;
    }

    setLoading(true);

    try {
      const normalizedSubject = {
        name: subjectName.trim().toLowerCase(),
        code: subjectCode.trim().toUpperCase(),
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <motion.div 
        className="max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-4">
                <FaUniversity className="text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Open Elective MCQ Based</h1>
                <p className="opacity-80 mt-1">Enter subject details to begin</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* Subject Name Input */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <FaBook className="mr-2 text-blue-600" />
                  Subject Name
                </label>
                <motion.div
                  animate={animateError && !subjectName.trim() ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <input
                    type="text"
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    className={`border ${!subjectName.trim() && animateError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="e.g. Computer Science"
                  />
                </motion.div>
              </div>

              {/* Subject Code Input */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <FaBarcode className="mr-2 text-blue-600" />
                  Subject Code
                </label>
                <motion.div
                  animate={animateError && !subjectCode.trim() ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <input
                    type="text"
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    className={`border ${!subjectCode.trim() && animateError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    placeholder="e.g. CS101"
                  />
                </motion.div>
              </div>

              {/* Units Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <FaLayerGroup className="mr-2 text-blue-600" />
                  Number of Units
                </label>
                <select
                  value={selectedUnits}
                  onChange={(e) => setSelectedUnits(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  {[1, 2, 3, 4, 5].map((unit) => (
                    <option key={unit} value={unit}>
                      {unit} {unit === 1 ? 'Unit' : 'Units'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Marks Selection */}
              <div className="space-y-2">
                <label className="flex items-center text-gray-700 font-medium">
                  <FaCheck className="mr-2 text-blue-600" />
                  Total Marks
                </label>
                <div className="grid grid-cols-2 gap-4">
                  {[20, 30].map((mark) => (
                    <div
                      key={mark}
                      onClick={() => setSelectedMarks(mark)}
                      className={`p-3 border ${
                        selectedMarks === mark 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      } rounded-lg cursor-pointer transition-colors flex items-center justify-center`}
                    >
                      <input
                        type="radio"
                        id={`mark-${mark}`}
                        value={mark}
                        checked={selectedMarks === mark}
                        onChange={() => setSelectedMarks(mark)}
                        className="sr-only" // Hides the actual radio button
                      />
                      <span className="font-medium">{mark} Marks</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next Button */}
            <motion.button
              onClick={handleNext}
              disabled={loading}
              className="mt-8 w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md disabled:opacity-70"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <>
                  <span>Continue to Question Entry</span>
                  <FaArrowRight />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default IndexPage;