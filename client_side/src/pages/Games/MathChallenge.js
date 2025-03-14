import React, { useState, useEffect } from 'react';

const MathChallenge = () => {
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [problems, setProblems] = useState([]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [feedback, setFeedback] = useState({ message: '', isCorrect: false });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);

  // Generate problems based on difficulty
  const generateProblems = (difficulty, count = 10) => {
    const newProblems = [];
    
    for (let i = 0; i < count; i++) {
      newProblems.push(generateProblem(difficulty));
    }
    
    return newProblems;
  };

  // Generate a single problem
  const generateProblem = (difficulty) => {
    let num1, num2, operation, answer, problem, operationSymbol;
    
    const operations = {
      easy: ['+', '-'],
      medium: ['+', '-', '*'],
      hard: ['+', '-', '*', '/']
    };
    
    // Select random operation based on difficulty
    operation = operations[difficulty][Math.floor(Math.random() * operations[difficulty].length)];
    
    switch (operation) {
      case '+':
        if (difficulty === 'easy') {
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
        } else if (difficulty === 'medium') {
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
        } else {
          num1 = Math.floor(Math.random() * 100) + 1;
          num2 = Math.floor(Math.random() * 100) + 1;
        }
        operationSymbol = '+';
        answer = num1 + num2;
        break;
      
      case '-':
        if (difficulty === 'easy') {
          num2 = Math.floor(Math.random() * 9) + 1;
          num1 = num2 + Math.floor(Math.random() * 10);
        } else if (difficulty === 'medium') {
          num2 = Math.floor(Math.random() * 25) + 1;
          num1 = num2 + Math.floor(Math.random() * 50);
        } else {
          num2 = Math.floor(Math.random() * 50) + 1;
          num1 = num2 + Math.floor(Math.random() * 100);
        }
        operationSymbol = '-';
        answer = num1 - num2;
        break;
      
      case '*':
        if (difficulty === 'medium') {
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
        } else {
          num1 = Math.floor(Math.random() * 12) + 1;
          num2 = Math.floor(Math.random() * 12) + 1;
        }
        operationSymbol = '×';
        answer = num1 * num2;
        break;
      
      case '/':
        if (difficulty === 'hard') {
          num2 = Math.floor(Math.random() * 10) + 1;
          num1 = num2 * (Math.floor(Math.random() * 10) + 1);
        }
        operationSymbol = '÷';
        answer = num1 / num2;
        break;
      
      default:
        operationSymbol = '+';
        num1 = Math.floor(Math.random() * 10) + 1;
        num2 = Math.floor(Math.random() * 10) + 1;
        answer = num1 + num2;
    }
    
    problem = `${num1} ${operationSymbol} ${num2}`;
    
    return {
      problem,
      answer,
      userAnswer: null,
      isCorrect: null
    };
  };

  // Start new game
  const startGame = () => {
    const newProblems = generateProblems(difficulty);
    setProblems(newProblems);
    setCurrentProblemIndex(0);
    setCurrentProblem(newProblems[0]);
    setUserAnswer('');
    setScore(0);
    setTimeLeft(difficulty === 'easy' ? 90 : difficulty === 'medium' ? 60 : 45);
    setGameStarted(true);
    setGameOver(false);
    setFeedback({ message: '', isCorrect: false });
    setStreak(0);
    setMaxStreak(0);
  };

  // Handle timer
  useEffect(() => {
    let timer;
    if (gameStarted && !gameOver && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
    }

    return () => clearTimeout(timer);
  }, [timeLeft, gameStarted, gameOver]);

  // Check answer
  const checkAnswer = () => {
    if (userAnswer === '') return;
    
    const userNum = parseFloat(userAnswer);
    const correctAnswer = currentProblem.answer;
    const isCorrect = userNum === correctAnswer;
    
    // Update problem with user's answer
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...currentProblem,
      userAnswer: userNum,
      isCorrect
    };
    setProblems(updatedProblems);
    
    if (isCorrect) {
      // Calculate points based on difficulty
      const points = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
      setScore(score + points);
      
      // Update streak
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
      
      setFeedback({ 
        message: `Correct! +${points} points`, 
        isCorrect: true 
      });
    } else {
      setStreak(0);
      setFeedback({ 
        message: `Incorrect. The correct answer is ${correctAnswer}`, 
        isCorrect: false 
      });
    }
    
    // Move to next problem or end game
    setTimeout(() => {
      if (currentProblemIndex < problems.length - 1) {
        const nextIndex = currentProblemIndex + 1;
        setCurrentProblemIndex(nextIndex);
        setCurrentProblem(problems[nextIndex]);
        setUserAnswer('');
        setFeedback({ message: '', isCorrect: false });
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^-?\d*\.?\d*$/.test(value)) {
      setUserAnswer(value);
    }
  };

  // Handle key press (Enter)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  // Skip current problem
  const skipProblem = () => {
    // Apply penalty
    setScore(Math.max(0, score - 2));
    setStreak(0);
    
    // Mark problem as skipped
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...currentProblem,
      userAnswer: 'skipped',
      isCorrect: false
    };
    setProblems(updatedProblems);
    
    setFeedback({ 
      message: `Skipped. The answer was ${currentProblem.answer}`, 
      isCorrect: false 
    });
    
    // Move to next problem or end game
    setTimeout(() => {
      if (currentProblemIndex < problems.length - 1) {
        const nextIndex = currentProblemIndex + 1;
        setCurrentProblemIndex(nextIndex);
        setCurrentProblem(problems[nextIndex]);
        setUserAnswer('');
        setFeedback({ message: '', isCorrect: false });
      } else {
        setGameOver(true);
      }
    }, 1500);
  };

  if (!gameStarted || gameOver) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        {gameOver && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-lg mb-2">
              Your final score: <span className="font-semibold text-indigo-600">{score}</span>
            </p>
            <p className="text-lg mb-2">
              Problems solved: <span className="font-semibold text-indigo-600">
                {problems.filter(p => p.isCorrect).length}/{problems.length}
              </span>
            </p>
            <p className="text-lg mb-4">
              Longest streak: <span className="font-semibold text-indigo-600">{maxStreak}</span>
            </p>
            
            <div className="mt-4 bg-indigo-50 p-4 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Problem Summary</h3>
              <div className="grid grid-cols-3 gap-2 text-sm">
                {problems.map((problem, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded ${
                      problem.isCorrect ? 'bg-green-100' : 
                      problem.userAnswer === 'skipped' ? 'bg-yellow-100' : 
                      problem.userAnswer !== null ? 'bg-red-100' : 'bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{problem.problem} = {problem.answer}</div>
                    <div className="text-xs">
                      {problem.userAnswer === 'skipped' 
                        ? 'Skipped' 
                        : problem.userAnswer !== null 
                          ? `Your answer: ${problem.userAnswer}` 
                          : 'Not attempted'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4 text-center">Select Difficulty</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-4 py-2 rounded-lg ${difficulty === 'easy' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`px-4 py-2 rounded-lg ${difficulty === 'medium' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`px-4 py-2 rounded-lg ${difficulty === 'hard' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              Hard
            </button>
          </div>
        </div>

        <button
          onClick={startGame}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {gameOver ? 'Play Again' : 'Start Game'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold">
          Problem: <span className="text-indigo-600">{currentProblemIndex + 1}/{problems.length}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">Time:</span>
          <div className={`px-3 py-1 rounded-full font-semibold ${timeLeft < 10 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="text-lg font-semibold">
          Score: <span className="text-indigo-600">{score}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <p className="text-gray-600 font-medium mb-2">Current streak: <span className={streak > 2 ? 'text-green-600 font-bold' : ''}>{streak}</span></p>
          </div>

          <div className="mb-8 text-center">
            <p className="text-gray-600 font-medium mb-2">Solve this problem:</p>
            <div className="text-5xl font-bold p-6 bg-indigo-50 rounded-lg">
              {currentProblem?.problem}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="answer" className="block text-gray-600 font-medium mb-2">Your Answer:</label>
            <input
              type="text"
              id="answer"
              className="w-full p-3 text-xl text-center border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500"
              value={userAnswer}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          {feedback.message && (
            <div className={`mb-4 p-3 rounded-lg ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.message}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={skipProblem}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Skip (-2 pts)
            </button>
            <button
              onClick={checkAnswer}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathChallenge;