
// PaperApproval.jsx
import { useEffect, useState } from "react";
import { getApprovalPapers, approvePaper, rejectPaper } from "../../services/paperService.js";

const PaperApproval = () => {
  const [papers, setPapers] = useState([]);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    const data = await getApprovalPapers();
    setPapers(data);
  };

  const handleApprove = async (paperId) => {
    await approvePaper(paperId);
    fetchPapers();
  };

  const handleReject = async (paperId) => {
    await rejectPaper(paperId, rejectionReason);
    fetchPapers();
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Approve Papers</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {papers.map((paper) => (
          <div key={paper._id} className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold">{paper.course}</h2>
            <p className="text-gray-600">Status: {paper.status}</p>
            <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition" onClick={() => handleApprove(paper._id)}>Approve</button>
            <input type="text" placeholder="Rejection Reason" className="border p-2 w-full rounded-md my-2" onChange={(e) => setRejectionReason(e.target.value)} />
            <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => handleReject(paper._id)}>Reject</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaperApproval;