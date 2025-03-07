import React from 'react';
import LogoImage from '../assets/image.png';

const Navbar = ({ isSidebarOpen, userRole = "Teacher" }) => {
  return (
    <nav className={`fixed top-0 ${isSidebarOpen ? 'left-72' : 'left-20'} transition-all duration-300 ease-in-out right-0 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg flex items-center justify-between px-6 z-40`}>
      <div className="flex items-center">
        <img 
          src={LogoImage} 
          alt="St Joseph's University Logo" 
          className="h-12 w-12 mr-3 object-contain bg-white" 
        />
        <h1 className="text-xl font-bold text-white hidden md:block whitespace-nowrap">St Joseph's University</h1>
      </div>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 md:hidden">
        <h1 className="text-xl font-bold text-white whitespace-nowrap">St Joseph's University</h1>
      </div>
      
      <div className="flex items-center">
        <div className="hidden sm:block">
          <p className="text-sm text-blue-100">Logged in as: <span className="font-semibold text-white">{userRole}</span></p>
        </div>
        
        <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-md ml-4 border border-white/30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;