import { useEffect, useState } from "react";
import { getMyPapers, deletePaper, saveCompletedPaper } from "../../services/paperService.js";
import { useNavigate, useLocation } from "react-router-dom";

const MyPapers = () => {
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're coming from the final paper page with a success message
    if (location.state?.fromFinalPaper) {
      console.log("Navigated from Final Paper page with state:", location.state);
    }
    
    fetchPapers();
  }, [location]);

  const fetchPapers = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching papers...");
      const data = await getMyPapers();
      console.log("Fetched papers data:", data);
      setPapers(data || []); // Ensure we set an empty array if data is null
    } catch (error) {
      console.error("❌ Error fetching papers:", error);
      setPapers([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (paperId, paperTitle) => {
    if (window.confirm(`Are you sure you want to delete "${paperTitle || 'Untitled'}"?`)) {
      try {
        await deletePaper(paperId);
        fetchPapers();
      } catch (error) {
        console.error("❌ Error deleting paper:", error);
      }
    }
  };

  const handleRequestApproval = async (paperId) => {
    try {
      await saveCompletedPaper(paperId);
      fetchPapers(); // Refresh the list after requesting approval
    } catch (error) {
      console.error("❌ Error requesting approval:", error);
    }
  };

  const handleEdit = (paperId) => {
    navigate(`/edit-paper/${paperId}`);
  };

  const handleView = (paperId) => {
    navigate(`/view-paper/${paperId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white shadow-md py-6">
        <div className="container mx-auto px-6">
          <h1 className="text-3xl font-bold text-gray-800">My Papers</h1>
          {location.state?.fromFinalPaper && (
            <div className="mt-2 p-2 bg-green-100 text-green-800 rounded-md">
              Paper successfully saved! It should appear in the list below.
            </div>
          )}
        </div>
      </header>

      {/* Main Content Section */}
      <main className="container mx-auto px-6 py-10">
        {/* Refresh Button */}
        <div className="mb-6 flex justify-end">
          <button 
            onClick={fetchPapers}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Papers
          </button>
        </div>

        {/* My Papers List Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">
              All Papers 
              {!isLoading && papers.length > 0 && <span className="text-gray-500 text-sm ml-2">({papers.length})</span>}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2 text-gray-600">Loading papers...</span>
            </div>
          ) : papers && papers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {papers.map((paper) => (
                <div 
                  key={paper._id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{paper.title || "Untitled"}</h3>
                      <p className="text-gray-600 mt-1">{paper.course || "No course specified"}</p>
                      
                      {/* Paper type badge */}
                      {paper.paperType && (
                        <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
                          paper.paperType === "Mid Sem" 
                            ? "bg-blue-100 text-blue-800" 
                            : paper.paperType === "End Sem" 
                              ? "bg-green-100 text-green-800"
                              : paper.paperType === "Open Elective"
                                ? "bg-purple-100 text-purple-800"
                                : paper.paperType === "Entrance Exam"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                        }`}>
                          {paper.paperType}
                        </span>
                      )}

                      {/* Subject name if available */}
                      {paper.subjectName && (
                        <p className="text-gray-600 mt-2">
                          <span className="font-medium">Subject:</span> {paper.subjectName}
                        </p>
                      )}
                      
                      <div className="mt-2 flex items-center">
                        <span className="text-sm font-medium mr-2">Status:</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${
                          paper.status === "Approved" 
                            ? "bg-green-100 text-green-800" 
                            : paper.status === "Pending" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-gray-100 text-gray-800"
                        }`}>
                          {paper.status || "Draft"}
                        </span>
                      </div>

                      {/* Question count if available */}
                      {paper.questions && (
                        <p className="text-gray-600 mt-2">
                          <span className="font-medium">Questions:</span> {paper.questions.length}
                        </p>
                      )}

                      {/* Total marks if available */}
                      {paper.totalMarks && (
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Total Marks:</span> {paper.totalMarks}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{paper.createdAt ? new Date(paper.createdAt).toLocaleDateString() : ""}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-2">
                    <button 
                      className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                      onClick={() => handleView(paper._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>

                    <button 
                      className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                      onClick={() => handleEdit(paper._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    
                    {paper.status !== "Approved" && (
                      <button 
                        className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        onClick={() => handleRequestApproval(paper._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Submit Paper
                      </button>
                    )}
                    
                    <button 
                      className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                      onClick={() => handleDelete(paper._id, paper.title)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600 text-lg">No papers available yet.</p>
              <p className="text-gray-500 mt-2">Your papers will appear here after creating them from the question papers section.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPapers;