// LandingPage.jsx
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
      <h1 className="text-5xl font-bold animate-fade-in mb-4">Welcome to Question Paper Generator</h1>
      <p className="text-lg opacity-90 text-center max-w-2xl">
        A powerful tool designed for teachers, admins, and super admins to efficiently create, manage, and approve question papers.
      </p>
      <button
        onClick={() => navigate("/login")}
        className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
      >
        Go to Login
      </button>
    </div>
  );
};

export default LandingPage;