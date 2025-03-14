import React, { useState, useEffect } from 'react';

const WordScramble = () => {
  const [words, setWords] = useState([
    { word: 'EDUCATION', hint: 'The process of receiving or giving systematic instruction' },
    { word: 'UNIVERSITY', hint: 'An institution of higher education' },
    { word: 'KNOWLEDGE', hint: 'Facts, information, and skills acquired through experience or education' },
    { word: 'SCIENCE', hint: 'The intellectual and practical activity of studying structure and behavior' },
    { word: 'MATHEMATICS', hint: 'The abstract science of number, quantity, and space' },
    { word: 'LITERATURE', hint: 'Written works having excellence of form or expression' },
    { word: 'HISTORY', hint: 'The study of past events, particularly in human affairs' },
    { word: 'GEOGRAPHY', hint: 'The study of physical features of the earth' },
    { word: 'BIOLOGY', hint: 'The study of living organisms' },
    { word: 'CHEMISTRY', hint: 'The scientific study of substances' },
  ]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledWord, setScrambledWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState({ message: '', isCorrect: false });
  const [wordsCompleted, setWordsCompleted] = useState(0);

  // Scramble word
  const scrambleWord = (word) => {
    const shuffled = word.split('')
      .sort(() => Math.random() - 0.5)
      .join('');
    
    // Check if we accidentally kept the same word
    return shuffled === word ? scrambleWord(word) : shuffled;
  };

  // Start game
  const startGame = () => {
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    setWords(shuffledWords);
    setCurrentWordIndex(0);
    setScrambledWord(scrambleWord(shuffledWords[0].word));
    setTimeLeft(60);
    setUserInput('');
    setGameStarted(true);
    setGameOver(false);
    setUsedHint(false);
    setScore(0);
    setWordsCompleted(0);
    setFeedback({ message: '', isCorrect: false });
  };

  // Timer
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
    const currentWord = words[currentWordIndex].word;
    const isCorrect = userInput.toUpperCase() === currentWord;

    if (isCorrect) {
      // Calculate points based on word length and if hint was used
      const points = usedHint ? currentWord.length : currentWord.length * 2;
      const newScore = score + points;
      setScore(newScore);
      
      const newWordsCompleted = wordsCompleted + 1;
      setWordsCompleted(newWordsCompleted);
      
      setFeedback({ 
        message: `Correct! +${points} points`, 
        isCorrect: true 
      });

      // Move to next word or end game
      if (currentWordIndex < words.length - 1) {
        setTimeout(() => {
          const nextIndex = currentWordIndex + 1;
          setCurrentWordIndex(nextIndex);
          setScrambledWord(scrambleWord(words[nextIndex].word));
          setUserInput('');
          setUsedHint(false);
          setFeedback({ message: '', isCorrect: false });
        }, 1500);
      } else {
        // Game completed
        setTimeout(() => {
          setGameOver(true);
        }, 1500);
      }
    } else {
      setFeedback({ 
        message: 'Incorrect! Try again.', 
        isCorrect: false 
      });
    }
  };

  // Show hint (first letter)
  const showHint = () => {
    if (!usedHint) {
      setUsedHint(true);
      const currentWord = words[currentWordIndex].word;
      setFeedback({ 
        message: `Hint: The first letter is "${currentWord[0]}"`, 
        isCorrect: false 
      });
    }
  };

  // Skip word with penalty
  const skipWord = () => {
    setFeedback({ 
      message: `Skipped. The word was "${words[currentWordIndex].word}"`, 
      isCorrect: false 
    });
    
    // Apply penalty
    setScore(Math.max(0, score - 5));
    
    // Move to next word or end game
    if (currentWordIndex < words.length - 1) {
      setTimeout(() => {
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        setScrambledWord(scrambleWord(words[nextIndex].word));
        setUserInput('');
        setUsedHint(false);
        setFeedback({ message: '', isCorrect: false });
      }, 1500);
    } else {
      // Game completed
      setTimeout(() => {
        setGameOver(true);
      }, 1500);
    }
  };

  if (!gameStarted || gameOver) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        {gameOver && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
            <p className="text-lg mb-4">
              Your final score: <span className="font-semibold text-indigo-600">{score}</span>
            </p>
            <p className="text-lg mb-6">
              Words completed: <span className="font-semibold text-indigo-600">{wordsCompleted}/{words.length}</span>
            </p>
            {score > 100 
              ? <p className="text-xl text-green-600 font-semibold">Excellent vocabulary skills!</p>
              : score > 50 
              ? <p className="text-xl text-blue-600 font-semibold">Good job!</p>
              : <p className="text-xl text-indigo-600 font-semibold">Keep practicing to improve!</p>
            }
          </div>
        )}

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
          Word: <span className="text-indigo-600">{currentWordIndex + 1}/{words.length}</span>
        </div>
        <div className="text-lg font-semibold">
          Score: <span className="text-indigo-600">{score}</span>
        </div>
        <div className="flex items-center">
          <span className="mr-2">Time:</span>
          <div className={`px-3 py-1 rounded-full font-semibold ${timeLeft < 10 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {timeLeft}s
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md flex-grow flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="mb-4">
            <p className="text-gray-600 font-medium mb-2">Hint:</p>
            <p className="text-lg p-3 bg-indigo-50 rounded-lg">{words[currentWordIndex].hint}</p>
          </div>

          <div className="mb-8">
            <p className="text-gray-600 font-medium mb-2">Unscramble this word:</p>
            <div className="text-4xl font-bold tracking-wider text-center p-4 bg-indigo-100 rounded-lg">
              {scrambledWord}
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="answer" className="block text-gray-600 font-medium mb-2">Your Answer:</label>
            <input
              type="text"
              id="answer"
              className="w-full p-3 border-2 border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
            />
          </div>

          {feedback.message && (
            <div className={`mb-4 p-3 rounded-lg ${feedback.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {feedback.message}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={showHint}
              disabled={usedHint}
              className={`px-4 py-2 rounded-lg ${usedHint ? 'bg-gray-200 text-gray-500' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
            >
              Show Hint
            </button>
            <button
              onClick={checkAnswer}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Check Answer
            </button>
            <button
              onClick={skipWord}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Skip (-5 pts)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordScramble;