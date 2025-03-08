import { useAuth } from "../Contexts/AuthContext.js";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">

      {/* Main Content Section */}
      <main className="container mx-auto px-6 py-10">
        {/* Welcome Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-10">
          <div className="flex items-center">
            <div className="bg-blue-600 rounded-full p-3 mr-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
            <div className="flex justify-between items-center w-full">
              <h2 className="text-2xl font-bold text-gray-800">
                Welcome, {authState.user?.fullName || "User"}
              </h2>
              <p className="text-2xl font-bold text-gray-800">
                You are logged in as <span className="font-semibold text-blue-600">{authState.user?.role || "Role"}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Module Section */}
        {authState.user?.role === "Teacher" && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Exam Management Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Entrance Exam Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                <div className="bg-blue-600 h-2"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-blue-100 p-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-blue-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Entrance Exam</h3>
                  <p className="text-gray-600 text-center mb-4">Manage entrance examination and evaluation</p>
                  <button 
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => navigate("/module5")}>
                    Create Paper
                  </button>
                </div>
              </div>

              {/* Mid-Semester Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                <div className="bg-green-600 h-2"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-green-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" 
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Mid-Semester</h3>
                  <p className="text-gray-600 text-center mb-4">Manage mid-semester assessments and grading</p>
                  <button 
                    className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    onClick={() => navigate("/mainp")}>
                    Create Paper
                  </button>
                </div>
              </div>

              {/* End-Semester Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                <div className="bg-yellow-600 h-2"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-yellow-100 p-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-yellow-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-2">End-Semester</h3>
                  <p className="text-gray-600 text-center mb-4">Manage final exams and semester results</p>
                  <button 
                    className="w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
                    onClick={() => navigate("/selected-marks")}>
                    Create Paper
                  </button>
                </div>
              </div>

              {/* Open Elective Card */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:transform hover:scale-105">
                <div className="bg-purple-600 h-2"></div>
                <div className="p-6">
                  <div className="flex items-center justify-center mb-4">
                    <div className="rounded-full bg-purple-100 p-3">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 text-purple-600" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" 
                        />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Open Elective</h3>
                  <p className="text-gray-600 text-center mb-4">Manage elective courses and assignments</p>
                  <button 
                    className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                    onClick={() => navigate("/index")}>
                    Create Paper
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>


    </div>
  );
};

export default Dashboard;