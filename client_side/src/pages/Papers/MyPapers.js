import { useEffect, useState } from "react";
import { getMyPapers, deletePaper, requestApproval } from "../../services/paperService.js";
import { useNavigate } from "react-router-dom";

const MyPapers = () => {
  const [papers, setPapers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const data = await getMyPapers();
      setPapers(data);
    } catch (error) {
      console.error("❌ Error fetching papers:", error);
    }
  };

  const handleDelete = async (paperId) => {
    try {
      await deletePaper(paperId);
      fetchPapers();
    } catch (error) {
      console.error("❌ Error deleting paper:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">My Papers</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {papers.length > 0 ? (
          papers.map((paper) => (
            <div key={paper._id} className="bg-white p-4 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{paper.course}</h2>
              <button className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                onClick={() => handleDelete(paper._id)}>
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No saved papers yet.</p>
        )}
      </div>
    </div>
  );
};

export default MyPapers;
