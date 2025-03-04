import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import universityLogo from "../assets/logo_2.png";
import backgroundImage from "../assets/university_building.jpg";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center relative p-4 py-12">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0" 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* White Overlay with reduced opacity for better text contrast */}
        <div className="absolute inset-0 bg-white bg-opacity-50"></div>
      </div>
      
      {/* Content Container - positioned above background */}
      <div className="z-10 flex flex-col items-center">
        {/* University Logo */}
        <div className="mb-8">
          <img 
            src={universityLogo} 
            alt="St. Joseph's University Logo" 
            className="h-20 md:h-32"
          />
        </div>
        
        {/* Welcome Message */}
        <div className="text-2xl font-bold text-indigo-900 mb-3 text-center drop-shadow-md">
          Welcome to
        </div>
        
        {/* University Name */}
        <h1 className="text-3xl md:text-5xl font-extrabold mb-2 text-center text-indigo-900 drop-shadow-md">
          St. Joseph's University
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-indigo-900 drop-shadow-md">
          Question Paper Generator
        </h2>
        
        {/* Description Text */}
        <p className="text-lg md:text-xl text-gray-900 text-center max-w-2xl mb-8 font-semibold drop-shadow-md">
          A comprehensive platform for faculty and administrators to efficiently create, 
          manage, and approve examination papers with academic integrity.
        </p>
        
        {/* Divider */}
        <div className="w-24 h-1.5 bg-indigo-800 mb-8 shadow-md"></div>
        
        {/* Animated Login Button */}
        <motion.button
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400 }}
          className="mt-2 bg-indigo-900 text-white px-10 py-4 rounded font-bold shadow-lg hover:bg-indigo-950 transition-all duration-300 text-lg"
        >
          GO TO LOGIN
        </motion.button>
        
        {/* Footer */}
        <div className="mt-12 text-sm text-gray-900 font-semibold">
          © {new Date().getFullYear()} St. Joseph's University. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
