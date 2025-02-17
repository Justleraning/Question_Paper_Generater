import { useState } from "react";
import { requestPasswordReset } from "../services/authService";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [resetForm, setResetForm] = useState({ username: "", fullName: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false); // State for dialog visibility

  // Handle Input Changes
  const handleResetChange = (e) => {
    setResetForm({ ...resetForm, [e.target.name]: e.target.value });
  };

  // Handle Reset Request Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const response = await requestPasswordReset(resetForm);

      if (response.message.includes("SuperAdmin must contact support")) {
        setShowSuperAdminDialog(true); // Show dialog for SuperAdmin
      } else {
        setSuccessMessage("Reset request submitted! Wait for admin approval.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset request failed.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Reset Password</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

        <form onSubmit={handleResetPassword} className="flex flex-col">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="border p-2 mb-3 rounded"
            onChange={handleResetChange}
            required
          />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            className="border p-2 mb-3 rounded"
            onChange={handleResetChange}
            required
          />
          <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition">
            Submit Reset Request
          </button>
        </form>

        <p
          className="text-gray-600 text-sm mt-3 text-center cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>

      {/* 🔹 SuperAdmin Dialog Box */}
      {showSuperAdminDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-lg font-semibold mb-3">SuperAdmin Reset Request</h3>
            <p className="text-gray-700">SuperAdmin must contact:</p>
            <p className="font-bold text-blue-600">manavnair917@gmail.com</p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setShowSuperAdminDialog(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
