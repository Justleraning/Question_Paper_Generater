import { useState, useEffect } from "react";
import { changePasswordBeforeLogin } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@headlessui/react";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [changeForm, setChangeForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Override window.alert to capture and prevent browser alerts
  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (message) => {
      if (message && typeof message === 'string' && message.includes("Password changed")) {
        // Don't show the actual alert - we'll handle this with our dialog
        console.log("Alert intercepted:", message);
        setDialogMessage(message);
        setIsDialogOpen(true);
        return;
      }
      // For other alerts, use the original behavior
      originalAlert(message);
    };
    
    // Restore the original alert function when component unmounts
    return () => {
      window.alert = originalAlert;
    };
  }, []);

  // Password validation function
  const validatePassword = (password) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  // Handle Input Changes
  const handleChangePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangeForm({ ...changeForm, [name]: value });
    
    // Validate password as user types
    if (name === "newPassword") {
      setPasswordError(validatePassword(value));
    }
  };

  // Handle Password Change Before Login
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validate password before submitting
    const validationError = validatePassword(changeForm.newPassword);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setPasswordError("");
    
    try {
      // Call the service with noAlert option to prevent default alert behavior
      const response = await changePasswordBeforeLogin(changeForm, { noAlert: true });
      
      // Show our custom dialog with the response message
      setDialogMessage(response.message || "Password changed successfully! You can now login.");
      setIsDialogOpen(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    // Navigate to login page after dialog is closed
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      {/* Dialog for displaying message instead of alert */}
      <Dialog open={isDialogOpen} onClose={handleDialogClose} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-green-50 to-green-100 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            <Dialog.Title className="text-xl font-bold text-center mb-2">
              localhost:3000 says
            </Dialog.Title>
            
            <div className="text-center mb-6">
              <p className="text-gray-700">{dialogMessage}</p>
            </div>
            
            <div className="flex justify-center">
              <button
                className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-all"
                onClick={handleDialogClose}
              >
                OK
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold mb-2 text-center">Change Password</h2>
        <p className="text-gray-500 text-sm mb-6 text-center">Update your current password</p>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="flex flex-col">
          <div className="mb-3">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Username"
                className="pl-10 w-full border border-gray-300 p-2 rounded"
                onChange={handleChangePasswordChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                placeholder="Current Password"
                className="pl-10 w-full border border-gray-300 p-2 rounded"
                onChange={handleChangePasswordChange}
                required
              />
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                placeholder="New Password"
                className={`pl-10 w-full border ${passwordError ? 'border-red-300' : 'border-gray-300'} p-2 rounded`}
                onChange={handleChangePasswordChange}
                required
              />
            </div>
            {/* Password validation message */}
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
            <div className="mt-2">
              <p className="text-xs text-gray-500">Password must contain:</p>
              <ul className="text-xs text-gray-500 list-disc pl-5 mt-1">
                <li className={`${/[A-Z]/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>At least one uppercase letter</li>
                <li className={`${/[a-z]/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>At least one lowercase letter</li>
                <li className={`${/[0-9]/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>At least one number</li>
                <li className={`${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>At least one special character</li>
              </ul>
            </div>
          </div>
          <button 
            type="submit"
            className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 transition flex items-center justify-center mt-2"
            disabled={isSubmitting || !!passwordError}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Changing Password...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Change Password
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-gray-100 text-center">
          <button
            className="text-gray-600 text-sm hover:text-gray-800 flex items-center justify-center transition-colors duration-200"
            onClick={() => navigate("/login")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;