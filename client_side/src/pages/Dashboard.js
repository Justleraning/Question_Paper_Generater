import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-center">
        Welcome, {authState.user?.fullName || "User"}!
      </h1>
      <p className="text-gray-600 text-lg mt-2">
        You are logged in as <strong>{authState.user?.role || "Role"}</strong>
      </p>

      {/* ✅ Teacher Buttons */}
      {authState.user?.role === "Teacher" && (
        <div className="mt-6 flex flex-wrap justify-center gap-6">
          <button 
            className="p-4 w-52 text-lg bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={() => navigate("/module5")}>
            Entrance Exam
          </button>

          <button 
            className="p-4 w-52 text-lg bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            onClick={() => navigate("/module2")}>
            Mid-Semester
          </button>

          <button 
            className="p-4 w-52 text-lg bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
            onClick={() => navigate("/selected-marks")}>
            End-Semester
          </button>

          <button 
            className="p-4 w-52 text-lg bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            onClick={() => navigate("/index")}>
            Open Elective
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
