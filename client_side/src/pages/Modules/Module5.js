import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Module5 = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    console.log("✅ Module5 Loaded!");
  }, []);

  const handleGeneralQuestions = () => {
    setMessage("Coming soon! This feature is currently under development.");
    // Clear the message after 5 seconds
    setTimeout(() => {
      setMessage("");
    }, 5000);
  };

  return (
    <div className="ml-4">
      <h1 className="text-3xl font-bold">Entrance Exam</h1>
      <p className="text-gray-600">Manage your entrance exam papers here.</p>

      {message && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md border border-yellow-200">
          {message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-6">
        <button className="p-4 w-52 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={() => navigate("/generate-paper")}>
          Create Paper
        </button>
        <button className="p-4 w-52 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          onClick={handleGeneralQuestions}>
          General Questions
        </button>
      </div>
    </div>
  );
};

export default Module5;