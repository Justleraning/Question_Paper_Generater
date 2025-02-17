import { useState, useEffect } from "react";
import { getFinalPreview } from "../../services/paperService.js";

const FinalPreview = () => {
  const [paper, setPaper] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchFinalPreview();
  }, []);

  const fetchFinalPreview = async () => {
    try {
      const data = await getFinalPreview();
      if (!data || Object.keys(data).length === 0) {
        setMessage("⚠️ No paper available for final preview.");
      } else {
        setPaper(data);
      }
    } catch (error) {
      console.error("❌ Error fetching final preview:", error);
      setMessage("⚠️ Error loading final preview. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Final Paper Preview</h1>

      {message && <p className="mt-4 text-gray-700">{message}</p>}

      {paper ? (
        <div className="mt-4 p-6 bg-white shadow-md rounded-md">
          <h2 className="text-xl font-semibold">Course: {paper.course}</h2>
          
          <h3 className="text-lg font-medium mt-4">Sections:</h3>
          {paper.sections.map((section, index) => (
            <div key={index} className="mt-4 p-4 border rounded-md">
              <h4 className="font-semibold">{section.name}</h4>
              <ul className="mt-2 space-y-2">
                {section.questions.map((q, qIndex) => (
                  <li key={qIndex} className="bg-gray-100 p-2 rounded">{q.text}</li>
                ))}
              </ul>
            </div>
          ))}

          <button 
            className="mt-6 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
            onClick={() => alert("Paper submitted for approval!")}
          >
            Submit for Approval
          </button>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No preview available.</p>
      )}
    </div>
  );
};

export default FinalPreview;
