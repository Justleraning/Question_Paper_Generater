// ResetRequests.jsx
import { useEffect, useState } from "react";
import { getResetRequests, approveResetRequest } from "../../services/authService.js";
import Sidebar from "../../components/Sidebar.js";
import Navbar from "../../components/Navbar.js";

const ResetRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const data = await getResetRequests();
    setRequests(data);
  };

  const handleApprove = async (username) => {
    await approveResetRequest(username);
    fetchRequests();
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col bg-gray-100">
        <Navbar />
        <div className="p-6">
          <h1 className="text-3xl font-bold">Reset Password Requests</h1>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.length > 0 ? (
              requests.map((request) => (
                <div key={request._id} className="bg-white p-4 rounded-lg shadow-md">
                  <h2 className="text-xl font-semibold">{request.fullName}</h2>
                  <p className="text-gray-600">Username: {request.username}</p>
                  <button className="mt-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition" onClick={() => handleApprove(request.username)}>Approve Reset</button>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No reset requests pending.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetRequests;
