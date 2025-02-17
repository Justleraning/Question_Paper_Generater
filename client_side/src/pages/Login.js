import { useState } from "react";
import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";
import { loginUser, requestPasswordReset, changePasswordBeforeLogin } from "../services/authService.js";
import { Dialog } from "@headlessui/react"; // ✅ For SuperAdmin Dialog Box

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [resetMode, setResetMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [resetForm, setResetForm] = useState({ username: "", fullName: "" });
  const [changeForm, setChangeForm] = useState({ username: "", currentPassword: "", newPassword: "" });
  const [showSuperAdminDialog, setShowSuperAdminDialog] = useState(false); // ✅ SuperAdmin Request Box

  // 🔹 Handle Input Changes
  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };
  const handleResetChange = (e) => {
    setResetForm({ ...resetForm, [e.target.name]: e.target.value });
  };
  const handleChangePasswordChange = (e) => {
    setChangeForm({ ...changeForm, [e.target.name]: e.target.value });
  };

  // 🔹 Handle Login
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

  // 🔹 Handle Password Reset Request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      if (resetForm.username === "SuperAdmin") {
        setShowSuperAdminDialog(true); // ✅ Show Dialog for SuperAdmin
        return;
      }

      const response = await requestPasswordReset(resetForm);
      alert("Password reset request submitted! Wait for admin approval.");
      setResetMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Reset request failed.");
    }
  };

  // 🔹 Handle Password Change Before Login
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await changePasswordBeforeLogin(changeForm);
      alert(response.message);
      setChangePasswordMode(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {resetMode ? "Reset Password" : changePasswordMode ? "Change Password" : "Login"}
        </h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {/* 🔹 Login Form */}
        {!resetMode && !changePasswordMode && (
          <form onSubmit={handleLogin} className="flex flex-col">
            <input type="text" name="username" placeholder="Username" className="border p-2 mb-3 rounded" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" className="border p-2 mb-3 rounded" onChange={handleChange} required />
            <button className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">Login</button>
          </form>
        )}

        {/* 🔹 Reset Password Form */}
        {resetMode && (
          <form onSubmit={handleResetPassword} className="flex flex-col">
            <input type="text" name="username" placeholder="Username" className="border p-2 mb-3 rounded" onChange={handleResetChange} required />
            <input type="text" name="fullName" placeholder="Full Name" className="border p-2 mb-3 rounded" onChange={handleResetChange} required />
            <button className="bg-green-600 text-white p-2 rounded hover:bg-green-700 transition">Submit Reset Request</button>
          </form>
        )}

        {/* 🔹 Change Password Before Login Form */}
        {changePasswordMode && (
          <form onSubmit={handleChangePassword} className="flex flex-col">
            <input type="text" name="username" placeholder="Username" className="border p-2 mb-3 rounded" onChange={handleChangePasswordChange} required />
            <input type="password" name="currentPassword" placeholder="Current Password" className="border p-2 mb-3 rounded" onChange={handleChangePasswordChange} required />
            <input type="password" name="newPassword" placeholder="New Password" className="border p-2 mb-3 rounded" onChange={handleChangePasswordChange} required />
            <button className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 transition">Change Password</button>
          </form>
        )}

        {/* 🔹 Options to Switch Between Forms */}
        {!resetMode && !changePasswordMode && (
          <div className="text-center mt-3">
            <p className="text-blue-600 text-sm cursor-pointer hover:underline" onClick={() => setResetMode(true)}>
              Forgot Password?
            </p>
            <p className="text-yellow-600 text-sm cursor-pointer hover:underline mt-2" onClick={() => setChangePasswordMode(true)}>
              Change Password
            </p>
          </div>
        )}

        {/* 🔹 Back to Login Option */}
        {(resetMode || changePasswordMode) && (
          <p className="text-gray-600 text-sm mt-3 text-center cursor-pointer hover:underline" onClick={() => { setResetMode(false); setChangePasswordMode(false); }}>
            Back to Login
          </p>
        )}
      </div>

      {/* 🔹 SuperAdmin Reset Request Dialog Box */}
      {showSuperAdminDialog && (
        <Dialog open={showSuperAdminDialog} onClose={() => setShowSuperAdminDialog(false)} className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h2 className="text-xl font-bold mb-4 text-center">Reset Request for SuperAdmin</h2>
            <p className="text-gray-700 text-center">Please contact support at <span className="font-bold">manavnair917@gmail.com</span></p>
            <div className="mt-4 text-center">
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition" onClick={() => setShowSuperAdminDialog(false)}>
                Close
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default Login;
