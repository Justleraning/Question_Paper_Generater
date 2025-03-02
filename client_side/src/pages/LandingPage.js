import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Import Framer Motion for animations

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 py-12">
      {/* Welcome Text */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center text-white drop-shadow-lg">
        Welcome to Question Paper Generator
      </h1>

      {/* Description Text */}
      <p className="text-lg text-white opacity-100 text-center max-w-2xl drop-shadow-md">
        A powerful tool designed for teachers, admins, and super admins to efficiently create, manage, and approve question papers.
      </p>

      {/* Animated Login Button */}
      <motion.button
        onClick={() => navigate("/login")}
        whileHover={{ scale: 1.1 }} // Slight pop-out effect on hover
        whileTap={{ scale: 0.95 }} // Shrinks slightly on click
        transition={{ type: "spring", stiffness: 300 }}
        className="mt-6 bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-100 transition-all duration-300"
      >
        Go to Login
      </motion.button>
    </div>
  );
};

export default LandingPage;
