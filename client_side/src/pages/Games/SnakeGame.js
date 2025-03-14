import React, { useState, useEffect, useRef } from 'react';

const SnakeGame = ({ onClose }) => {
  // Game constants
  const CANVAS_SIZE = [500, 500];
  const SNAKE_START = [
    [8, 7],
    [8, 8]
  ];
  const FOOD_START = [8, 3];
  const SCALE = 20;
  const SPEED = 100;
  const DIRECTIONS = {
    38: [0, -1], // up
    40: [0, 1], // down
    37: [-1, 0], // left
    39: [1, 0] // right
  };

  const canvasRef = useRef();
  const [snake, setSnake] = useState(SNAKE_START);
  const [food, setFood] = useState(FOOD_START);
  const [direction, setDirection] = useState([0, -1]);
  const [speed, setSpeed] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState('medium');

  // Create a reference for the game loop
  const moveSnake = useRef(() => {});
  
  // Initialize game
  useEffect(() => {
    const context = canvasRef.current.getContext('2d');
    
    // Clear canvas
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, CANVAS_SIZE[0], CANVAS_SIZE[1]);
    
    // Draw snake
    context.fillStyle = '#4F46E5';
    snake.forEach(([x, y]) => {
      context.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    });
    
    // Draw snake eyes
    if (snake.length > 0) {
      const [headX, headY] = snake[0];
      context.fillStyle = 'white';
      
      // Different eye positions based on direction
      if (direction[0] === 0 && direction[1] === -1) { // up
        context.fillRect(headX * SCALE + 4, headY * SCALE + 4, 4, 4);
        context.fillRect(headX * SCALE + 12, headY * SCALE + 4, 4, 4);
      } else if (direction[0] === 0 && direction[1] === 1) { // down
        context.fillRect(headX * SCALE + 4, headY * SCALE + 12, 4, 4);
        context.fillRect(headX * SCALE + 12, headY * SCALE + 12, 4, 4);
      } else if (direction[0] === -1 && direction[1] === 0) { // left
        context.fillRect(headX * SCALE + 4, headY * SCALE + 4, 4, 4);
        context.fillRect(headX * SCALE + 4, headY * SCALE + 12, 4, 4);
      } else if (direction[0] === 1 && direction[1] === 0) { // right
        context.fillRect(headX * SCALE + 12, headY * SCALE + 4, 4, 4);
        context.fillRect(headX * SCALE + 12, headY * SCALE + 12, 4, 4);
      }
    }
    
    // Draw food
    context.fillStyle = '#EF4444';
    context.fillRect(food[0] * SCALE, food[1] * SCALE, SCALE, SCALE);
    
    // Draw grid (optional)
    context.strokeStyle = '#E5E7EB';
    for (let i = 0; i < CANVAS_SIZE[0] / SCALE; i++) {
      context.beginPath();
      context.moveTo(i * SCALE, 0);
      context.lineTo(i * SCALE, CANVAS_SIZE[1]);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, i * SCALE);
      context.lineTo(CANVAS_SIZE[0], i * SCALE);
      context.stroke();
    }
  }, [snake, food, direction, gameOver]);

  // Game loop
  useEffect(() => {
    moveSnake.current = () => {
      if (isPaused) return;
      
      const snakeCopy = JSON.parse(JSON.stringify(snake));
      const newSnakeHead = [
        snakeCopy[0][0] + direction[0],
        snakeCopy[0][1] + direction[1]
      ];
      snakeCopy.unshift(newSnakeHead);
      
      // Check if snake eats food
      if (newSnakeHead[0] === food[0] && newSnakeHead[1] === food[1]) {
        setScore(score + 1);
        createFood();
      } else {
        snakeCopy.pop();
      }
      
      // Check for collisions
      if (checkCollision(newSnakeHead)) {
        setGameOver(true);
        setSpeed(null);
        
        // Update high score
        if (score > highScore) {
          setHighScore(score);
          // Save high score to localStorage
          try {
            localStorage.setItem('snakeHighScore', score.toString());
          } catch (e) {
            console.error('Could not save high score:', e);
          }
        }
        return;
      }
      
      setSnake(snakeCopy);
    };
  }, [snake, direction, food, isPaused, score, highScore]);

  // Set game speed based on the game loop
  useEffect(() => {
    if (speed !== null && !gameOver) {
      const interval = setInterval(() => {
        moveSnake.current();
      }, speed);
      
      return () => clearInterval(interval);
    }
  }, [speed, gameOver]);

  // Create random food position
  const createFood = () => {
    const newFood = [
      Math.floor(Math.random() * (CANVAS_SIZE[0] / SCALE)),
      Math.floor(Math.random() * (CANVAS_SIZE[1] / SCALE))
    ];
    
    // Make sure food doesn't appear on the snake
    if (snake.some(segment => segment[0] === newFood[0] && segment[1] === newFood[1])) {
      return createFood();
    }
    
    setFood(newFood);
  };

  // Check if snake collides with walls or itself
  const checkCollision = (head) => {
    // Wall collisions
    if (
      head[0] < 0 || 
      head[0] >= CANVAS_SIZE[0] / SCALE || 
      head[1] < 0 || 
      head[1] >= CANVAS_SIZE[1] / SCALE
    ) {
      return true;
    }
    
    // Self collision (skip the head when checking)
    for (let i = 1; i < snake.length; i++) {
      if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
        return true;
      }
    }
    
    return false;
  };

  // Handle key presses for movement
  const handleKeyDown = (e) => {
    if (
      // Prevent the snake from going in the opposite direction
      (e.keyCode === 38 && direction[1] !== 1) || // up
      (e.keyCode === 40 && direction[1] !== -1) || // down
      (e.keyCode === 37 && direction[0] !== 1) || // left
      (e.keyCode === 39 && direction[0] !== -1) // right
    ) {
      setDirection(DIRECTIONS[e.keyCode]);
    }
    
    // Space bar to pause/resume
    if (e.keyCode === 32) {
      togglePause();
    }
  };

  // Start game
  const startGame = () => {
    // Load high score from localStorage
    try {
      const storedHighScore = localStorage.getItem('snakeHighScore');
      if (storedHighScore) {
        setHighScore(parseInt(storedHighScore, 10));
      }
    } catch (e) {
      console.error('Could not load high score:', e);
    }
    
    // Set difficulty
    let gameSpeed;
    switch (difficultyLevel) {
      case 'easy':
        gameSpeed = 120;
        break;
      case 'hard':
        gameSpeed = 80;
        break;
      default: // medium
        gameSpeed = 100;
    }
    
    setSnake(SNAKE_START);
    createFood();
    setDirection([0, -1]);
    setSpeed(gameSpeed);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    
    // Focus the canvas for keyboard controls
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Handle direction button clicks
  const handleDirectionButton = (newDirection) => {
    // Same logic as keyboard
    if (
      (JSON.stringify(newDirection) === JSON.stringify([0, -1]) && direction[1] !== 1) || // up
      (JSON.stringify(newDirection) === JSON.stringify([0, 1]) && direction[1] !== -1) || // down
      (JSON.stringify(newDirection) === JSON.stringify([-1, 0]) && direction[0] !== 1) || // left
      (JSON.stringify(newDirection) === JSON.stringify([1, 0]) && direction[0] !== -1) // right
    ) {
      setDirection(newDirection);
    }
  };

  // Set up keyboard listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [direction]);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800 mb-4">Snake Game</h1>
      
      {/* Game interface */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Game canvas */}
        <div className="flex-shrink-0">
          <div className="bg-white p-2 rounded-lg shadow-md">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE[0]}
              height={CANVAS_SIZE[1]}
              className="border border-gray-300"
              tabIndex="0"
            />
          </div>
        </div>
        
        {/* Game controls */}
        <div className="flex flex-col space-y-6 bg-indigo-50 p-6 rounded-lg shadow-md">
          {/* Score display */}
          <div className="bg-white p-4 rounded-md shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Score:</span>
              <span className="font-bold text-indigo-600">{score}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">High Score:</span>
              <span className="font-bold text-indigo-600">{highScore}</span>
            </div>
          </div>
          
          {/* Game status */}
          <div className="bg-white p-4 rounded-md shadow-sm text-center">
            {gameOver ? (
              <p className="text-red-600 font-bold">Game Over!</p>
            ) : speed === null ? (
              <p className="text-indigo-600">Press Start to play</p>
            ) : isPaused ? (
              <p className="text-yellow-600 font-bold">Game Paused</p>
            ) : (
              <p className="text-green-600">Game in progress</p>
            )}
          </div>
          
          {/* Direction controls for mobile/touch */}
          {(speed !== null && !gameOver) && (
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={() => handleDirectionButton([0, -1])}
                className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleDirectionButton([-1, 0])}
                  className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDirectionButton([1, 0])}
                  className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => handleDirectionButton([0, 1])}
                className="bg-indigo-600 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Difficulty selector - only when not playing */}
          {speed === null && (
            <div className="bg-white p-4 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Difficulty:</h3>
              <div className="flex justify-between">
                <button
                  onClick={() => setDifficultyLevel('easy')}
                  className={`px-3 py-1 rounded ${
                    difficultyLevel === 'easy'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 hover:bg-green-100'
                  }`}
                >
                  Easy
                </button>
                <button
                  onClick={() => setDifficultyLevel('medium')}
                  className={`px-3 py-1 rounded ${
                    difficultyLevel === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 hover:bg-yellow-100'
                  }`}
                >
                  Medium
                </button>
                <button
                  onClick={() => setDifficultyLevel('hard')}
                  className={`px-3 py-1 rounded ${
                    difficultyLevel === 'hard'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 hover:bg-red-100'
                  }`}
                >
                  Hard
                </button>
              </div>
            </div>
          )}
          
          {/* Game action buttons */}
          <div className="flex justify-center gap-4">
            {speed === null ? (
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Start Game
              </button>
            ) : (
              <>
                <button
                  onClick={togglePause}
                  className={`px-6 py-3 rounded-md ${
                    isPaused
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  }`}
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={() => {
                    setGameOver(true);
                    setSpeed(null);
                  }}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  End Game
                </button>
              </>
            )}
          </div>
          
          {/* Instructions */}
          <div className="bg-white p-4 rounded-md shadow-sm text-sm">
            <h3 className="font-semibold mb-2">How to Play:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Use arrow keys to move the snake</li>
              <li>Collect the red food to grow</li>
              <li>Don't hit the walls or yourself</li>
              <li>Press Space to pause/resume</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;