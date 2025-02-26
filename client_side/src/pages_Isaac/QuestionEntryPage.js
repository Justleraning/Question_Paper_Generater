import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQPContext } from "../Contexts/QPContext.js";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import { 
  FaBold, FaItalic, FaUnderline, 
  FaAlignLeft, FaAlignCenter, FaAlignRight
} from "react-icons/fa";



const QuestionEntryPage = () => {
  const { subjectDetails, numUnits, marks, questions, setQuestions } = useQPContext();
const subjectId = subjectDetails?.id; // ✅ Extract subjectId from subjectDetails
  const [currentUnit, setCurrentUnit] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [unitId, setUnitId] = useState(null);
  const [isFetchingUnitId, setIsFetchingUnitId] = useState(true);
  const navigate = useNavigate();

  const totalQuestions = marks === 20 ? 40 : 60;
  const questionsPerUnit = Math.floor(totalQuestions / numUnits);
  const currentQuestions = questions?.[currentUnit - 1] || [];
  const subjectName = subjectDetails?.name || "Default Subject";
const courseTitle = subjectDetails?.course || "Untitled Course";

  useEffect(() => {
    let isMounted = true;

    // ✅ Do not fetch unitId if no question has been entered yet
    if (questions.length === 0) {
        console.log("🚫 Skipping fetchUnitId because no questions have been entered yet.");
        return;
    }

    setIsFetchingUnitId(true);

    const fetchUnitId = async () => {
        try {
            console.log(`🔄 Fetching unit ID for Unit ${currentUnit}...`, subjectId);

            const response = await fetch("http://localhost:5000/api/units");

            if (!response.ok) {
                throw new Error(`❌ Failed to fetch units: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("📜 Fetched Units Data:", data);

            if (data.units && data.units.length > 0) {
                console.log(`🔍 Searching for Unit ${currentUnit} with subjectId:`, subjectId);

                // ✅ Ensure we check both the name and subjectId
                const fetchedUnit = data.units.find(
                    u => u.name === `Unit ${currentUnit}` && u.subjectId === subjectId
                );

                if (fetchedUnit) {
                    setUnitId(fetchedUnit._id || fetchedUnit.unitId);
                    console.log(`✅ Successfully set Unit ID: ${fetchedUnit._id || fetchedUnit.unitId}`);
                } else {
                    console.warn(`⚠️ No matching unit found for "Unit ${currentUnit}"`);
                    setUnitId(null);
                }
            } else {
                console.warn("⚠️ No units found in API response.");
                setUnitId(null);
            }
        } catch (error) {
            console.error("❌ Error fetching unitId:", error);
            setUnitId(null);
        } finally {
            if (isMounted) {
                setIsFetchingUnitId(false);
            }
        }
    };

    fetchUnitId();

    return () => {
        isMounted = false;
    };
}, [currentUnit, questions.length]); // ✅ Only fetch unitId if questions exist


const [questionText, setQuestionText] = useState(""); // ✅ Define questionText state
const editor = useEditor({
  extensions: [
    StarterKit,
    Bold,
    Italic,
    TextAlign.configure({
      types: ["paragraph","heading"],
    }),
  ],
  content: questionText, 
  onUpdate: ({ editor }) => {
    setQuestionText(editor.getHTML()); 
  },
});


  const [correctOption, setCorrectOption] = useState("");
  const [options, setOptions] = useState({
    A: { type: "text", value: "" },
    B: { type: "text", value: "" },
    C: { type: "text", value: "" },
    D: { type: "text", value: "" },
  });

  // Save question to backend

// ✅ Ensure subjectId is passed when creating a unit
const handleSaveQuestion = async () => {
  console.log("🔍 Checking subjectId before saving:", subjectId);

  if (!subjectId) {
    console.error("❌ Validation Failed: subjectId is missing!");
    alert("⚠️ Subject ID is missing. Please try again.");
    return;
  }

  // ✅ Get authentication token
  const token = sessionStorage.getItem("token");

  if (!token) {
    alert("❌ Authentication failed: No token found in session.");
    return;
  }

  // ✅ Clean and validate input fields
  const cleanedQuestionText = editor.getText()?.trim() || "";
  if (!cleanedQuestionText) {
    alert("⚠️ Please enter a valid question.");
    return;
  }
  const formattedOptions = [
    options.A.value?.trim() || "",
    options.B.value?.trim() || "",
    options.C.value?.trim() || "",
    options.D.value?.trim() || "",
];

  if (!Array.isArray(formattedOptions) || formattedOptions.length !== 4 || formattedOptions.some(opt => opt === "")) {
      alert("⚠️ Please provide exactly 4 valid options.");
      return;
  }
  
  if (!["A", "B", "C", "D"].includes(correctOption)) {
    alert("⚠️ Please select a valid correct option (A, B, C, or D).");
    return;
  }

  // ✅ Construct the question data correctly
  const newQuestion = {
    subjectId,
    text: cleanedQuestionText,
    options: [
      options.A.value?.trim() || "",
      options.B.value?.trim() || "",
      options.C.value?.trim() || "",
      options.D.value?.trim() || "",
    ], // ✅ Ensure options is an array
    correctOption: correctOption.trim(),
    isImage: formattedOptions.some(opt => opt.startsWith("http")),
    index: currentQuestionIndex + 1, // ✅ Ensure this exists
    subject: subjectName || "Default Subject", // ✅ Ensure this is defined
    courseName: courseTitle || "Untitled Course" // ✅ Ensure this is defined
  };
  

  console.log("📤 Sending Question to API:", JSON.stringify(newQuestion, null, 2));

  try {
    const response = await fetch("http://localhost:5000/api/questions-isaac", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(newQuestion),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to save question: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Successfully saved question:", data.newQuestion);

    alert("✅ Question saved successfully!");

    // ✅ Reset fields after saving
    setQuestionText("");
    setCorrectOption("");
    setOptions({
      A: { type: "text", value: "" },
      B: { type: "text", value: "" },
      C: { type: "text", value: "" },
      D: { type: "text", value: "" },
    });

  } catch (error) {
    console.error("❌ Error saving question:", error.message);
    alert(`❌ Failed to save question: ${error.message}`);
  }
};

  // Navigation handlers
  const handleNextQuestion = () => {
    if (currentQuestionIndex < currentQuestions.length - 1) {
        const nextQuestion = currentQuestions[currentQuestionIndex + 1];
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        
        setQuestionText(nextQuestion.text || "");
        setCorrectOption(nextQuestion.correctOption || "");
        setOptions({
            A: { type: "text", value: nextQuestion.options?.[0] || "" },
            B: { type: "text", value: nextQuestion.options?.[1] || "" },
            C: { type: "text", value: nextQuestion.options?.[2] || "" },
            D: { type: "text", value: nextQuestion.options?.[3] || "" },
        });
    }
};

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevQuestion = currentQuestions[currentQuestionIndex - 1];
      setCurrentQuestionIndex((prevIndex) => prevIndex - 1);
      setQuestionText(prevQuestion.text);
      setCorrectOption(prevQuestion.correctOption);
      setOptions(prevQuestion.options);
    }
  };

  const handleNextUnit = () => {
    if (currentUnit < numUnits) {
        setCurrentUnit(prevUnit => prevUnit + 1);
        setCurrentQuestionIndex(0);

        // Reset question fields when switching units
        setQuestionText("");
        setCorrectOption("");
        setOptions({
            A: { type: "text", value: "" },
            B: { type: "text", value: "" },
            C: { type: "text", value: "" },
            D: { type: "text", value: "" },
        });
    } else {
        navigate("/final-paper");
    }
};

return (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-100">
    <h1 className="text-2xl font-bold mb-4">Question Entry</h1>

    <h2 className="text-lg font-medium mb-2">
      Unit {currentUnit} of {numUnits}
    </h2>
    <p className="mb-4 text-center">
      Total questions per unit: <strong>{questionsPerUnit}</strong> <br />
      Current questions: <strong>{currentQuestions.length}/{questionsPerUnit}</strong>
    </p>

    {/* ✅ Main Container - Proper Height Without Overlapping */}
    <div className="w-full max-w-2xl border rounded-lg shadow-md bg-white flex flex-col h-[80vh]">
      
      {/* ✅ Scrollable Content - Extra Padding to Avoid Overlap */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        
        {/* ✅ Fixed Editor Size to Prevent Expanding Overlap */}
        <label className="block text-sm font-medium mb-2">Question Text</label>
       
       {/* ✅ Toolbar Section */}
<div className="p-3 border-b flex justify-center space-x-2 bg-gray-200">
<button onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-2 border"><FaBold /></button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-3 py-2 border"><FaItalic /></button>
          <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="px-3 py-2 border"><FaAlignLeft /></button>
          <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="px-3 py-2 border"><FaAlignCenter /></button>
          <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="px-3 py-2 border"><FaAlignRight /></button>
</div>

        <EditorContent 
          editor={editor} 
          className="border rounded-lg w-full p-2 max-h-32 overflow-y-auto mb-4"
        />

        {/* ✅ Option Inputs */}
        {["A", "B", "C", "D"].map((key) => (
          <div key={key} className="mb-4">
            <label className="block text-sm font-medium">Option {key}</label>
            <input
              type="text"
              value={options[key].value}
              onChange={(e) => setOptions({ ...options, [key]: { type: "text", value: e.target.value } })}
              className="border rounded-lg p-2 w-full"
              placeholder={`Enter option ${key}`}
            />
          </div>
        ))}

        {/* ✅ Correct Option Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Correct Option</label>
          <div className="flex space-x-4 justify-center">
            {["A", "B", "C", "D"].map((key) => (
              <label key={key} className="flex items-center space-x-2">
                <input
                  type="radio"
                  value={key}
                  checked={correctOption === key}
                  onChange={() => setCorrectOption(key)}
                  className="form-radio"
                />
                <span>{key}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {!isFetchingUnitId && (
        <p className="text-sm text-gray-600 text-center mb-2">
          ✅ Unit ID: {unitId}
        </p>
      )}
      {/* Buttons Section - Fixed at Bottom */}
      <div className="p-4 border-t bg-white sticky bottom-0 flex justify-center space-x-4">
        <button
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
        >
          Previous Question
        </button>

        <button
          onClick={handleNextQuestion}
          disabled={currentQuestionIndex >= currentQuestions.length - 1}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
        >
          Next Question
        </button>

        <button onClick={handleSaveQuestion} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
          Save Question
        </button>

        <button onClick={handleNextUnit} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          {currentUnit < numUnits ? "Next Unit" : "Final Preview"}
        </button>
      </div>
    </div>
  </div>
);

};

export default QuestionEntryPage;