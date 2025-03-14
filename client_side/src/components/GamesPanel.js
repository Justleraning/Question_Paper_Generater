import React, { useState } from 'react';
import QuizGame from '../pages/Games/QuizGame.js';
import MemoryGame from '../pages/Games/MemoryGame.js';
import WordScramble from '../pages/Games/WordScramble.js';
import MathChallenge from '../pages/Games/MathChallenge.js';
import TimedTyping from '../pages/Games/TimedTyping.js';
import RockPaperScissors from '../pages/Games/RockPaperScissors.js';
import SnakeAndLadder from '../pages/Games/SnakeAndLadder.js';
import SnakeGame from '../pages/Games/SnakeGame.js';
import Sudoku from '../pages/Games/Sudoku.js';

const GamesPanel = ({ onClose }) => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'quiz',
      name: 'Knowledge Quiz',
      description: 'Test your knowledge with multiple-choice questions on various subjects',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-pulse">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      ),
      component: QuizGame
    },
    {
      id: 'memory',
      name: 'Memory Match',
      description: 'Improve memory by matching pairs of cards in this classic game',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-flip-y">
            <rect x="2" y="4" width="8" height="12" rx="1"></rect>
            <rect x="14" y="4" width="8" height="12" rx="1"></rect>
            <path d="M6 12v4"></path>
            <path d="M18 12v4"></path>
          </svg>
        </div>
      ),
      component: MemoryGame
    },
    {
      id: 'word',
      name: 'Word Scramble',
      description: 'Unscramble words against the clock to improve vocabulary',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-bounce">
            <path d="M7 20l4-16m2 16l4-16"></path>
            <path d="M3 8h18"></path>
            <path d="M3 16h18"></path>
          </svg>
        </div>
      ),
      component: WordScramble
    },
    {
      id: 'math',
      name: 'Math Challenge',
      description: 'Solve math problems of varying difficulty levels',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-spin-slow">
            <line x1="19" y1="5" x2="5" y2="19"></line>
            <circle cx="6.5" cy="6.5" r="2.5"></circle>
            <circle cx="17.5" cy="17.5" r="2.5"></circle>
          </svg>
        </div>
      ),
      component: MathChallenge
    },
    {
      id: 'typing',
      name: 'Speed Typing',
      description: 'Improve typing speed and accuracy with timed exercises',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-pulse">
            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
            <line x1="6" y1="10" x2="6" y2="10"></line>
            <line x1="10" y1="10" x2="10" y2="10"></line>
            <line x1="14" y1="10" x2="14" y2="10"></line>
            <line x1="18" y1="10" x2="18" y2="10"></line>
            <line x1="6" y1="14" x2="18" y2="14"></line>
          </svg>
        </div>
      ),
      component: TimedTyping
    },
    {
      id: 'rockpaperscissors',
      name: 'Rock Paper Scissors',
      description: 'Challenge the computer in this classic hand game of strategy and luck',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-bounce">
            <path d="M6.5 6.5s1.5 2 .5 4-2.5 2-4 2.5 4 2.5 6 1 6.5-6 6.5-6"></path>
            <path d="M5.5 14.5s-.5 2 1 3 5.5-2 5.5-2l5-5c2-2 0-5.5-2-5.5s-4 3-4 3"></path>
            <path d="M10.5 11.5l-1-1c-2-2-5.5 0-5.5 2s3 3.5 5 3.5 4-1 6-3 4-4 2-6-4 0-6 2l-5 5"></path>
          </svg>
        </div>
      ),
      component: RockPaperScissors
    },
    {
      id: 'snakeladder',
      name: 'Snake & Ladder',
      description: 'Roll the dice and navigate through a board of snakes and ladders',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-wiggle">
            <path d="M21 8H3"></path>
            <path d="M21 12H3"></path>
            <path d="M21 16H3"></path>
            <path d="M19 8v8"></path>
            <path d="M15 8v8"></path>
            <path d="M9 8v8"></path>
            <path d="M5 8v8"></path>
            <path className="animate-waveform" d="M3 20c2-2 4 2 6 0s4 2 6 0 4 2 6 0"></path>
          </svg>
        </div>
      ),
      component: SnakeAndLadder
    },
    {
      id: 'snakegame',
      name: 'Snake Game',
      description: 'Control a snake to collect food and grow without hitting walls or yourself',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-wiggle">
            <path d="M3 12c8 0 8 4 16 4"></path>
            <path d="M21 16c-8 0-8-4-16-4"></path>
            <path d="M3 8c8 0 8 4 16 4"></path>
            <circle cx="19" cy="4" r="2" className="fill-green-500 animate-ping"></circle>
          </svg>
        </div>
      ),
      component: SnakeGame
    },
    {
      id: 'sudoku',
      name: 'Sudoku',
      description: 'Fill the 9×9 grid with numbers according to the classic puzzle rules',
      icon: (
        <div className="w-12 h-12 relative overflow-hidden">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 animate-pulse">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="3" y1="9" x2="21" y2="9"></line>
            <line x1="3" y1="15" x2="21" y2="15"></line>
            <line x1="9" y1="3" x2="9" y2="21"></line>
            <line x1="15" y1="3" x2="15" y2="21"></line>
            <text x="5" y="7" className="text-xl font-bold fill-indigo-600 animate-bounce">5</text>
            <text x="11" y="13" className="text-xl font-bold fill-indigo-600">7</text>
            <text x="17" y="19" className="text-xl font-bold fill-indigo-600">3</text>
          </svg>
        </div>
      ),
      component: Sudoku
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