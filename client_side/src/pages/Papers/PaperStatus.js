import { useEffect, useState } from "react";
import { getStatusOfPapers } from "../../services/paperService.js";

const PaperStatus = () => {
  const [papers, setPapers] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPaperStatus();
  }, []);

  const fetchPaperStatus = async () => {
    try {
      const data = await getStatusOfPapers();
      if (data.length === 0) {
        setMessage("⚠️ No submitted papers found.");
      } else {
        setPapers(data);
      }
    } catch (error) {
      console.error("❌ Error fetching paper status:", error);
      setMessage("⚠️ Error fetching paper status. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Paper Approval Status</h1>
      
      {message && <p className="mt-4 text-gray-700">{message}</p>}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {papers.map((paper) => (
          <div key={paper._id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{paper.course}</h2>
            <p className="text-gray-600">Status: 
              <span className={`ml-2 font-bold ${
                paper.status === "Approved" ? "text-green-600" : 
                paper.status === "Rejected" ? "text-red-600" : "text-yellow-600"
              }`}>
                {paper.status}
              </span>
            </p>
            {paper.status === "Rejected" && (
              <p className="text-red-500 mt-2">Reason: {paper.rejectionReason}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaperStatus;
