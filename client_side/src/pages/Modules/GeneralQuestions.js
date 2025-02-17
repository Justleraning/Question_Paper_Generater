import { useState } from "react";
import { fetchGeneralQuestions } from "../../services/paperService.js";

const GeneralQuestions = () => {
  const [stream, setStream] = useState("");
  const [questions, setQuestions] = useState([]);
  const [message, setMessage] = useState("");

  const handleFetch = async () => {
    if (!stream) {
      setMessage("⚠️ Please enter a stream name.");
      return;
    }

    try {
      const data = await fetchGeneralQuestions(stream);
      if (data.length === 0) {
        setMessage("❌ No questions available for this stream.");
      } else {
        setQuestions(data);
        setMessage("");
      }
    } catch (error) {
      console.error("❌ Error fetching general questions:", error);
      setMessage("⚠️ Error fetching questions. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Fetch General Questions</h1>
      <div className="mt-4">
        <label className="block text-lg">Select Stream:</label>
        <input
          type="text"
          value={stream}
          onChange={(e) => setStream(e.target.value)}
          className="border p-2 rounded w-full mt-2"
          placeholder="Enter Stream Name (e.g. CSE, ECE)"
        />
        <button
          onClick={handleFetch}
          className="mt-4 bg-green-500 text-white p-2 rounded hover:bg-green-600 transition"
        >
          Fetch Questions
        </button>
      </div>

      {message && <p className="mt-4 text-gray-700">{message}</p>}

      <ul className="mt-6 space-y-3">
        {questions.map((q, index) => (
          <li key={index} className="p-4 bg-white shadow-md rounded-md">{q.text}</li>
        ))}
      </ul>
    </div>
  );
};

export default GeneralQuestions;
