import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const stripHtmlTags = (input) => {
  if (!input) return "__________"; // Placeholder for missing content
  const doc = new DOMParser().parseFromString(input, "text/html"); 
  return doc.body.textContent || ""; // ✅ Properly extracts only visible text
};

const PreviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Destructure state to extract relevant data
  const { questions, currentUnit } = state || {};
  const unitQuestions = questions?.[currentUnit - 1] || [];

  // Handle missing data gracefully
  if (!unitQuestions.length || !currentUnit) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-6">Preview</h1>
        <p className="text-red-500">No questions available for preview. Please go back and add questions.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg mt-4"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-2">Question Entry</h1>
      <h2 className="text-lg mb-4">Unit {currentUnit} Preview</h2>

      {unitQuestions.map((question, index) => (
        <div key={index} className="mb-4 border-b pb-2 w-full max-w-3xl">
          <p className="font-medium">{index + 1}. {stripHtmlTags(question.text)}</p> {/* ✅ FIXED */}
          <ul className="grid grid-cols-2 gap-4">
            <li>A: {stripHtmlTags(question.options.A.value)}</li>
            <li>B: {stripHtmlTags(question.options.B.value)}</li>
            <li>C: {stripHtmlTags(question.options.C.value)}</li>
            <li>D: {stripHtmlTags(question.options.D.value)}</li>
          </ul>
        </div>
      ))}

      {/* Navigation Buttons */}
      <div className="flex space-x-4 mt-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg"
        >
          Back to Entry
        </button>
        <button
          onClick={() => navigate("/final-paper", { state: { questions } })}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Finalize
        </button>
      </div>
    </div>
  );
};

export default PreviewPage;
