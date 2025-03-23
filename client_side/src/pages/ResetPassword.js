import { useState } from "react";
import { requestPasswordReset } from "../services/authService";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [resetForm, setResetForm] = useState({ username: "", fullName: "" });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false);

  // Handle Input Changes
  const handleResetChange = (e) => {
    try {
      setResetForm({ ...resetForm, [e.target.name]: e.target.value });
      
      // Clear errors when user starts typing again
      if (error) setError("");
    } catch (err) {
      console.error("Error updating form:", err);
    }
  };

  // Handle Reset Request Submission
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); 
    setSuccessMessage(""); 
    setIsSubmitting(true);
    
    try {
      // Validate input
      if (!resetForm.username.trim() || !resetForm.fullName.trim()) {
        setError("Both username and full name are required.");
        setIsSubmitting(false);
        return;
      }
      
      console.log("Submitting reset request:", resetForm);
      const response = await requestPasswordReset(resetForm);
      console.log("Reset response:", response);

      if (response && response.message) {
        if (response.message.includes("SuperAdmin must contact support")) {
          setShowSuperAdminDialog(true);
        } else {
          setSuccessMessage("Reset request submitted! Wait for admin approval.");
          // Clear form after successful submission
          setResetForm({ username: "", fullName: "" });
        }
      } else {
        setError("No response received from server.");
      }
    } catch (err) {
      console.error("Reset request error:", err);
      setError(
        err.response?.data?.message || 
        err.message || 
        "Reset request failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigate back to login
  const handleBackToLogin = () => {
    try {
      navigate("/login");
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setShowSuperAdminDialog(false);
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-md mb-4 text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="flex flex-col">
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Enter your username"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleResetChange}
              value={resetForm.username}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="fullName" className="block text-gray-700 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleResetChange}
              value={resetForm.fullName}
              required
            />
          </div>
          
          <button 
            type="submit"
            className={`bg-green-600 text-white p-3 rounded font-medium hover:bg-green-700 transition ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Reset Request"}
          </button>
        </form>

        <p
          className="text-gray-600 text-sm mt-4 text-center cursor-pointer hover:underline"
          onClick={handleBackToLogin}
        >
          Back to Login
        </p>
      </div>

      {/* SuperAdmin Dialog Box */}
      {showSuperAdminDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-96">
            <h3 className="text-lg font-semibold mb-3">SuperAdmin Reset Request</h3>
            <p className="text-gray-700">SuperAdmin must contact:</p>
            <p className="font-bold text-blue-600">manavnair917@gmail.com</p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              onClick={handleCloseDialog}
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