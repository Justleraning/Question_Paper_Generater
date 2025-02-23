import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const QuestionEntry = () => {
  const { courseName, subjectName } = useParams(); // Extract parameters properly
  const TOTAL_QUESTIONS = 20;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [fullCourseName, setFullCourseName] = useState("Loading Course...");
  const [formattedSubject, setFormattedSubject] = useState("Loading Subject...");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState([
    { type: "Text", value: "" },
    { type: "Text", value: "" },
    { type: "Text", value: "" },
    { type: "Text", value: "" },
  ]);

  // ✅ Debugging: Log received params
  useEffect(() => {
    console.log("🔍 Received courseName:", courseName);
    console.log("🔍 Received subjectName:", subjectName);
  }, [courseName, subjectName]);

  // ✅ Ensure Course Name Displays Correctly
  useEffect(() => {
    if (courseName) {
      setFullCourseName(decodeURIComponent(courseName)); // Decode course name properly
    } else {
      setFullCourseName("Unknown Course");
    }
  }, [courseName]);

  // ✅ Ensure Subject Name Displays Correctly
  useEffect(() => {
    if (subjectName) {
      setFormattedSubject(decodeURIComponent(subjectName).replace(/-/g, " "));
    } else {
      setFormattedSubject("Custom Subject");
    }
  }, [subjectName]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
    ],
    content: questionText,
    onUpdate: ({ editor }) => setQuestionText(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-8 py-6">
      {/* ✅ Course & Subject Header */}
      <h2 className="text-2xl font-bold text-center">Enter Questions for</h2>
      <h3 className="text-lg font-semibold text-gray-700 text-center">
        {fullCourseName} - {formattedSubject}
      </h3>
      <p className="text-sm text-gray-500 text-center">
        {currentQuestionIndex} / {TOTAL_QUESTIONS} Questions
      </p>

      {/* Toolbar */}
      <div className="flex space-x-2 mb-2 border border-black p-2 rounded bg-gray-100">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className="px-3 py-2 border border-black rounded"><FaBold /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className="px-3 py-2 border border-black rounded"><FaItalic /></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()} className="px-3 py-2 border border-black rounded"><FaUnderline /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("left").run()} className="px-3 py-2 border border-black rounded"><FaAlignLeft /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("center").run()} className="px-3 py-2 border border-black rounded"><FaAlignCenter /></button>
        <button onClick={() => editor.chain().focus().setTextAlign("right").run()} className="px-3 py-2 border border-black rounded"><FaAlignRight /></button>
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
              value={options[index].type}
              onChange={(e) => {
                const updatedOptions = [...options];
                updatedOptions[index].type = e.target.value;
                updatedOptions[index].value = e.target.value === "Text" ? "" : null;
                setOptions(updatedOptions);
              }}
            >
              <option value="Text">Text</option>
              <option value="Image">Image</option>
            </select>

            {/* If Text is selected, show input box */}
            {options[index].type === "Text" && (
              <input
                type="text"
                className="border border-black p-2 w-full rounded"
                placeholder={`Enter Option ${optionLabel}`}
                value={options[index].value}
                onChange={(e) => {
                  const updatedOptions = [...options];
                  updatedOptions[index].value = e.target.value;
                  setOptions(updatedOptions);
                }}
              />
            )}

            {/* If Image is selected, show upload button */}
            {options[index].type === "Image" && (
              <input
                type="file"
                accept="image/*"
                className="border border-black p-2 rounded"
                onChange={(e) => {
                  const updatedOptions = [...options];
                  updatedOptions[index].value = URL.createObjectURL(e.target.files[0]);
                  setOptions(updatedOptions);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Correct Answer */}
      <div className="mt-4">
        <label className="block font-bold">Correct Option:</label>
        <div className="flex gap-4">
          {["A", "B", "C", "D"].map((option, index) => (
            <label key={index} className="flex items-center gap-1">
              <input type="radio" name="correctOption" value={option} />
              {option}
            </label>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          className="px-4 py-2 bg-gray-300 text-black rounded"
          onClick={() => setCurrentQuestionIndex((prev) => Math.max(1, prev - 1))}
        >
          Previous Question
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setCurrentQuestionIndex((prev) => Math.min(TOTAL_QUESTIONS, prev + 1))}
        >
          Next Question
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded">Save Question</button>
      </div>
    </div>
  );
};

export default QuestionEntry;
