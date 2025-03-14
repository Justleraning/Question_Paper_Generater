import React, { useState, useEffect, useRef } from 'react';

const TimedTyping = () => {
  const [passages, setPassages] = useState([
    {
      id: 1,
      title: "Education",
      text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today. The function of education is to teach one to think intensively and to think critically. Intelligence plus character - that is the goal of true education."
    },
    {
      id: 2,
      title: "Scientific Inquiry",
      text: "The important thing is not to stop questioning. Curiosity has its own reason for existing. One cannot help but be in awe when one contemplates the mysteries of eternity, of life, of the marvelous structure of reality."
    },
    {
      id: 3,
      title: "Literature and Learning",
      text: "Literature is the art of discovering something extraordinary about ordinary people, and saying with ordinary words something extraordinary. Books are the carriers of civilization. Without books, history is silent, literature dumb, science crippled, thought and speculation at a standstill."
    },
    {
      id: 4,
      title: "Mathematical Thinking",
      text: "Mathematics is not about numbers, equations, computations, or algorithms: it is about understanding. Pure mathematics is, in its way, the poetry of logical ideas. The essence of mathematics is not to make simple things complicated, but to make complicated things simple."
    }
  ]);

  const [selectedPassage, setSelectedPassage] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [results, setResults] = useState({
    wpm: 0,
    accuracy: 0,
    time: 0
  });
  const [characterStats, setCharacterStats] = useState({});

  const inputRef = useRef(null);

  // Start game with selected passage
  const startGame = (passage) => {
    setSelectedPassage(passage);
    setUserInput('');
    setCurrentIndex(0);
    setErrors(0);
    setStartTime(Date.now());
    setEndTime(null);
    setGameStarted(true);
    setGameCompleted(false);
    setResults({
      wpm: 0,
      accuracy: 0,
      time: 0
    });
    setCharacterStats({});
    
    // Focus the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // Handle input change
  const handleInputChange = (e) => {
    if (!gameStarted || gameCompleted) return;
    
    const inputValue = e.target.value;
    setUserInput(inputValue);
    
    const passageText = selectedPassage.text;
    
    // Calculate current character position
    let correct = true;
    let newErrors = errors;
    let charStats = { ...characterStats };
    
    for (let i = 0; i < inputValue.length; i++) {
      if (i >= passageText.length) {
        // Extra characters typed
        correct = false;
        if (!charStats[i]) {
          charStats[i] = { correct: false, errorCount: 1 };
          newErrors++;
        }
      } else if (inputValue[i] !== passageText[i]) {
        // Character mismatch
        correct = false;
        if (!charStats[i] || charStats[i].correct) {
          charStats[i] = charStats[i] 
            ? { ...charStats[i], correct: false, errorCount: (charStats[i].errorCount || 0) + 1 }
            : { correct: false, errorCount: 1 };
          newErrors++;
        }
      } else {
        // Correct character
        if (!charStats[i]) {
          charStats[i] = { correct: true, errorCount: 0 };
        }
      }
    }
    
    setCharacterStats(charStats);
    setErrors(newErrors);
    setCurrentIndex(inputValue.length);
    
    // Check if completed
    if (inputValue.length >= passageText.length && correct) {
      completeGame();
    }
  };

  // Complete the game
  const completeGame = () => {
    const endTimeMs = Date.now();
    setEndTime(endTimeMs);
    setGameCompleted(true);
    
    // Calculate results
    const timeInMinutes = (endTimeMs - startTime) / 60000; // Convert ms to minutes
    const totalWords = selectedPassage.text.split(' ').length;
    const wpm = Math.round(totalWords / timeInMinutes);
    const accuracy = Math.max(0, Math.round(100 - (errors / selectedPassage.text.length * 100)));
    
    setResults({
      wpm,
      accuracy,
      time: Math.round((endTimeMs - startTime) / 1000) // In seconds
    });
  };

  // Restart game
  const restartGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setSelectedPassage(null);
  };

  // Render individual character with appropriate styling
  const renderCharacter = (char, index) => {
    let className = '';
    
    if (index === currentIndex) {
      className = 'bg-yellow-200 border-b-2 border-yellow-600';
    } else if (index < userInput.length) {
      if (userInput[index] === char) {
        className = 'text-green-600';
      } else {
        className = 'text-red-600 bg-red-100';
      }
    }
    
    return (
      <span 
        key={index} 
        className={`${className} font-mono`}
      >
        {char}
      </span>
    );
  };

  // Display WPM rating
  const getWpmRating = (wpm) => {
    if (wpm >= 80) return { text: 'Excellent', color: 'text-green-600' };
    if (wpm >= 60) return { text: 'Very Good', color: 'text-blue-600' };
    if (wpm >= 40) return { text: 'Good', color: 'text-indigo-600' };
    if (wpm >= 20) return { text: 'Average', color: 'text-yellow-600' };
    return { text: 'Needs Practice', color: 'text-orange-600' };
  };

  // Get rating for current performance
  const getAccuracyRating = (accuracy) => {
    if (accuracy >= 98) return { text: 'Perfect', color: 'text-green-600' };
    if (accuracy >= 95) return { text: 'Excellent', color: 'text-blue-600' };
    if (accuracy >= 90) return { text: 'Good', color: 'text-indigo-600' };
    if (accuracy >= 80) return { text: 'Fair', color: 'text-yellow-600' };
    return { text: 'Needs Practice', color: 'text-orange-600' };
  };

  // Show passage selection screen
  if (!gameStarted) {
    return (
      <div className="h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Select a Passage</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {passages.map((passage) => (
            <div 
              key={passage.id}
              onClick={() => startGame(passage)}
              className="bg-white p-4 rounded-lg border-2 border-gray-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">{passage.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-3">{passage.text}</p>
              <button className="mt-4 px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700">
                Start Typing
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-auto p-4 bg-indigo-50 rounded-lg">
          <h3 className="font-semibold mb-2">How to Play</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Select a passage above to begin typing</li>
            <li>• Type the text exactly as shown, including punctuation and capitalization</li>
            <li>• Your typing speed (WPM) and accuracy will be measured</li>
            <li>• Challenge yourself to improve with each attempt</li>
          </ul>
        </div>
      </div>
    );
  }

  // Show completed screen
  if (gameCompleted) {
    const wpmRating = getWpmRating(results.wpm);
    const accuracyRating = getAccuracyRating(results.accuracy);
    
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-2">Results</h2>
        <p className="text-indigo-600 font-semibold mb-6">{selectedPassage.title}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-2xl">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-gray-600 text-sm mb-1">Typing Speed</p>
            <p className="text-3xl font-bold text-indigo-600">{results.wpm} WPM</p>
            <p className={`text-sm font-medium ${wpmRating.color}`}>{wpmRating.text}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-gray-600 text-sm mb-1">Accuracy</p>
            <p className="text-3xl font-bold text-indigo-600">{results.accuracy}%</p>
            <p className={`text-sm font-medium ${accuracyRating.color}`}>{accuracyRating.text}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-center">
            <p className="text-gray-600 text-sm mb-1">Time</p>
            <p className="text-3xl font-bold text-indigo-600">{results.time}s</p>
            <p className="text-sm font-medium text-gray-600">Total Time</p>
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={() => startGame(selectedPassage)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
          <button
            onClick={restartGame}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Choose Another
          </button>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-xl">{selectedPassage.title}</h3>
        <div className="text-gray-600">
          {Math.floor((Date.now() - startTime) / 1000)}s
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md mb-6 leading-relaxed text-lg">
        {selectedPassage.text.split('').map((char, index) => renderCharacter(char, index))}
      </div>
      
      <div className="mb-4">
        <input
          ref={inputRef}
          type="text"
          className="w-full p-4 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 font-mono text-lg"
          value={userInput}
          onChange={handleInputChange}
          placeholder="Start typing here..."
          autoFocus
        />
      </div>
      
      <div className="mt-auto flex justify-between items-center text-sm">
        <div>
          <span className="font-medium">Progress: </span>
          <span className="text-indigo-600 font-medium">
            {Math.round((currentIndex / selectedPassage.text.length) * 100)}%
          </span>
        </div>
        <div>
          <span className="font-medium">Errors: </span>
          <span className={`font-medium ${errors > 5 ? 'text-red-600' : 'text-gray-600'}`}>
            {errors}
          </span>
        </div>
        <button
          onClick={restartGame}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TimedTyping;