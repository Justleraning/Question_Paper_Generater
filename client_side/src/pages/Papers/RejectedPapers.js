import { useEffect, useState } from "react";
import { getRejectedPapers } from "../../services/paperService.js";

const RejectedPapers = () => {
  const [papers, setPapers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchRejectedPapers();
  }, []);

  const fetchRejectedPapers = async () => {
    try {
      const data = await getRejectedPapers();
      if (data.length === 0) {
        setMessage("⚠️ No rejected papers found.");
      } else {
        setPapers(data);
      }
    } catch (error) {
      console.error("❌ Error fetching rejected papers:", error);
      setMessage("⚠️ Error fetching rejected papers. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Rejected Papers</h1>

      {message && <p className="mt-4 text-gray-700">{message}</p>}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {papers.map((paper) => (
          <div key={paper._id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{paper.course}</h2>
            <p className="text-red-500 font-semibold mt-2">Rejection Reason: {paper.rejectionReason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RejectedPapers;
