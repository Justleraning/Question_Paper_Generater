import { useState } from "react";
import { changePasswordBeforeLogin } from "../services/authService";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [changeForm, setChangeForm] = useState({
    username: "",
    currentPassword: "",
    newPassword: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Handle Input Changes
  const handleChangePasswordChange = (e) => {
    setChangeForm({ ...changeForm, [e.target.name]: e.target.value });
  };

  // Handle Password Change Before Login
  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await changePasswordBeforeLogin(changeForm);
      setSuccessMessage("Password changed successfully! You can now log in.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password.");
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}

        <form onSubmit={handleChangePassword} className="flex flex-col">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="border p-2 mb-3 rounded"
            onChange={handleChangePasswordChange}
            required
          />
          <input
            type="password"
            name="currentPassword"
            placeholder="Current Password"
            className="border p-2 mb-3 rounded"
            onChange={handleChangePasswordChange}
            required
          />
          <input
            type="password"
            name="newPassword"
            placeholder="New Password"
            className="border p-2 mb-3 rounded"
            onChange={handleChangePasswordChange}
            required
          />
          <button className="bg-yellow-600 text-white p-2 rounded hover:bg-yellow-700 transition">
            Change Password
          </button>
        </form>

        <p
          className="text-gray-600 text-sm mt-3 text-center cursor-pointer hover:underline"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
};

export default ChangePassword;
