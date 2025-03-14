import React, { useState, useEffect } from 'react';

const MemoryGame = () => {
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'

  const cardContents = {
    easy: [
      { id: 1, content: "🐶" },
      { id: 2, content: "🐱" },
      { id: 3, content: "🐭" },
      { id: 4, content: "🐹" },
      { id: 5, content: "🐰" },
      { id: 6, content: "🦊" },
    ],
    medium: [
      { id: 1, content: "🐶" },
      { id: 2, content: "🐱" },
      { id: 3, content: "🐭" },
      { id: 4, content: "🐹" },
      { id: 5, content: "🐰" },
      { id: 6, content: "🦊" },
      { id: 7, content: "🐻" },
      { id: 8, content: "🐼" },
    ],
    hard: [
      { id: 1, content: "🐶" },
      { id: 2, content: "🐱" },
      { id: 3, content: "🐭" },
      { id: 4, content: "🐹" },
      { id: 5, content: "🐰" },
      { id: 6, content: "🦊" },
      { id: 7, content: "🐻" },
      { id: 8, content: "🐼" },
      { id: 9, content: "🐨" },
      { id: 10, content: "🐯" },
    ]
  };

  // Timer
  useEffect(() => {
    let interval;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  // Initialize game
  const initializeGame = () => {
    const selectedCards = cardContents[difficulty];
    // Create pairs and shuffle
    const cardPairs = [...selectedCards, ...selectedCards].map((card, index) => ({
      ...card,
      uniqueId: `${card.id}-${index}`,
      isFlipped: false,
      isMatched: false
    }));
    
    // Shuffle the cards
    const shuffledCards = shuffleArray(cardPairs);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs([]);
    setMoves(0);
    setTimeElapsed(0);
    setGameStarted(true);
    setGameCompleted(false);
  };

  // Shuffle array (Fisher-Yates algorithm)
  const shuffleArray = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle card flip
  const handleCardClick = (clickedCardId) => {
    // Prevent clicking if two cards are already flipped or this card is already flipped/matched
    const clickedCard = cards.find(card => card.uniqueId === clickedCardId);
    if (
      flippedCards.length === 2 || 
      flippedCards.includes(clickedCardId) || 
      clickedCard.isMatched
    ) {
      return;
    }

    // Update flipped cards state
    const newFlippedCards = [...flippedCards, clickedCardId];
    setFlippedCards(newFlippedCards);

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      
      const firstCard = cards.find(card => card.uniqueId === newFlippedCards[0]);
      const secondCard = cards.find(card => card.uniqueId === newFlippedCards[1]);

      if (firstCard.id === secondCard.id) {
        // Match found
        const newMatchedPairs = [...matchedPairs, firstCard.id];
        setMatchedPairs(newMatchedPairs);

        // Update cards state to mark these as matched
        const updatedCards = cards.map(card => {
          if (card.id === firstCard.id) {
            return { ...card, isMatched: true };
          }
          return card;
        });
        setCards(updatedCards);

        // Check if game is completed
        if (newMatchedPairs.length === cardContents[difficulty].length) {
          setGameCompleted(true);
        }

        // Reset flipped cards after a match
        setTimeout(() => {
          setFlippedCards([]);
        }, 500);
      } else {
        // No match, flip cards back after a delay
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Card layout based on difficulty
  const getGridLayout = () => {
    switch (difficulty) {
      case 'easy': return 'grid-cols-3';
      case 'medium': return 'grid-cols-4';
      case 'hard': return 'grid-cols-5';
      default: return 'grid-cols-4';
    }
  };

  // Render a card
  const renderCard = (card) => {
    const isFlipped = flippedCards.includes(card.uniqueId) || card.isMatched;
    
    return (
      <div 
        key={card.uniqueId}
        className="relative h-24 cursor-pointer transition-all duration-300"
        onClick={() => gameStarted && !gameCompleted && handleCardClick(card.uniqueId)}
      >
        <div className={`w-full h-full rounded-lg absolute ${isFlipped ? 'opacity-0' : 'opacity-100'} bg-indigo-600 shadow-md flex items-center justify-center transition-opacity duration-300`}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div className={`w-full h-full rounded-lg absolute ${isFlipped ? 'opacity-100' : 'opacity-0'} bg-white border-2 ${card.isMatched ? 'border-green-500' : 'border-indigo-300'} flex items-center justify-center transition-opacity duration-300`}>
          <span className="text-4xl">{card.content}</span>
        </div>
      </div>
    );
  };

  if (!gameStarted || gameCompleted) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        {gameCompleted && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Game Completed!</h2>
            <p className="text-lg mb-4">
              You completed the game in <span className="font-semibold">{moves} moves</span> and{' '}
              <span className="font-semibold">{formatTime(timeElapsed)}</span>
            </p>
            <div className="text-indigo-600 text-3xl font-bold mb-6">
              {moves <= cardContents[difficulty].length + 2
                ? "🏆 Perfect Memory! 🏆"
                : moves <= cardContents[difficulty].length * 1.5
                ? "🥇 Great Job! 🥇"
                : "👍 Well Done! 👍"}
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
          onClick={initializeGame}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {gameCompleted ? 'Play Again' : 'Start Game'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="text-lg font-semibold">
          Moves: <span className="text-indigo-600">{moves}</span>
        </div>
        <div className="text-lg font-semibold">
          Time: <span className="text-indigo-600">{formatTime(timeElapsed)}</span>
        </div>
        <div className="text-lg font-semibold">
          Pairs: <span className="text-indigo-600">{matchedPairs.length}/{cardContents[difficulty].length}</span>
        </div>
      </div>

      <div className={`grid ${getGridLayout()} gap-4 mx-auto w-full max-w-3xl flex-grow`}>
        {cards.map(card => renderCard(card))}
      </div>
    </div>
  );
};

export default MemoryGame;