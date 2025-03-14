import React, { useState, useEffect } from 'react';

const SnakeAndLadder = ({ onClose }) => {
  // Game constants
  const HEIGHT = 10;
  const WIDTH = 10;
  
  // Game state
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerNum, setPlayerNum] = useState(2);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('Roll the dice to start');
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Initialize colors
  const cssColorsOriginal = ["lightblue", "lightgray", "pink", "red", "yellow"];
  const [cssColors, setCssColors] = useState([...cssColorsOriginal]);
  
  // Define snakes and ladders using the positions from the code
  const ladders = [
    { startPos: 1, endPos: 38 },
    { startPos: 4, endPos: 14 },
    { startPos: 9, endPos: 31 },
    { startPos: 21, endPos: 42 },
    { startPos: 28, endPos: 84 },
    { startPos: 36, endPos: 44 },
    { startPos: 51, endPos: 67 },
    { startPos: 71, endPos: 91 },
    { startPos: 80, endPos: 100 }
  ];

  const snakes = [
    { startPos: 16, endPos: 6 },
    { startPos: 47, endPos: 26 },
    { startPos: 49, endPos: 11 },
    { startPos: 56, endPos: 53 },
    { startPos: 62, endPos: 19 },
    { startPos: 64, endPos: 60 },
    { startPos: 87, endPos: 24 },
    { startPos: 93, endPos: 73 },
    { startPos: 95, endPos: 75 },
    { startPos: 98, endPos: 78 }
  ];

  // Convert position number to x,y coordinates on the board
  const positionToCoords = (position) => {
    if (position <= 0) return { x: 0, y: 0 };
    
    // The position is 1-based, so subtract 1 for 0-based array indexing
    const adjustedPosition = position - 1;
    
    // Calculate row and column
    const row = Math.floor(adjustedPosition / WIDTH);
    
    // For odd rows (0-indexed), the x-coordinate increases from left to right
    // For even rows (0-indexed), the x-coordinate decreases from right to left (snake pattern)
    const col = row % 2 === 0
      ? adjustedPosition % WIDTH
      : WIDTH - 1 - (adjustedPosition % WIDTH);
    
    // The y-coordinate is inverted because we display the board from bottom to top
    const y = HEIGHT - 1 - row;
    const x = col;
    
    return { x, y };
  };

  // Convert x,y coordinates to position number
  const coordsToPosition = (x, y) => {
    // The y-coordinate is inverted because we display the board from bottom to top
    const row = HEIGHT - 1 - y;
    
    // Calculate the position based on the row and column
    // For odd rows (0-indexed), the x-coordinate increases from left to right
    // For even rows (0-indexed), the x-coordinate decreases from right to left (snake pattern)
    const position = row % 2 === 0
      ? row * WIDTH + x + 1
      : row * WIDTH + (WIDTH - 1 - x) + 1;
    
    return position;
  };

  // Random integer generator
  const randInt = (max) => Math.floor(Math.random() * max);

  // Start game function
  const startGame = () => {
    if (playerNum < 2 || playerNum > 4) {
      setMessage('Please select a valid number from 2 to 4');
      setPlayerNum(2);
      return;
    }

    // Initialize players
    const newPlayers = [];
    const newColors = [...cssColorsOriginal];
    
    for (let i = 0; i < playerNum; i++) {
      const colorIndex = randInt(newColors.length);
      const playerColor = newColors[colorIndex];
      newColors.splice(colorIndex, 1);
      
      newPlayers.push({
        id: i + 1,
        position: 0,
        color: playerColor,
        marginLeft: `${randInt(20)}px`,
        marginTop: `${randInt(20)}px`
      });
    }
    
    setPlayers(newPlayers);
    setCssColors(newColors);
    setCurrentPlayer(0); // First player's index
    setGameStarted(true);
    setGameOver(false);
    setWinner(null);
    setMessage(`Player 1's turn`);
  };

  // Reset game
  const resetGame = () => {
    setPlayers([]);
    setCssColors([...cssColorsOriginal]);
    setCurrentPlayer(null);
    setGameStarted(false);
    setGameOver(false);
    setWinner(null);
    setDiceValue(null);
    setIsRolling(false);
    setMessage('Roll the dice to start');
  };

  // Roll dice and move player
  const rollDice = async () => {
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

  // Move player function
  const movePlayer = async (steps) => {
    if (!gameStarted || gameOver) return;
    
    const player = players[currentPlayer];
    let newPosition = player.position + steps;
    
    // Check if player exceeds 100
    if (newPosition > 100) {
      setMessage(`You need exact value to reach 100. You rolled too high!`);
      // Move to next player
      setCurrentPlayer((currentPlayer + 1) % players.length);
      setMessage(`Player ${((currentPlayer + 1) % players.length) + 1}'s turn`);
      return;
    }
    
    // Animation for movement
    for (let pos = player.position + 1; pos <= newPosition; pos++) {
      // Update player position one step at a time
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        newPlayers[currentPlayer] = { ...newPlayers[currentPlayer], position: pos };
        return newPlayers;
      });
      
      // Wait between steps for animation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Check for win after each step
      if (pos === 100) {
        setGameOver(true);
        setWinner(player.id);
        setMessage(`Player ${player.id} wins!`);
        return;
      }
    }
    
    // Check for snake or ladder
    const finalPos = checkSnakesAndLadders(newPosition);
    
    // If position changed due to snake or ladder, update player position
    if (finalPos !== newPosition) {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        newPlayers[currentPlayer] = { ...newPlayers[currentPlayer], position: finalPos };
        return newPlayers;
      });
      
      // Check for win after snake or ladder
      if (finalPos === 100) {
        setGameOver(true);
        setWinner(player.id);
        setMessage(`Player ${player.id} wins!`);
        return;
      }
    }
    
    // Move to next player
    await new Promise(resolve => setTimeout(resolve, 500));
    const nextPlayerIndex = (currentPlayer + 1) % players.length;
    setCurrentPlayer(nextPlayerIndex);
    setMessage(`Player ${players[nextPlayerIndex].id}'s turn`);
  };

  // Check for snakes and ladders
  const checkSnakesAndLadders = (position) => {
    // Check ladders
    for (const ladder of ladders) {
      if (ladder.startPos === position) {
        setMessage(`Yay! You found a ladder at ${position} and climb up to ${ladder.endPos}`);
        return ladder.endPos;
      }
    }
    
    // Check snakes
    for (const snake of snakes) {
      if (snake.startPos === position) {
        setMessage(`Oops! You hit a snake at ${position} and slide down to ${snake.endPos}`);
        return snake.endPos;
      }
    }
    
    return position;
  };

  // Calculate the position of a cell in pixels for SVG drawing
  const getCellPosition = (cellNumber) => {
    const { x, y } = positionToCoords(cellNumber);
    
    // SVG coordinates are calculated based on cell dimensions
    // Assuming each cell is 50px in the SVG
    const cellSize = 50;
    const posX = (x + 0.5) * cellSize;
    const posY = (y + 0.5) * cellSize;
    
    return { x: posX, y: posY };
  };

  // Render the grid
  const renderBoard = () => {
    const board = [];
    
    // Generate the cells
    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        // Calculate position number from coordinates
        const position = coordsToPosition(x, y);
        
        // Determine cell background color (alternating pattern)
        const isEvenRow = y % 2 === 0;
        const isEvenCol = x % 2 === 0;
        const bgColorClass = isEvenRow === isEvenCol ? "bg-indigo-100" : "bg-indigo-50";
        
        // Check if any player is on this cell
        const playersOnCell = players.filter(player => {
          const playerPos = positionToCoords(player.position);
          return playerPos.x === x && playerPos.y === y;
        });
        
        board.push(
          <div 
            key={`cell-${position}`} 
            className={`flex items-center justify-center h-10 w-10 md:h-12 md:w-12 border border-gray-300 relative ${bgColorClass}`}
          >
            {/* Cell number */}
            <span className="text-xs md:text-sm font-medium">{position}</span>
            
            {/* Player tokens */}
            {playersOnCell.map(player => (
              <div 
                key={`player-${player.id}`}
                className="absolute flex items-center justify-center rounded-full shadow-md border-2 border-white animate-bounce"
                style={{
                  backgroundColor: player.color,
                  width: '24px',
                  height: '24px',
                  marginLeft: player.marginLeft,
                  marginTop: player.marginTop,
                  zIndex: 20
                }}
              >
                <span className="text-xs font-bold">{player.id}</span>
              </div>
            ))}
          </div>
        );
      }
    }
    
    return (
      <div className="relative">
        <div className="grid grid-cols-10 gap-0 border-2 border-gray-800 bg-white p-1 rounded shadow-lg">
          {board}
        </div>
        
        {/* SVG overlay for snakes and ladders */}
        <svg 
          className="absolute top-0 left-0 w-full h-full pointer-events-none" 
          viewBox={`0 0 ${WIDTH * 50} ${HEIGHT * 50}`}
          preserveAspectRatio="none"
        >
          {/* Draw ladders */}
          {ladders.map(ladder => {
            const startPos = getCellPosition(ladder.startPos);
            const endPos = getCellPosition(ladder.endPos);
            
            // Calculate points for ladder rungs
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const length = Math.sqrt(dx*dx + dy*dy);
            const numRungs = Math.floor(length / 30);
            const rungs = [];
            
            for (let i = 1; i < numRungs; i++) {
              const t = i / numRungs;
              const x1 = startPos.x + dx * t - 10;
              const y1 = startPos.y + dy * t;
              const x2 = x1 + 20;
              const y2 = y1;
              rungs.push(<line key={`rung-${ladder.startPos}-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#22c55e" strokeWidth="3" />);
            }
            
            return (
              <g key={`ladder-${ladder.startPos}-${ladder.endPos}`}>
                {/* Ladder rails */}
                <line x1={startPos.x - 5} y1={startPos.y} x2={endPos.x - 5} y2={endPos.y} stroke="#15803d" strokeWidth="4" />
                <line x1={startPos.x + 5} y1={startPos.y} x2={endPos.x + 5} y2={endPos.y} stroke="#15803d" strokeWidth="4" />
                {/* Ladder rungs */}
                {rungs}
              </g>
            );
          })}
          
          {/* Draw snakes */}
          {snakes.map(snake => {
            const startPos = getCellPosition(snake.startPos);
            const endPos = getCellPosition(snake.endPos);
            
            // Create a curved path for the snake
            const midX1 = startPos.x + (endPos.x - startPos.x) * 0.25;
            const midY1 = startPos.y + (endPos.y - startPos.y) * 0.3;
            const midX2 = startPos.x + (endPos.x - startPos.x) * 0.75;
            const midY2 = startPos.y + (endPos.y - startPos.y) * 0.7;
            
            // Offset for snake curves
            const dx = endPos.x - startPos.x;
            const perpX = dx === 0 ? 15 : ((dx > 0) ? 15 : -15);
            
            // Snake path with multiple curves for a more snake-like appearance
            const path = `
              M ${startPos.x} ${startPos.y}
              C ${midX1 + perpX} ${midY1}, ${midX1 - perpX} ${midY1}, ${(midX1 + midX2)/2} ${(midY1 + midY2)/2}
              S ${midX2 + perpX} ${midY2}, ${endPos.x} ${endPos.y}
            `;
            
            return (
              <g key={`snake-${snake.startPos}-${snake.endPos}`}>
                {/* Snake body */}
                <path d={path} fill="none" stroke="#dc2626" strokeWidth="8" strokeLinecap="round" />
                
                {/* Snake pattern */}
                <path d={path} fill="none" stroke="#fca5a5" strokeWidth="4" strokeLinecap="round" strokeDasharray="5,10" />
              </g>
            );
          })}
        </svg>
      </div>
    );
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

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-4xl mx-auto relative"
         style={{
           backgroundImage: "url('/src/assets/jungle-background.webp')",
           backgroundSize: "cover",
           backgroundPosition: "center",
           minHeight: "calc(100vh - 100px)"
         }}>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleDrawer}
      ></div>
      
      {/* Help drawer */}
      <div 
        className={`fixed right-0 top-0 h-full bg-white z-50 w-80 shadow-xl transform transition-transform duration-300 ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <button 
          onClick={toggleDrawer}
          className="absolute top-4 right-4 text-gray-700 hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="p-6 pt-12">
          <h2 className="text-2xl font-bold mb-4">How to Play</h2>
          <ol className="list-decimal pl-6 space-y-3">
            <li>The players will move their pieces according to the number of the dice. If a player rolls a 4, then they would move their piece four places.</li>
            <li>When a player lands on a top of a snake, their playing piece will slide down to the bottom of the snake. Landing on the bottom of a snake will have no effect.</li>
            <li>When a player lands at the base of a ladder, it immediately climbs to the top of the ladder. Landing at the top of a ladder will have no effect.</li>
            <li>The first player that reaches the highest space on the board, 100, wins the game.</li>
          </ol>
        </div>
      </div>
      
      {/* Help button */}
      <button 
        onClick={toggleDrawer}
        className="fixed top-4 right-4 bg-indigo-600 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-indigo-700 z-30"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
      
      <div className="bg-white bg-opacity-80 p-4 rounded-lg mb-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-indigo-800">Snake & Ladder</h1>
      </div>
      
      {!gameStarted ? (
        // Game setup
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center">Welcome to Snake & Ladder</h2>
          <p className="text-gray-600 mb-6 text-center">Select the number of players and start the game</p>
          
          <div className="flex items-center justify-center mb-6">
            <label className="text-gray-700 mr-4">Players:</label>
            <input 
              type="number" 
              min="2" 
              max="4" 
              value={playerNum}
              onChange={(e) => setPlayerNum(Math.min(4, Math.max(2, parseInt(e.target.value) || 2)))}
              className="border border-gray-300 rounded px-3 py-2 w-16 text-center"
            />
          </div>
          
          <button
            onClick={startGame}
            className="w-full py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Start Game
          </button>
        </div>
      ) : (
        // Game board and controls
        <div className="flex flex-col md:flex-row w-full gap-6 mb-6">
          {/* Game board */}
          <div className="flex-shrink-0 bg-white p-4 rounded-lg shadow-lg">
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
                onClick={rollDice}
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
              {currentPlayer !== null && !gameOver && (
                <div className="flex items-center justify-center mt-2">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: players[currentPlayer]?.color }}
                  ></div>
                  <p>Player {players[currentPlayer]?.id}'s turn</p>
                </div>
              )}
            </div>
            
            {/* Player list */}
            <div className="bg-white p-3 rounded-md shadow-sm">
              <h3 className="font-semibold mb-2">Players:</h3>
              <div className="space-y-2">
                {players.map((player, index) => (
                  <div key={player.id} className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: player.color }}
                    ></div>
                    <span className={currentPlayer === index && !gameOver ? 'font-bold' : ''}>
                      Player {player.id}: Position {player.position}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Win message */}
            {gameOver && winner && (
              <div className="bg-green-100 p-4 rounded-md text-center">
                <h3 className="text-green-800 font-bold text-lg">
                  Player {winner} wins!
                </h3>
              </div>
            )}
            
            {/* Reset button */}
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Restart Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnakeAndLadder;