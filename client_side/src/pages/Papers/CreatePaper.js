import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateQuestionPaper } from "../../services/paperService.js";

const CreatePaper = () => {
  const [course, setCourse] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleGeneratePaper = async () => {
    if (!course) {
      setMessage("⚠️ Please enter a course name.");
      return;
    }

    try {
      const data = await generateQuestionPaper(course);
      if (data.success) {
        setMessage("✅ Paper generated successfully!");
        navigate("/final-preview");
      } else {
        setMessage("⚠️ Failed to generate paper. Try again.");
      }
    } catch (error) {
      console.error("❌ Error generating paper:", error);
      setMessage("⚠️ Error generating paper. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Create New Question Paper</h1>

      <div className="mt-6">
        <label className="block text-lg">Enter Course Name:</label>
        <input
          type="text"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="border p-2 rounded w-full mt-2"
          placeholder="e.g. Computer Science, Mathematics"
        />

        <button
          onClick={handleGeneratePaper}
          className="mt-4 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
        >
          Generate Paper
        </button>
      </div>

      {message && <p className="mt-4 text-gray-700">{message}</p>}
    </div>
  );
};

export default CreatePaper;
