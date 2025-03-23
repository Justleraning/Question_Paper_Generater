import { useEffect, useState } from "react";
import { getResetRequests, approveResetRequest } from "../../services/authService.js";

const ResetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage("");
      
      console.log("Fetching reset requests...");
      const data = await getResetRequests();
      console.log("Reset requests received:", data);
      
      // Ensure data is an array
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching reset requests:", err);
      setError("Failed to load reset requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (username) => {
    try {
      setSuccessMessage("");
      setError(null);
      
      console.log(`Approving reset for: ${username}`);
      await approveResetRequest(username);
      
      setSuccessMessage(`Password reset approved for ${username}`);
      fetchRequests(); // Refresh the list
    } catch (err) {
      console.error(`Error approving reset for ${username}:`, err);
      setError(`Failed to approve reset for ${username}. Please try again.`);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Reset Password Requests</h1>
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{successMessage}</p>
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="mb-4">
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition flex items-center"
          onClick={fetchRequests}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Requests"}
        </button>
      </div>
      
      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <p className="text-gray-600">Loading reset requests...</p>
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {requests.map((request, index) => (
  <div key={request._id || index} className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold">
      {request.fullName || "User: " + (request.username || "Unknown")}
    </h2>
    <p className="text-gray-600 mb-2">Username: {request.username || "N/A"}</p>
    {/* Only show role if it exists */}
    {request.role && (
      <p className="text-gray-600 mb-2">Role: {request.role}</p>
    )}
    {request.createdAt && (
      <p className="text-gray-500 text-sm mb-4">
        Requested: {new Date(request.createdAt).toLocaleString()}
      </p>
    )}
    <button 
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full"
      onClick={() => handleApprove(request.username)}
    >
      Approve Reset
    </button>
  </div>
))}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-gray-600">No reset requests pending.</p>
        </div>
      )}
    </div>
  );
};

export default ResetRequests;