import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitQuestion } from "../../services/paperService.js";

const QuestionEntry = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, subjects } = location.state || {};

  const [selectedSubject, setSelectedSubject] = useState(subjects[0]);
  const [questions, setQuestions] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctOption, setCorrectOption] = useState(null);

  const handleSubmitQuestion = async () => {
    if (!currentQuestion.trim()) {
      alert("Please enter a question.");
      return;
    }
    if (correctOption === null) {
      alert("Please select a correct answer.");
      return;
    }

    const questionData = {
      course,
      subject: selectedSubject,
      questionText: currentQuestion,
      options,
      correctAnswer: options[correctOption],
    };

    try {
      await submitQuestion(questionData); // ✅ Function name changed
      alert("Question saved successfully!");

      setQuestions((prev) => ({
        ...prev,
        [selectedSubject]: [...(prev[selectedSubject] || []), questionData],
      }));

      setCurrentQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectOption(null);
    } catch (error) {
      console.error("❌ Error saving question:", error);
    }
  };

  const handleSubjectChange = (newSubject) => {
    setSelectedSubject(newSubject);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Question Entry for {course}</h1>

      {/* Subject Selection */}
      <div className="mt-4 flex space-x-4">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => handleSubjectChange(subject)}
            className={`px-4 py-2 rounded-md ${
              selectedSubject === subject
                ? "bg-blue-500 text-white"
                : "bg-gray-300"
            }`}
          >
            {subject}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-4">Subject: {selectedSubject}</h2>

      {/* Question Input */}
      <div className="mt-4">
        <label className="block text-lg">Enter Question:</label>
        <textarea
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          className="border p-2 rounded w-full mt-2"
        />
      </div>

      {/* Options Input */}
      {options.map((option, idx) => (
        <div key={idx} className="mt-2 flex items-center space-x-2">
          <input
            type="text"
            value={option}
            onChange={(e) =>
              setOptions(
                options.map((opt, i) => (i === idx ? e.target.value : opt))
              )
            }
            className="border p-2 rounded w-full"
            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
          />
          <input
            type="radio"
            name="correctOption"
            checked={correctOption === idx}
            onChange={() => setCorrectOption(idx)}
          />
        </div>
      ))}

      {/* Buttons for Saving & Navigation */}
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleSubmitQuestion} // ✅ Function name changed
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save Question
        </button>

        {questions[selectedSubject] && (
          <button
            onClick={() =>
              navigate("/question-preview", {
                state: { course, subject: selectedSubject, questions: questions[selectedSubject] },
              })
            }
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Preview {selectedSubject}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionEntry;
