import { useState } from "react";
import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { loginUser, requestPasswordReset, changePasswordBeforeLogin } from "../services/authService.js";
import { Dialog } from "@headlessui/react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [resetForm, setResetForm] = useState({ username: "", fullName: "" });
  const [changeForm, setChangeForm] = useState({ username: "", currentPassword: "", newPassword: "" });
  const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false);
  
  // New state for password validation
  const [passwordError, setPasswordError] = useState("");
  
  // New state for custom notification dialog that replaces alerts
  const [notificationDialog, setNotificationDialog] = useState({
    open: false,
    message: "",
    title: "localhost:3000 says",
    onClose: () => {}
  });

  // Password validation function
  const validatePassword = (password) => {
    if (!password) return "Password is required";
    
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
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  
  const handleResetChange = (e) => {
    setResetForm({ ...resetForm, [e.target.name]: e.target.value });
  };
  
  const handleChangePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangeForm({ ...changeForm, [name]: value });
    
    // Validate password as user types
    if (name === "newPassword") {
      const error = validatePassword(value);
      setPasswordError(error);
      console.log("Password validation:", error); // Debug log
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(credentials);
      login(response, response.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid username or password");
    }
  };

  // Handle Password Reset Request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (resetForm.username === "SuperAdmin") {
        setShowSuperAdminDialog(true);
        return;
      }

      const response = await requestPasswordReset(resetForm);
      // Replace alert with custom dialog
      setNotificationDialog({
        open: true,
        message: "Password reset request submitted! Wait for admin approval.",
        onClose: () => {
          setNotificationDialog(prev => ({ ...prev, open: false }));
          setResetMode(false);
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Reset request failed.");
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
    
    setPasswordError("");
    
    try {
      // Use noAlert option to bypass the browser alert
      const response = await changePasswordBeforeLogin(changeForm, { noAlert: true });
      // Show custom dialog instead of alert
      setNotificationDialog({
        open: true,
        message: response.message || "Password changed successfully! You can now login.",
        onClose: () => {
          setNotificationDialog(prev => ({ ...prev, open: false }));
          setChangePasswordMode(false);
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-tr from-gray-100 via-white to-blue-50">
      {/* Custom Notification Dialog - Replaces browser alerts */}
      <Dialog open={notificationDialog.open} onClose={notificationDialog.onClose} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transition-all duration-300 animate-fadeIn">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <Dialog.Title className="text-xl font-bold text-center mb-2">
              {notificationDialog.title}
            </Dialog.Title>
            
            <div className="text-center mb-6">
              <p className="text-gray-700">{notificationDialog.message}</p>
            </div>
            
            <div className="flex justify-center">
              <button
                className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-all duration-200 font-medium flex items-center transform hover:scale-[1.02] active:scale-[0.98]"
                onClick={notificationDialog.onClose}
              >
                OK
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Floating shapes for dynamic background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-16 w-32 h-32 bg-blue-200 opacity-20 rounded-full transform rotate-45"></div>
        <div className="absolute bottom-1/3 right-0 w-40 h-40 bg-green-300 opacity-20 rounded-full"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-yellow-200 opacity-20 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-blue-100 opacity-20 rounded-full"></div>
        <div className="absolute top-1/3 right-1/4 w-36 h-36 bg-red-100 opacity-20 rounded-full"></div>
      </div>

      {/* Card with dynamic shadow and border effect */}
      <div className="w-full max-w-md relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl transform rotate-1 opacity-20 blur-lg"></div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 relative z-10 overflow-hidden">
          {/* Form header with dynamic icon */}
          <div className="p-8 pb-0">
            <div className="flex justify-center items-center mb-2">
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600">
                {resetMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                ) : changePasswordMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
              {resetMode ? "Reset Password" : changePasswordMode ? "Change Password" : "Sign In"}
            </h2>
            <p className="text-center text-gray-500 text-sm mb-6">
              {resetMode ? "Request a password reset from admin" : 
               changePasswordMode ? "Update your current password" : 
               "Enter your credentials to access your account"}
            </p>
          </div>

          <div className="px-8 pb-8">
            {error && (
              <div className="mb-6 p-3 rounded-lg bg-red-50 border-l-4 border-red-500 text-red-700">
                <p className="text-sm flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              </div>
            )}

            {/* Login Form */}
            {!resetMode && !changePasswordMode && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input 
                      id="username"
                      type="text" 
                      name="username" 
                      placeholder="Enter your username" 
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input 
                      id="password"
                      type="password" 
                      name="password" 
                      placeholder="Enter your password" 
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] mt-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              </form>
            )}

            {/* Reset Password Form */}
            {resetMode && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="reset-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-green-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input 
                      id="reset-username"
                      type="text" 
                      name="username" 
                      placeholder="Enter your username" 
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      onChange={handleResetChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-green-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0" />
                      </svg>
                    </div>
                    <input 
                      id="full-name"
                      type="text" 
                      name="fullName" 
                      placeholder="Enter your full name" 
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                      onChange={handleResetChange} 
                      required 
                    />
                  </div>
                </div>
                
                <button className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white p-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-medium flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] mt-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Submit Reset Request
                </button>
              </form>
            )}

            {/* Change Password Form */}
            {changePasswordMode && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="change-username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-yellow-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input 
                      id="change-username"
                      type="text" 
                      name="username" 
                      placeholder="Enter your username" 
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200" 
                      onChange={handleChangePasswordChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-yellow-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input 
                      id="current-password"
                      type="password" 
                      name="currentPassword" 
                      placeholder="Enter current password" 
                      className="pl-10 w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200" 
                      onChange={handleChangePasswordChange} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="transition-all duration-200 transform hover:translate-x-1">
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-hover:text-yellow-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                      </svg>
                    </div>
                    <input 
                      id="new-password"
                      type="password" 
                      name="newPassword" 
                      placeholder="Enter new password" 
                      className={`pl-10 w-full border ${passwordError ? 'border-red-300' : 'border-gray-300'} p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200`}
                      onChange={handleChangePasswordChange} 
                      required 
                    />
                  </div>
                  
                  {/* Password validation message */}
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                  )}
                  
                  {/* Password requirements checklist */}
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Password must contain:</p>
                    <ul className="text-xs text-gray-500 list-disc pl-5 mt-1">
                      <li className={`${/[A-Z]/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>
                        At least one uppercase letter
                      </li>
                      <li className={`${/[a-z]/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>
                        At least one lowercase letter
                      </li>
                      <li className={`${/[0-9]/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>
                        At least one number
                      </li>
                      <li className={`${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(changeForm.newPassword) ? 'text-green-500' : ''}`}>
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </div>
                
                <button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-3 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 font-medium flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] mt-6"
                  disabled={!!passwordError}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Change Password
                </button>
              </form>
            )}

            {/* Form Switchers */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              {!resetMode && !changePasswordMode && (
                <div className="flex justify-between">
                  <button 
                    onClick={() => setResetMode(true)} 
                    className="text-blue-600 text-sm hover:text-blue-800 flex items-center transition-colors duration-200 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Forgot Password?
                  </button>
                  <button 
                    onClick={() => setChangePasswordMode(true)} 
                    className="text-yellow-600 text-sm hover:text-yellow-800 flex items-center transition-colors duration-200 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Change Password
                  </button>
                </div>
              )}
              
              {(resetMode || changePasswordMode) && (
                <button 
                  onClick={() => { setResetMode(false); setChangePasswordMode(false); setPasswordError(""); }} 
                  className="w-full text-gray-600 text-sm hover:text-gray-800 flex items-center justify-center transition-colors duration-200 group"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm max-w-md">
        <p className="mb-1">&copy; {new Date().getFullYear()} St. Joseph's University. All rights reserved.</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="hover:text-gray-700 transition-colors duration-200">Privacy</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-gray-700 transition-colors duration-200">Terms</a>
          <span className="text-gray-300">|</span>
          <a href="#" className="hover:text-gray-700 transition-colors duration-200">Help</a>
        </div>
      </div>

      {/* SuperAdmin Reset Request Dialog Box */}
      {showSuperAdminDialog && (
        <Dialog open={showSuperAdminDialog} onClose={() => setShowSuperAdminDialog(false)} className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md transition-all duration-300 animate-fadeIn">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-red-50 to-red-100 text-red-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              
              <Dialog.Title className="text-xl font-bold text-center mb-2">
                SuperAdmin Reset Request
              </Dialog.Title>
              
              <div className="text-center mb-6">
                <p className="text-gray-700">
                  For security reasons, SuperAdmin password resets require direct contact with support.
                </p>
                <p className="mt-2 font-medium">
                  Please email: <a href="mailto:manavnair917@gmail.com" className="text-blue-600 hover:underline">manavnair917@gmail.com</a>
                </p>
              </div>
              
              <div className="flex justify-center">
                <button
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center transform hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setShowSuperAdminDialog(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Close
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Login;