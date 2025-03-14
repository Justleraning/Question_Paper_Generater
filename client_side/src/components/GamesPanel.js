import React, { useState } from 'react';
import QuizGame from '../pages/Games/QuizGame.js';
import MemoryGame from '../pages/Games/MemoryGame.js';
import WordScramble from '../pages/Games/WordScramble.js';
import MathChallenge from '../pages/Games/MathChallenge.js';
import TimedTyping from '../pages/Games/TimedTyping.js';

const GamesPanel = ({ onClose }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'quiz',
      name: 'Knowledge Quiz',
      description: 'Test your knowledge with multiple-choice questions on various subjects',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      component: QuizGame
    },
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Improve memory by matching pairs of cards in this classic game',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <rect x="2" y="4" width="8" height="12" rx="1"></rect>
          <rect x="14" y="4" width="8" height="12" rx="1"></rect>
          <path d="M6 12v4"></path>
          <path d="M18 12v4"></path>
        </svg>
      ),
      component: MemoryGame
    },
    {
      id: 'word',
      name: 'Word Scramble',
      description: 'Unscramble words against the clock to improve vocabulary',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <path d="M7 20l4-16m2 16l4-16"></path>
          <path d="M3 8h18"></path>
          <path d="M3 16h18"></path>
        </svg>
      ),
      component: WordScramble
    },
    {
      id: 'math',
      name: 'Math Challenge',
      description: 'Solve math problems of varying difficulty levels',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <line x1="19" y1="5" x2="5" y2="19"></line>
          <circle cx="6.5" cy="6.5" r="2.5"></circle>
          <circle cx="17.5" cy="17.5" r="2.5"></circle>
        </svg>
      ),
      component: MathChallenge
    },
    {
      id: 'typing',
      name: 'Speed Typing',
      description: 'Improve typing speed and accuracy with timed exercises',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
          <rect x="2" y="6" width="20" height="12" rx="2"></rect>
          <line x1="6" y1="10" x2="6" y2="10"></line>
          <line x1="10" y1="10" x2="10" y2="10"></line>
          <line x1="14" y1="10" x2="14" y2="10"></line>
          <line x1="18" y1="10" x2="18" y2="10"></line>
          <line x1="6" y1="14" x2="18" y2="14"></line>
        </svg>
      ),
      component: TimedTyping
    },
    
  ];

  const handleGameSelect = (game) => {
    setSelectedGame(game);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full h-full max-w-[95%] max-h-[95%] flex flex-col overflow-hidden">
        {/* Close button */}
        <div className="flex justify-end p-4 flex-shrink-0">
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {selectedGame ? (
          /* Game display area */
          <div className="flex-grow flex flex-col px-6 pb-6 overflow-hidden">
            <button 
              onClick={closeGame}
              className="mb-4 flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-1">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              Back to Games
            </button>
            <div className="flex-grow bg-gray-50 rounded-lg p-6 overflow-auto">
              {React.createElement(selectedGame.component, { onClose: closeGame })}
            </div>
          </div>
        ) : (
          /* Games selection grid */
          <div className="flex-grow p-6 overflow-auto">
            <h2 className="text-3xl font-bold text-indigo-800 mb-4 text-center">Mini-Games</h2>
            <p className="text-gray-600 text-center mb-6 text-lg">Select a game to play and enhance learning through interactive challenges</p>
            
            <div className="grid grid-cols-3 gap-8">
              {games.map((game) => (
                <div 
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="bg-white rounded-xl border border-gray-200 p-6 shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer transform hover:scale-105 hover:border-indigo-300 flex flex-col items-center justify-center"
                >
                  <div className="mb-4 text-indigo-600">
                    {game.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">{game.name}</h3>
                  <p className="text-gray-600 text-sm text-center mb-4 flex-grow">{game.description}</p>
                  <button className="mt-auto px-6 py-3 bg-indigo-600 text-white rounded-md text-base hover:bg-indigo-700 transition-colors">
                    Play Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamesPanel;