import React, { useState, useEffect } from 'react';

const SnakeAndLadder = ({ onClose }) => {
  const BOARD_SIZE = 10; // 10x10 board (1-100)
  const [playerPosition, setPlayerPosition] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('Roll the dice to start');
  const [gameOver, setGameOver] = useState(false);
  const [moveHistory, setMoveHistory] = useState([]);
  const [moveAnimation, setMoveAnimation] = useState(null);
  
  // Snakes and Ladders positions (start -> end)
  const snakes = {
    16: 6,
    47: 26,
    49: 11,
    56: 53,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    98: 78
  };
  
  const ladders = {
    1: 38,
    4: 14,
    9: 31,
    21: 42,
    28: 84,
    36: 44,
    51: 67,
    71: 91,
    80: 100
  };

  const diceRoll = () => {
    if (isRolling || gameOver) return;
    
    setIsRolling(true);
    setMessage('Rolling...');
    
    // Simulate dice roll animation
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1);
      rollCount++;
      
      if (rollCount > 10) {
        clearInterval(rollInterval);
        const finalDiceValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(finalDiceValue);
        movePlayer(finalDiceValue);
        setIsRolling(false);
      }
    }, 100);
  };

  const movePlayer = (steps) => {
    const newPosition = playerPosition + steps;
    
    if (newPosition > 100) {
      setMessage(`You need exact value to reach 100. You rolled too high!`);
      return;
    }
    
    // Animate movement
    const animateMove = async (start, end) => {
      for (let pos = start + 1; pos <= end; pos++) {
        setPlayerPosition(pos);
        setMoveAnimation(pos);
        // Wait for a bit between each step
        await new Promise(resolve => setTimeout(resolve, 150));
      }
      setMoveAnimation(null);
      
      // Check for snake or ladder
      checkSnakeOrLadder(end);
    };
    
    // Add to history
    setMoveHistory(prev => [
      ...prev, 
      { 
        move: moveHistory.length + 1, 
        roll: steps, 
        from: playerPosition, 
        to: newPosition 
      }
    ]);
    
    // Start animation
    animateMove(playerPosition, newPosition);
  };

  const checkSnakeOrLadder = (position) => {
    // Check if landed on a snake head
    if (snakes[position]) {
      setMessage(`Oops! You hit a snake at ${position} and slide down to ${snakes[position]}`);
      
      // Update history
      setMoveHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].snakeTo = snakes[position];
        return updated;
      });
      
      // Animate snake slide after a brief delay
      setTimeout(() => {
        setPlayerPosition(snakes[position]);
      }, 1000);
    } 
    // Check if landed on a ladder bottom
    else if (ladders[position]) {
      setMessage(`Yay! You found a ladder at ${position} and climb up to ${ladders[position]}`);
      
      // Update history
      setMoveHistory(prev => {
        const updated = [...prev];
        updated[updated.length - 1].ladderTo = ladders[position];
        return updated;
      });
      
      // Animate ladder climb after a brief delay
      setTimeout(() => {
        setPlayerPosition(ladders[position]);
      }, 1000);
    } 
    else {
      setMessage(`You moved to ${position}`);
    }
    
    // Check for win condition
    if (position === 100 || ladders[position] === 100) {
      setTimeout(() => {
        setMessage('Congratulations! You won!');
        setGameOver(true);
      }, 1500);
    }
  };

  const resetGame = () => {
    setPlayerPosition(0);
    setDiceValue(null);
    setIsRolling(false);
    setMessage('Roll the dice to start');
    setGameOver(false);
    setMoveHistory([]);
    setMoveAnimation(null);
  };

  // Create the board grid
  const renderBoard = () => {
    const board = [];
    let cells = [];
    
    // Create 10x10 grid with alternating row directions (snake pattern)
    for (let row = BOARD_SIZE; row >= 1; row--) {
      cells = [];
      
      // Alternate row direction (snake pattern layout)
      const isEvenRow = row % 2 === 0;
      const startCol = isEvenRow ? 1 : BOARD_SIZE;
      const endCol = isEvenRow ? BOARD_SIZE : 1;
      const increment = isEvenRow ? 1 : -1;
      
      for (let col = startCol; isEvenRow ? col <= endCol : col >= endCol; col += increment) {
        // Calculate cell number based on row and column
        const cellNumber = ((BOARD_SIZE - row) * BOARD_SIZE) + (isEvenRow ? col : (BOARD_SIZE - col + 1));
        
        // Check if player is on this cell
        const hasPlayer = playerPosition === cellNumber;
        
        // Check if this cell has a snake or ladder
        const hasSnakeStart = Object.keys(snakes).includes(cellNumber.toString());
        const hasSnakeEnd = Object.values(snakes).includes(cellNumber);
        const hasLadderStart = Object.keys(ladders).includes(cellNumber.toString());
        const hasLadderEnd = Object.values(ladders).includes(cellNumber);
        
        // Determine cell background color
        let cellClass = "flex items-center justify-center h-8 w-8 md:h-12 md:w-12 border border-gray-300 relative";
        if (isEvenRow) {
          cellClass += cellNumber % 2 === 0 ? " bg-indigo-100" : " bg-indigo-50";
        } else {
          cellClass += cellNumber % 2 === 0 ? " bg-indigo-50" : " bg-indigo-100";
        }
        
        // Add animation class if this cell is currently being moved through
        if (moveAnimation === cellNumber) {
          cellClass += " bg-yellow-200";
        }
        
        // Create the cell
        cells.push(
          <div key={`cell-${cellNumber}`} className={cellClass}>
            {/* Cell number */}
            <span className="text-xs md:text-sm font-medium">{cellNumber}</span>
            
            {/* Snake indicator */}
            {hasSnakeStart && (
              <div className="absolute top-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-red-500 rounded-full"></div>
            )}
            {hasSnakeEnd && (
              <div className="absolute bottom-0 left-0 w-2 h-2 md:w-3 md:h-3 bg-red-300 rounded-full"></div>
            )}
            
            {/* Ladder indicator */}
            {hasLadderStart && (
              <div className="absolute top-0 left-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full"></div>
            )}
            {hasLadderEnd && (
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-300 rounded-full"></div>
            )}
            
            {/* Player token */}
            {hasPlayer && (
              <div className="absolute inset-1 flex items-center justify-center bg-indigo-600 rounded-full shadow-md border-2 border-white animate-bounce">
                <span className="text-xs text-white">P</span>
              </div>
            )}
          </div>
        );
      }
      
      // Add row to the board
      board.push(
        <div key={`row-${row}`} className="flex">
          {cells}
        </div>
      );
    }
    
    return <div className="bg-white p-1 rounded shadow-lg">{board}</div>;
  };

  // Render dice
  const renderDice = () => {
    if (diceValue === null) {
      return (
        <div className="w-16 h-16 bg-white rounded-lg border-2 border-indigo-300 shadow-md flex items-center justify-center">
          <span className="text-indigo-400">Roll</span>
        </div>
      );
    }

    // Dice patterns
    const patterns = {
      1: [<div key="1" className="dot m-auto"></div>],
      2: [<div key="1" className="dot top-2 left-2"></div>, <div key="2" className="dot bottom-2 right-2"></div>],
      3: [<div key="1" className="dot top-2 left-2"></div>, <div key="2" className="dot m-auto"></div>, <div key="3" className="dot bottom-2 right-2"></div>],
      4: [<div key="1" className="dot top-2 left-2"></div>, <div key="2" className="dot top-2 right-2"></div>, <div key="3" className="dot bottom-2 left-2"></div>, <div key="4" className="dot bottom-2 right-2"></div>],
      5: [<div key="1" className="dot top-2 left-2"></div>, <div key="2" className="dot top-2 right-2"></div>, <div key="3" className="dot m-auto"></div>, <div key="4" className="dot bottom-2 left-2"></div>, <div key="5" className="dot bottom-2 right-2"></div>],
      6: [<div key="1" className="dot top-2 left-2"></div>, <div key="2" className="dot top-2 right-2"></div>, <div key="3" className="dot middle-2 left-2"></div>, <div key="4" className="dot middle-2 right-2"></div>, <div key="5" className="dot bottom-2 left-2"></div>, <div key="6" className="dot bottom-2 right-2"></div>]
    };

    return (
      <div className={`w-16 h-16 bg-white rounded-lg border-2 border-indigo-500 shadow-lg flex flex-wrap justify-around items-center p-1 relative ${isRolling ? 'animate-spin' : ''}`}>
        {patterns[diceValue].map(dot => dot)}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-800 mb-4">Snake & Ladder</h1>
      
      <div className="flex flex-col md:flex-row w-full gap-6 mb-6">
        {/* Game board */}
        <div className="flex-shrink-0">
          {renderBoard()}
        </div>
        
        {/* Game controls */}
        <div className="flex flex-col space-y-6 bg-indigo-50 p-4 rounded-lg shadow-md">
          {/* Dice and roll button */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              <style jsx>{`
                .dot {
                  position: absolute;
                  width: 6px;
                  height: 6px;
                  background-color: #4338ca;
                  border-radius: 50%;
                }
                .middle-2 {
                  top: calc(50% - 3px);
                }
                @media (min-width: 768px) {
                  .dot {
                    width: 8px;
                    height: 8px;
                  }
                  .middle-2 {
                    top: calc(50% - 4px);
                  }
                }
              `}</style>
              {renderDice()}
            </div>
            <button
              onClick={diceRoll}
              disabled={isRolling || gameOver}
              className={`px-6 py-3 rounded-md font-medium ${
                isRolling || gameOver
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {isRolling ? 'Rolling...' : 'Roll Dice'}
            </button>
          </div>
          
          {/* Game status */}
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-center font-medium text-indigo-800">{message}</p>
            <p className="text-center mt-2">
              {playerPosition > 0 
                ? `You are at position ${playerPosition}` 
                : 'Start at position 1'}
            </p>
          </div>
          
          {/* Game legend */}
          <div className="bg-white p-3 rounded-md shadow-sm text-sm">
            <h3 className="font-semibold mb-2">Legend:</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Snake Head</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-300 rounded-full mr-2"></div>
                <span>Snake Tail</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Ladder Bottom</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-300 rounded-full mr-2"></div>
                <span>Ladder Top</span>
              </div>
            </div>
          </div>
          
          {/* Reset button */}
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Restart Game
          </button>
        </div>
      </div>
      
      {/* Move history */}
      {moveHistory.length > 0 && (
        <div className="w-full bg-white rounded-lg shadow-md overflow-hidden mt-4">
          <h3 className="bg-indigo-100 p-3 font-semibold">Move History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 text-sm">
                <tr>
                  <th className="py-2 px-4 text-left">Move</th>
                  <th className="py-2 px-4 text-left">Roll</th>
                  <th className="py-2 px-4 text-left">From</th>
                  <th className="py-2 px-4 text-left">To</th>
                  <th className="py-2 px-4 text-left">Snake/Ladder</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {moveHistory.map((move, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4">{move.move}</td>
                    <td className="py-2 px-4">{move.roll}</td>
                    <td className="py-2 px-4">{move.from}</td>
                    <td className="py-2 px-4">{move.to}</td>
                    <td className="py-2 px-4">
                      {move.snakeTo && <span className="text-red-600">↓ {move.snakeTo}</span>}
                      {move.ladderTo && <span className="text-green-600">↑ {move.ladderTo}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeAndLadder;