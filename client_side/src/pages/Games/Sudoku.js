import React, { useState, useEffect } from 'react';

const Sudoku = ({ onClose }) => {
  // Game states
  const [board, setBoard] = useState(null);
  const [originalBoard, setOriginalBoard] = useState(null);
  const [selectedCell, setSelectedCell] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [hints, setHints] = useState(3);
  const [pencilMarks, setPencilMarks] = useState({});
  const [isPencilMode, setIsPencilMode] = useState(false);

  // Generate a new sudoku board
  const generateBoard = () => {
    // Start with an empty board
    const emptyBoard = Array(9).fill().map(() => Array(9).fill(0));
    
    // Solve the empty board (generate a complete solution)
    const solvedBoard = solveSudoku([...emptyBoard.map(row => [...row])]);
    
    if (!solvedBoard) {
      console.error("Failed to generate a valid Sudoku board");
      return null;
    }
    
    // Create a puzzle by removing numbers from the solved board
    const puzzle = createPuzzle(solvedBoard, difficulty);
    
    return { puzzle, solution: solvedBoard };
  };

  // Create a puzzle by removing numbers from a solved board
  const createPuzzle = (solution, difficulty) => {
    // Create a copy of the solution
    const puzzle = solution.map(row => [...row]);
    
    // Determine how many cells to remove based on difficulty
    let cellsToRemove;
    switch (difficulty) {
      case 'easy':
        cellsToRemove = 40; // Leave ~41 clues
        break;
      case 'medium':
        cellsToRemove = 50; // Leave ~31 clues
        break;
      case 'hard':
        cellsToRemove = 60; // Leave ~21 clues
        break;
      default:
        cellsToRemove = 50;
    }
    
    // Randomly remove cells
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      
      // Only remove if the cell hasn't already been removed
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    
    return puzzle;
  };

  // Solve a sudoku board using backtracking
  const solveSudoku = (board) => {
    // Find an empty cell
    const emptyCell = findEmptyCell(board);
    
    // If no empty cell is found, the board is solved
    if (!emptyCell) {
      return board;
    }
    
    const [row, col] = emptyCell;
    
    // Try digits 1-9 for the empty cell
    for (let num = 1; num <= 9; num++) {
      // Check if the number is valid in this position
      if (isValidPlacement(board, row, col, num)) {
        // Place the number
        board[row][col] = num;
        
        // Recursively try to solve the rest of the board
        const result = solveSudoku(board);
        if (result) {
          return result;
        }
        
        // If we reach here, the current placement didn't lead to a solution
        // Backtrack by resetting the cell
        board[row][col] = 0;
      }
    }
    
    // No solution found with current configuration
    return null;
  };

  // Find an empty cell in the board
  const findEmptyCell = (board) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          return [row, col];
        }
      }
    }
    return null; // No empty cell found
  };

  // Check if a number placement is valid
  const isValidPlacement = (board, row, col, num) => {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num) {
        return false;
      }
    }
    
    // Check column
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) {
        return false;
      }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) {
          return false;
        }
      }
    }
    
    return true;
  };

  // Initialize the game
  const startGame = () => {
    const { puzzle, solution } = generateBoard();
    setBoard(puzzle.map(row => [...row]));
    setOriginalBoard({
      puzzle: puzzle.map(row => [...row]),
      solution: solution.map(row => [...row])
    });
    setSelectedCell(null);
    setGameStarted(true);
    setGameCompleted(false);
    setMistakes(0);
    setTimer(0);
    setTimerActive(true);
    setHints(3);
    setPencilMarks({});
    setIsPencilMode(false);
  };

  // Handle cell selection
  const handleCellSelect = (row, col) => {
    // Can't select original cells (prefilled)
    if (originalBoard && originalBoard.puzzle[row][col] !== 0) {
      return;
    }
    
    setSelectedCell([row, col]);
  };

  // Handle number input
  const handleNumberInput = (num) => {
    if (!selectedCell || !gameStarted || gameCompleted) return;
    
    const [row, col] = selectedCell;
    
    // Check if the cell is part of the original puzzle
    if (originalBoard.puzzle[row][col] !== 0) {
      return;
    }
    
    // In pencil mode, update pencil marks
    if (isPencilMode) {
      const cellKey = `${row}-${col}`;
      const currentMarks = pencilMarks[cellKey] || [];
      
      // Toggle the number in pencil marks
      const newMarks = currentMarks.includes(num)
        ? currentMarks.filter(mark => mark !== num)
        : [...currentMarks, num].sort();
      
      setPencilMarks({
        ...pencilMarks,
        [cellKey]: newMarks
      });
      return;
    }
    
    // In normal mode, update the cell value
    const newBoard = board.map(row => [...row]);
    
    // If user enters the same number again, clear the cell
    if (newBoard[row][col] === num) {
      newBoard[row][col] = 0;
      setBoard(newBoard);
      return;
    }
    
    // Check if the number is correct
    if (num !== originalBoard.solution[row][col]) {
      setMistakes(mistakes + 1);
    }
    
    newBoard[row][col] = num;
    setBoard(newBoard);
    
    // Clear pencil marks for this cell
    const cellKey = `${row}-${col}`;
    if (pencilMarks[cellKey]) {
      const newPencilMarks = { ...pencilMarks };
      delete newPencilMarks[cellKey];
      setPencilMarks(newPencilMarks);
    }
    
    // Check if the game is completed
    checkGameCompletion(newBoard);
  };

  // Handle clear cell button
  const handleClearCell = () => {
    if (!selectedCell || !gameStarted || gameCompleted) return;
    
    const [row, col] = selectedCell;
    
    // Check if the cell is part of the original puzzle
    if (originalBoard.puzzle[row][col] !== 0) {
      return;
    }
    
    // Clear the cell
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = 0;
    setBoard(newBoard);
    
    // Clear pencil marks for this cell
    const cellKey = `${row}-${col}`;
    if (pencilMarks[cellKey]) {
      const newPencilMarks = { ...pencilMarks };
      delete newPencilMarks[cellKey];
      setPencilMarks(newPencilMarks);
    }
  };

  // Handle hint button
  const handleHint = () => {
    if (!selectedCell || !gameStarted || gameCompleted || hints <= 0) return;
    
    const [row, col] = selectedCell;
    
    // Check if the cell is part of the original puzzle or already correct
    if (originalBoard.puzzle[row][col] !== 0 || board[row][col] === originalBoard.solution[row][col]) {
      return;
    }
    
    // Reveal the correct number
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = originalBoard.solution[row][col];
    setBoard(newBoard);
    setHints(hints - 1);
    
    // Clear pencil marks for this cell
    const cellKey = `${row}-${col}`;
    if (pencilMarks[cellKey]) {
      const newPencilMarks = { ...pencilMarks };
      delete newPencilMarks[cellKey];
      setPencilMarks(newPencilMarks);
    }
    
    // Check if the game is completed
    checkGameCompletion(newBoard);
  };

  // Toggle pencil mode
  const togglePencilMode = () => {
    setIsPencilMode(!isPencilMode);
  };

  // Check if the game is completed
  const checkGameCompletion = (currentBoard) => {
    // Game is completed if all cells match the solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col] !== originalBoard.solution[row][col]) {
          return;
        }
      }
    }
    
    // If we reach here, all cells match the solution
    setGameCompleted(true);
    setTimerActive(false);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Update timer
  useEffect(() => {
    let interval;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive]);

  // Render the sudoku board
  const renderBoard = () => {
    if (!board) return null;
    
    return (
      <div className="grid grid-cols-9 gap-0 border-2 border-gray-800">
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => {
            const isOriginal = originalBoard.puzzle[rowIndex][colIndex] !== 0;
            const isSelected = selectedCell && selectedCell[0] === rowIndex && selectedCell[1] === colIndex;
            const isHighlightedRow = selectedCell && selectedCell[0] === rowIndex;
            const isHighlightedCol = selectedCell && selectedCell[1] === colIndex;
            const isHighlightedBox = selectedCell && 
              Math.floor(selectedCell[0] / 3) === Math.floor(rowIndex / 3) && 
              Math.floor(selectedCell[1] / 3) === Math.floor(colIndex / 3);
            const isIncorrect = !isOriginal && cell !== 0 && cell !== originalBoard.solution[rowIndex][colIndex];
            
            // Determine border styles
            let borderClass = "";
            if (colIndex % 3 === 0) borderClass += " border-l-2 border-gray-800";
            if (colIndex === 8) borderClass += " border-r-2 border-gray-800";
            if (rowIndex % 3 === 0) borderClass += " border-t-2 border-gray-800";
            if (rowIndex === 8) borderClass += " border-b-2 border-gray-800";
            
            // Cell style classes
            let cellClass = `flex items-center justify-center h-10 w-10 border border-gray-300${borderClass}`;
            
            if (isSelected) {
              cellClass += " bg-indigo-200";
            } else if (isHighlightedRow || isHighlightedCol || isHighlightedBox) {
              cellClass += " bg-indigo-50";
            }
            
            if (isOriginal) {
              cellClass += " font-bold";
            }
            
            if (isIncorrect) {
              cellClass += " text-red-600";
            }
            
            // Get pencil marks for this cell
            const cellKey = `${rowIndex}-${colIndex}`;
            const cellPencilMarks = pencilMarks[cellKey] || [];
            
            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={cellClass}
                onClick={() => handleCellSelect(rowIndex, colIndex)}
              >
                {cell !== 0 ? (
                  <span className="text-lg">{cell}</span>
                ) : cellPencilMarks.length > 0 ? (
                  <div className="grid grid-cols-3 gap-0 w-full h-full p-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <div key={`pencil-${rowIndex}-${colIndex}-${num}`} className="flex items-center justify-center">
                        {cellPencilMarks.includes(num) && (
                          <span className="text-xs text-gray-500">{num}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })
        ))}
      </div>
    );
  };

  // Render number input pad
  const renderNumberPad = () => {
    return (
      <div className="grid grid-cols-3 gap-2 mt-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={`num-${num}`}
            onClick={() => handleNumberInput(num)}
            className={`h-10 w-10 flex items-center justify-center rounded-md shadow ${
              isPencilMode ? 'bg-indigo-200 hover:bg-indigo-300' : 'bg-white hover:bg-gray-100'
            } border border-gray-300`}
            disabled={!gameStarted || gameCompleted}
          >
            <span className="text-lg">{num}</span>
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800 mb-4">Sudoku</h1>
      
      {!gameStarted ? (
        // Game setup screen
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-center">Select Difficulty</h2>
          
          <div className="flex justify-between mb-6">
            <button
              onClick={() => setDifficulty('easy')}
              className={`px-4 py-2 rounded-md ${
                difficulty === 'easy'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 hover:bg-green-100'
              }`}
            >
              Easy
            </button>
            <button
              onClick={() => setDifficulty('medium')}
              className={`px-4 py-2 rounded-md ${
                difficulty === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-200 hover:bg-yellow-100'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setDifficulty('hard')}
              className={`px-4 py-2 rounded-md ${
                difficulty === 'hard'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-red-100'
              }`}
            >
              Hard
            </button>
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Start Game
          </button>
        </div>
      ) : (
        // Game screen
        <div className="flex flex-col md:flex-row gap-6">
          {/* Game board */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            {renderBoard()}
          </div>
          
          {/* Game controls */}
          <div className="bg-indigo-50 p-6 rounded-lg shadow-md flex flex-col space-y-4">
            {/* Game status */}
            <div className="bg-white p-4 rounded-md shadow-sm">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Time:</span>
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Mistakes:</span>
                <span className={mistakes > 0 ? 'text-red-600 font-bold' : ''}>{mistakes}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Hints:</span>
                <span>{hints} remaining</span>
              </div>
            </div>
            
            {/* Game result */}
            {gameCompleted && (
              <div className="bg-green-100 p-4 rounded-md shadow-sm text-center">
                <p className="text-green-800 font-bold text-lg">Congratulations!</p>
                <p className="text-green-700">You solved the puzzle in {formatTime(timer)}!</p>
              </div>
            )}
            
            {/* Number input pad */}
            <div className="flex flex-col items-center">
              {renderNumberPad()}
            </div>
            
            {/* Control buttons */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                onClick={handleClearCell}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                disabled={!gameStarted || gameCompleted || !selectedCell}
              >
                Clear Cell
              </button>
              <button
                onClick={handleHint}
                className={`px-4 py-2 rounded-md ${
                  hints > 0 ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!gameStarted || gameCompleted || !selectedCell || hints <= 0}
              >
                Hint ({hints})
              </button>
              <button
                onClick={togglePencilMode}
                className={`px-4 py-2 rounded-md col-span-2 ${
                  isPencilMode ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
                disabled={!gameStarted || gameCompleted}
              >
                {isPencilMode ? 'Pencil Mode (On)' : 'Pencil Mode (Off)'}
              </button>
            </div>
            
            {/* Game actions */}
            <div className="mt-auto pt-4 border-t border-gray-300">
              <button
                onClick={startGame}
                className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                New Game
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sudoku;