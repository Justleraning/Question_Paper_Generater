import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { 
  FaBold, FaItalic, FaUnderline, 
  FaAlignLeft, FaAlignCenter, FaAlignRight
} from "react-icons/fa";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuestionByIndex, saveQuestion } from "../../services/paperService.js";

const TOTAL_QUESTIONS = 20;

const QuestionEntry = () => {
  const navigate = useNavigate();
  const { courseName, subjectName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName);
  const decodedSubjectName = decodeURIComponent(subjectName);
  const [showWarning, setShowWarning] = useState(false);
  
  const subjects = {
    LR: "Logical Reasoning",
    QP: "Quantitative Problem Solving",
    ENG: "English",
    CUSTOM: decodedSubjectName, // Dynamic custom subject name
  };

  const [selectedSubject, setSelectedSubject] = useState("LR");
  const [progress, setProgress] = useState({
    LR: { index: 1, questions: {} },
    QP: { index: 1, questions: {} },
    ENG: { index: 1, questions: {} },
    CUSTOM: { index: 1, questions: {} },
  });

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { type: "Text", value: "" },
    { type: "Text", value: "" },
    { type: "Text", value: "" },
    { type: "Text", value: "" },
  ]);
  const [correctOption, setCorrectOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false, 
        italic: false
      }),
      Bold, 
      Italic, 
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image
    ],
    content: questionText,
    onUpdate: ({ editor }) => setQuestionText(editor.getHTML()),
  });

  // Modified fetchQuestion function with better error handling
  const fetchQuestion = async (index) => {
    try {
      setIsLoading(true);
      console.log(`📡 Fetching question for index ${index}`);

      const data = await getQuestionByIndex(decodedCourseName, subjects[selectedSubject], index);

      if (data && data.question && Array.isArray(data.options)) {
        console.log("✅ Question fetched:", data);
        setQuestionText(data.question);

        // ✅ Handle Text & Image Options Correctly
        const formattedOptions = data.options.map(opt => ({
          type: opt.type,
          value: opt.type === "Image" ? opt.value : opt.value || "",
          fileName: opt.fileName || ""
        }));

        setOptions([...formattedOptions, ...new Array(4 - formattedOptions.length).fill({ type: "Text", value: "" })]);
        setCorrectOption(data.correctOption || null);

        if (editor) {
          editor.commands.setContent(data.question);
        }
        
        // Add to progress state
        setProgress(prev => ({
          ...prev,
          [selectedSubject]: {
            ...prev[selectedSubject],
            questions: {
              ...prev[selectedSubject].questions,
              [index]: { 
                text: data.question, 
                options: formattedOptions,
                correctOption: data.correctOption
              }
            }
          }
        }));
      } else {
        console.warn(`⚠️ No question found at index ${index}. Resetting fields.`);
        resetFields();
      }
    } catch (error) {
      console.error("❌ Error fetching question:", error);
      resetFields();
    } finally {
      setIsLoading(false);
    }
  };

  // Improved handleSubjectChange - saves current state before switching
  const handleSubjectChange = (subject) => {
    // First save the current state for current subject
    if (questionText.trim()) {
      setProgress((prev) => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          questions: {
            ...prev[selectedSubject].questions,
            [prev[selectedSubject].index]: { 
              text: questionText, 
              options,
              correctOption
            },
          },
        },
      }));
    }
    
    // Now change the subject
    setSelectedSubject(subject);
    
    // Load question for the new subject
    setTimeout(() => {
      // If we have cached data for this subject's current index, use it
      const currentIndex = progress[subject].index;
      if (progress[subject].questions[currentIndex]) {
        const savedQuestion = progress[subject].questions[currentIndex];
        setQuestionText(savedQuestion.text || "");
        setOptions(savedQuestion.options || [
          { type: "Text", value: "" },
          { type: "Text", value: "" },
          { type: "Text", value: "" },
          { type: "Text", value: "" },
        ]);
        setCorrectOption(savedQuestion.correctOption || null);
        
        if (editor) {
          editor.commands.setContent(savedQuestion.text || "");
        }
      } else {
        // Fetch from backend
        fetchQuestion(currentIndex);
      }
    }, 100);
  };

  // Check if we have cached questions when subject changes
  useEffect(() => {
    // If we have the question cached in progress state, use that
    const currentIndex = progress[selectedSubject].index;
    if (progress[selectedSubject].questions[currentIndex]) {
      console.log(`✅ Loading cached question for ${selectedSubject} index ${currentIndex}`);
      const savedQuestion = progress[selectedSubject].questions[currentIndex];
      setQuestionText(savedQuestion.text || "");
      setOptions(savedQuestion.options || [
        { type: "Text", value: "" },
        { type: "Text", value: "" },
        { type: "Text", value: "" },
        { type: "Text", value: "" },
      ]);
      setCorrectOption(savedQuestion.correctOption || null);
      
      if (editor) {
        editor.commands.setContent(savedQuestion.text || "");
      }
    } else {
      // Otherwise fetch from backend
      fetchQuestion(currentIndex);
    }
  }, [selectedSubject]);

  // Load question when index changes
  useEffect(() => {
    const currentIndex = progress[selectedSubject].index;
    
    // First check if we already have this question in our local state
    if (progress[selectedSubject].questions[currentIndex]) {
      console.log(`✅ Loading cached question for index ${currentIndex}`);
      const savedQuestion = progress[selectedSubject].questions[currentIndex];
      setQuestionText(savedQuestion.text || "");
      setOptions(savedQuestion.options || [
        { type: "Text", value: "" },
        { type: "Text", value: "" },
        { type: "Text", value: "" },
        { type: "Text", value: "" },
      ]);
      setCorrectOption(savedQuestion.correctOption || null);
      
      if (editor) {
        editor.commands.setContent(savedQuestion.text || "");
      }
    } else {
      // If not cached, fetch from backend
      fetchQuestion(currentIndex);
    }
  }, [progress[selectedSubject].index]);

  const resetFields = () => {
    setQuestionText("");
    setOptions([
      { type: "Text", value: "" },
      { type: "Text", value: "" },
      { type: "Text", value: "" },
      { type: "Text", value: "" },
    ]);
    setCorrectOption(null);

    if (editor) {
      editor.commands.setContent("");
    }
  };

  const saveQuestionToBackend = async () => {
    try {
      if (!questionText.trim()) {
        console.warn("⚠️ Question text is empty. Skipping save.");
        return;
      }

      const formattedOptions = (options || [])
        .filter(opt => opt && typeof opt.value === "string")
        .map(opt => ({
          type: opt.type || "Text",
          value: opt.value.trim(),
          fileName: opt.fileName || ""
        }))
        .filter(opt => opt.value.length > 0);

      if (formattedOptions.length < 2) {
        console.warn("⚠️ At least two options are required.");
        return;
      }

      if (!correctOption) {
        console.warn("⚠️ Correct Option is missing.");
        return;
      }

      const payload = {
        courseName: decodedCourseName,
        subject: subjects[selectedSubject],
        question: questionText,
        options: formattedOptions,
        correctOption,
        index: progress[selectedSubject].index,
      };

      console.log("📤 Sending question to backend:", JSON.stringify(payload, null, 2));

      const response = await saveQuestion(decodedCourseName, decodedSubjectName, payload);

      console.log("✅ Backend Response:", response);

      if (response && response.message) {
        console.log("✅ Question saved successfully!");
      }

    } catch (error) {
      console.error("❌ Error saving question:", error.response?.data || error.message);
    }
  };

  // Improved handleNextQuestion - better saves state and navigates
  const handleNextQuestion = async () => {
    await saveQuestionToBackend(); // Save current question to backend
    
    // Update local progress state with current question data
    setProgress((prev) => {
      const nextIndex = prev[selectedSubject].index + 1;
      return {
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          index: nextIndex,
          questions: {
            ...prev[selectedSubject].questions,
            [prev[selectedSubject].index]: { 
              text: questionText, 
              options,
              correctOption
            },
          },
        },
      };
    });
    
    // Fetch or load the next question happens in the useEffect
  };

  // Improved handlePreviousQuestion - saves current state before navigating
  const handlePreviousQuestion = async () => {
    if (progress[selectedSubject].index > 1) {
      // First save the current question
      await saveQuestionToBackend();
      
      // Save current question state in progress
      setProgress((prev) => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          questions: {
            ...prev[selectedSubject].questions,
            [prev[selectedSubject].index]: { 
              text: questionText, 
              options,
              correctOption
            },
          },
          index: prev[selectedSubject].index - 1,
        },
      }));
      
      // The useEffect will handle loading the previous question
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-8 py-6 min-h-screen overflow-y-auto pb-32">

      {/* ✅ Subject Selection Buttons */}
      <div className="flex space-x-4 mb-4">
        {["LR", "QP", "ENG", "CUSTOM"].map((sub) => (
          <button
            key={sub}
            onClick={() => handleSubjectChange(sub)}
            className={`px-4 py-2 rounded ${selectedSubject === sub ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {subjects[sub]}
          </button>
        ))}
      </div>

      {/* ✅ Show Currently Entering Subject */}
      <h2 className="text-lg font-semibold">Currently Entering: {subjects[selectedSubject] || "Custom Subject"}</h2>

      <h2 className="text-2xl font-bold text-center">Enter Questions for</h2>
      <h3 className="text-lg font-semibold text-gray-700 text-center">
        {decodedCourseName} - {decodedSubjectName}
      </h3>

      <p className="text-sm text-gray-500 text-center">{progress[selectedSubject].index} / {TOTAL_QUESTIONS} Questions</p>

      {/* Toolbar */}
      <div className="flex space-x-2 mb-2 border border-black p-2 rounded bg-gray-100">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-2 border"><FaBold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-3 py-2 border"><FaItalic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-3 py-2 border"><FaUnderline /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="px-3 py-2 border"><FaAlignLeft /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="px-3 py-2 border"><FaAlignCenter /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="px-3 py-2 border"><FaAlignRight /></button>
      </div>

      {/* Question Editor */}
      <div className="w-full max-w-3xl border border-black rounded p-2">
        <EditorContent editor={editor} />
      </div>

      {/* Options A, B, C, D */}
      <div className="mt-6 w-full">
        <label className="block font-bold">Options:</label>
        {["A", "B", "C", "D"].map((optionLabel, index) => (
        <div key={index} className="flex items-center gap-3 mt-2">
          <span className="font-bold">{optionLabel}.</span>

          {/* Dropdown to select Text or Image */}
          <select
            className="border border-black p-1 rounded w-24 text-sm"
            value={options[index]?.type || "Text"}
            onChange={(e) => {
              const updatedOptions = [...options];
              const previousValue = updatedOptions[index]?.value || ""; // Preserve previous value
              const previousFileName = updatedOptions[index]?.fileName || ""; // Preserve filename

              updatedOptions[index] = { 
                type: e.target.value, 
                value: e.target.value === "Text" ? "" : previousValue, // Retain image URL
                fileName: e.target.value === "Text" ? "" : previousFileName // Retain file name
              };

              setOptions(updatedOptions);
            }}
          >
            <option value="Text">Text</option>
            <option value="Image">Image</option>
          </select>

          {/* If Text is selected, show input box */}
          {options[index]?.type === "Text" && (
            <input
              type="text"
              className="border border-black p-2 w-full rounded"
              placeholder={`Enter Option ${optionLabel}`}
              value={options[index]?.value || ""}
              onChange={(e) => {
                const updatedOptions = [...options];
                updatedOptions[index].value = e.target.value;
                setOptions(updatedOptions);
              }}
            />
          )}

          {/* If Image is selected, show upload button */}
          {options[index]?.type === "Image" && (
            <div className="flex items-center gap-2">
              {/* ✅ File input for selecting a new image */}
              <input
                type="file"
                accept="image/*"
                className="border border-black p-2 rounded"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const updatedOptions = [...options];

                    // ✅ Store the image URL (blob for preview) and filename
                    updatedOptions[index].value = URL.createObjectURL(file);
                    updatedOptions[index].fileName = file.name;

                    // ✅ Update state
                    setOptions(updatedOptions);
                  }
                }}
              />

              {/* ✅ Show selected file name (next to Choose File button) */}
              {options[index]?.fileName && <span className="text-sm">{options[index].fileName}</span>}

              {/* ✅ Show image preview **only if a file is selected** */}
              {options[index]?.value && (
                <img 
                  src={options[index].value} 
                  alt="Uploaded preview" 
                  className="h-10 w-10 object-cover rounded border border-gray-300" 
                />
              )}
            </div>
          )}
        </div>
      ))}
      </div>

      {/* Correct Answer Selection */}
      <div className="mt-4">
        <label className="block font-bold">Correct Option:</label>
        <div className="flex gap-4">
          {["A", "B", "C", "D"].map((option, index) => (
            <label key={index} className="flex items-center gap-1">
              <input 
                type="radio" 
                name="correctOption" 
                value={option} 
                checked={correctOption === option} 
                onChange={() => setCorrectOption(option)} 
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-6">
        <button 
          className="px-4 py-2 bg-gray-300 text-black rounded" 
          onClick={handlePreviousQuestion} 
          disabled={progress[selectedSubject].index === 1}
        >
          Previous Question
        </button>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded" 
          onClick={handleNextQuestion}
        >
          Next Question
        </button>
      </div>

      {/* ✅ Warning Message (Shows for 3 seconds when clicked too early) */}
      {showWarning && (
        <div className="mb-2 px-4 py-2 bg-red-500 text-white text-sm font-semibold rounded-lg text-center">
          ⚠️ Please complete all subjects before previewing the final paper!
        </div>
      )}

      <div className="flex gap-4 mt-4 justify-center">
        {/* ✅ Preview Button (For Current Subject) */}
        <button 
  className="w-48 px-4 py-2 bg-green-500 text-white rounded text-center"
  onClick={() => {
    // Save the current state first 
    if (questionText.trim()) {
      setProgress((prev) => ({
        ...prev,
        [selectedSubject]: {
          ...prev[selectedSubject],
          questions: {
            ...prev[selectedSubject].questions,
            [prev[selectedSubject].index]: { 
              text: questionText, 
              options,
              correctOption
            },
          },
        },
      }));
    }
    
    // Save current course in localStorage as a fallback
    localStorage.setItem("currentCourse", decodedCourseName);
    
    // Navigate to the preview with state
    navigate(`/preview/${selectedSubject}`, {
      state: {
        courseName: decodedCourseName,
        customSubjectName: decodedSubjectName
      }
    });
  }}
>
  Preview {subjects[selectedSubject]} Questions
</button>

        {/* ✅ Show Final Preview Button Only When All Subjects Are Completed */}
        {Object.values(progress).every(sub => Object.keys(sub.questions).length === TOTAL_QUESTIONS) ? (
          <button 
            className="w-48 px-4 py-2 bg-purple-500 text-white rounded text-center"
            onClick={() => navigate("/final-preview")}
          >
            Final Preview
          </button>
        ) : (
          <button 
            className="w-48 px-4 py-2 bg-gray-400 text-white rounded text-center cursor-not-allowed"
            onClick={() => {
              setShowWarning(true);
              setTimeout(() => setShowWarning(false), 3000);
            }}
          >
            Final Preview
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionEntry;