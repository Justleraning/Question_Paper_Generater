import React, { useState } from 'react';
import LogoImage from '../assets/full_logo.webp';
import GamesPanel from './GamesPanel.js';

const Navbar = ({ 
  isSidebarOpen, 
  isHovered = false,
  userRole = "Teacher" 
}) => {
  const [isGamesPanelOpen, setIsGamesPanelOpen] = useState(false);

  // Determine navbar left position based on sidebar state
  const getNavbarLeftPosition = () => {
    if (isSidebarOpen) return 'left-64'; // 16rem
    if (isHovered) return 'left-64'; // 16rem
    return 'left-16'; // 4rem
  };

  const toggleGamesPanel = () => {
    setIsGamesPanelOpen(!isGamesPanelOpen);
  };

  return (
    <>
      <div className={`fixed top-0 ${getNavbarLeftPosition()} right-0 z-40 transition-all duration-300 ease-in-out`}>
        {/* Top address bar */}
        <div className="w-full bg-slate-800 py-1 px-6 text-white text-sm flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="hidden md:inline">St Joseph's University, 36, Lalbagh Road, Bengaluru-560027, Karnataka, India.</span>
          <span className="md:hidden">St Joseph's University, Bengaluru</span>
        </div>

        {/* Main navbar */}
        <div className="w-full bg-white shadow-md h-20 flex items-center justify-between px-6">
          {/* Logo and name */}
          <div className="flex items-center">
            <div className="mr-3">
              <img 
                src={LogoImage} 
                alt="St Joseph's University Logo" 
                className="h-16 md:h-18 object-contain max-w-none"
              />
            </div>
          </div>
          
          {/* Right side - games button and logged in status */}
          <div className="flex items-center">
            <button 
              onClick={toggleGamesPanel}
              className="mr-4 p-2 bg-white border border-green-200 hover:bg-green-50 hover:border-green-300 text-white rounded-md flex items-center justify-center shadow-sm transition-all duration-200 transform hover:scale-105"
            >
              <span className="text-3xl">🎮</span>
            </button>
            
            <div className="bg-indigo-100 px-4 py-1.5 rounded border border-indigo-200">
              <p className="text-sm text-indigo-800">
                Logged in as: <span className="font-semibold text-indigo-900">{userRole}</span>
              </p>
            </div>
            
            <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 shadow-sm ml-4 border border-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Games Panel */}
      {isGamesPanelOpen && <GamesPanel onClose={toggleGamesPanel} />}
    </>
  );
};

export default Navbar;