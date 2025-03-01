import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaCheck, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";

const stripHtmlTags = (input) => {
  if (!input) return "__________"; // Placeholder for missing content
  const doc = new DOMParser().parseFromString(input, "text/html"); 
  return doc.body.textContent || ""; // Properly extracts only visible text
};

const PreviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);

  // Destructure state to extract relevant data
  const { questions, currentUnit } = state || {};
  const unitQuestions = questions?.[currentUnit - 1] || [];

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.3 } }
  };

  // Handle navigation between questions
  const goToNextQuestion = () => {
    if (currentPreviewIndex < unitQuestions.length - 1) {
      setCurrentPreviewIndex(currentPreviewIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentPreviewIndex > 0) {
      setCurrentPreviewIndex(currentPreviewIndex - 1);
    }
  };

  // Handle missing data gracefully
  if (!unitQuestions.length || !currentUnit) {
    return (
      <motion.div 
        className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full text-center">
          <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-6 text-gray-800">Preview Unavailable</h1>
          <p className="text-red-500 mb-6">No questions available for preview. Please go back and add questions.</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg shadow hover:bg-gray-800 transition-colors duration-200"
          >
            <FaArrowLeft className="mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">Question Preview</h1>
            <div className="flex items-center mt-2">
              <div className="px-3 py-1 bg-white bg-opacity-20 rounded-lg">
                Unit {currentUnit}
              </div>
              <div className="ml-auto px-3 py-1 bg-white bg-opacity-20 rounded-lg">
                {currentPreviewIndex + 1} of {unitQuestions.length} Questions
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200">
            <div 
              className="bg-blue-600 h-1"
              style={{ width: `${((currentPreviewIndex + 1) / unitQuestions.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Question Preview */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPreviewIndex}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-gray-50 rounded-xl p-6 mb-6"
              >
                <div className="flex items-start mb-4">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                    {currentPreviewIndex + 1}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {stripHtmlTags(unitQuestions[currentPreviewIndex].text)}
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {Object.entries(unitQuestions[currentPreviewIndex].options).map(([key, value], index) => {
                    // Handle both array and object formats
                    const optionKey = key;
                    const optionValue = typeof value === 'object' ? value.value : value;
                    const isCorrect = unitQuestions[currentPreviewIndex].correctOption === optionKey;
                    
                    return (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg border ${
                          isCorrect ? 'border-green-300 bg-green-50' : 'border-gray-200'
                        } flex items-start`}
                      >
                        <div className={`rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 ${
                          isCorrect ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {optionKey}
                        </div>
                        <div>
                          {stripHtmlTags(optionValue)}
                          {isCorrect && (
                            <div className="flex items-center mt-2 text-green-600 text-sm">
                              <FaCheck className="mr-1" /> Correct Answer
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Navigation controls */}
            <div className="flex items-center justify-between p-4 border-t">
              <button
                onClick={goToPreviousQuestion}
                disabled={currentPreviewIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentPreviewIndex === 0 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                } transition-colors duration-200`}
              >
                <FaArrowLeft className="mr-2" /> Previous
              </button>
              
              <div className="text-gray-500">
                {currentPreviewIndex + 1} / {unitQuestions.length}
              </div>
              
              <button
                onClick={goToNextQuestion}
                disabled={currentPreviewIndex === unitQuestions.length - 1}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentPreviewIndex === unitQuestions.length - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-800'
                } transition-colors duration-200`}
              >
                Next <FaArrowRight className="ml-2" />
              </button>
            </div>
          </div>
          
          {/* Bottom actions */}
          <div className="bg-gray-50 p-6 border-t flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg shadow hover:bg-gray-700 transition-colors duration-200"
            >
              <FaArrowLeft className="mr-2" />
              Back to Entry
            </button>
            <button
              onClick={() => navigate("/final-paper", { state: { questions } })}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow hover:from-blue-700 hover:to-indigo-800 transition-colors duration-200"
            >
              Finalize Paper <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PreviewPage;