import React, { useState, useEffect } from 'react';

const RockPaperScissors = () => {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [score, setScore] = useState({ player: 0, computer: 0 });
  const [roundCount, setRoundCount] = useState(0);
  const [countdown, setCountdown] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  const choices = ['rock', 'paper', 'scissors'];

  const choiceEmojis = {
    rock: '👊',
    paper: '✋',
    scissors: '✌️'
  };

  const resultMessages = {
    win: 'You win!',
    lose: 'Computer wins!',
    draw: "It's a draw!"
  };

  const getComputerChoice = () => {
    const randomIndex = Math.floor(Math.random() * 3);
    return choices[randomIndex];
  };

  const determineWinner = (player, computer) => {
    if (player === computer) return 'draw';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    return 'lose';
  };

  const handlePlayerChoice = (choice) => {
    if (countdown !== null) return; // Prevent selection during countdown
    
    setPlayerChoice(choice);
    setCountdown(3);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setCountdown(null);
    setShowResult(false);
  };

  const resetScore = () => {
    setScore({ player: 0, computer: 0 });
    setRoundCount(0);
    setGameHistory([]);
    resetGame();
  };

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const computer = getComputerChoice();
      setComputerChoice(computer);
      const gameResult = determineWinner(playerChoice, computer);
      setResult(gameResult);
      setShowResult(true);
      setRoundCount(prev => prev + 1);
      
      // Update score
      if (gameResult === 'win') {
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
      } else if (gameResult === 'lose') {
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      }

      // Update history
      setGameHistory(prev => [
        ...prev, 
        { round: roundCount + 1, player: playerChoice, computer, result: gameResult }
      ]);

      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [countdown, playerChoice, roundCount]);

  const renderChoice = (choice) => {
    return (
      <div className="text-6xl">
        {choiceEmojis[choice]}
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-3xl font-bold text-indigo-800 mb-8">Rock Paper Scissors</h1>
      
      {/* Game status */}
      <div className="flex justify-between w-full max-w-md mb-10">
        <div className="text-center">
          <p className="text-lg font-semibold">You</p>
          <p className="text-3xl font-bold text-indigo-600">{score.player}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Round</p>
          <p className="text-xl">{roundCount}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Computer</p>
          <p className="text-3xl font-bold text-red-600">{score.computer}</p>
        </div>
      </div>

      {/* Game area */}
      <div className="bg-gray-100 rounded-xl p-8 w-full max-w-xl shadow-md mb-6">
        {showResult ? (
          // Result display
          <div className="flex flex-col items-center space-y-8">
            <div className="flex justify-around items-center w-full">
              <div className="text-center">
                <div className="mb-2">You chose</div>
                {renderChoice(playerChoice)}
              </div>
              <div className="text-5xl font-bold">VS</div>
              <div className="text-center">
                <div className="mb-2">Computer chose</div>
                {renderChoice(computerChoice)}
              </div>
            </div>
            <div className={`text-3xl font-bold mt-6 ${
              result === 'win' ? 'text-green-600' : 
              result === 'lose' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {resultMessages[result]}
            </div>
            <button 
              onClick={resetGame}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all"
            >
              Play Again
            </button>
          </div>
        ) : countdown !== null ? (
          // Countdown display
          <div className="flex flex-col items-center justify-center h-48">
            <div className="text-6xl font-bold text-indigo-600 animate-bounce">
              {countdown}
            </div>
            <div className="mt-4 text-lg">Get ready...</div>
          </div>
        ) : (
          // Choice selection
          <div className="flex flex-col items-center space-y-8">
            <div className="text-xl mb-4">Make your choice:</div>
            <div className="flex justify-center space-x-8">
              {choices.map(choice => (
                <button
                  key={choice}
                  onClick={() => handlePlayerChoice(choice)}
                  className="p-4 bg-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
                >
                  <div className="text-5xl">{choiceEmojis[choice]}</div>
                  <div className="mt-2 capitalize">{choice}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Game history */}
      {gameHistory.length > 0 && (
        <div className="w-full max-w-xl">
          <h3 className="text-xl font-semibold mb-2">Game History</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4 text-left">Round</th>
                  <th className="py-2 px-4 text-left">You</th>
                  <th className="py-2 px-4 text-left">Computer</th>
                  <th className="py-2 px-4 text-left">Result</th>
                </tr>
              </thead>
              <tbody>
                {gameHistory.slice(-5).map((round, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-2 px-4">{round.round}</td>
                    <td className="py-2 px-4">
                      <span className="mr-2">{choiceEmojis[round.player]}</span>
                      <span className="capitalize">{round.player}</span>
                    </td>
                    <td className="py-2 px-4">
                      <span className="mr-2">{choiceEmojis[round.computer]}</span>
                      <span className="capitalize">{round.computer}</span>
                    </td>
                    <td className={`py-2 px-4 font-medium ${
                      round.result === 'win' ? 'text-green-600' : 
                      round.result === 'lose' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {resultMessages[round.result]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <button 
              onClick={resetScore}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
            >
              Reset Score
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RockPaperScissors;