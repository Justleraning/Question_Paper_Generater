import React, { useState, useEffect } from 'react';

const QuizGame = () => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What is the capital of France?",
      options: ["Berlin", "London", "Paris", "Madrid"],
      correctAnswer: "Paris",
    },
    {
      id: 2,
      question: "Which planet is known as the Red Planet?",
      options: ["Venus", "Mars", "Jupiter", "Saturn"],
      correctAnswer: "Mars",
    },
    {
      id: 3,
      question: "What is the largest mammal on Earth?",
      options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
      correctAnswer: "Blue Whale",
    },
    {
      id: 4,
      question: "Who wrote 'Romeo and Juliet'?",
      options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Mark Twain"],
      correctAnswer: "William Shakespeare",
    },
    {
      id: 5,
      question: "What element has the chemical symbol 'O'?",
      options: ["Gold", "Oxygen", "Osmium", "Oganesson"],
      correctAnswer: "Oxygen",
    },
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (gameOver) return;
    
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleAnswer(null);
    }
  }, [timeLeft, isAnswered, gameOver]);

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = answer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    setSelectedAnswer(answer);
    setIsAnswered(true);

    // Show result feedback for 2 seconds before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setTimeLeft(15);
      } else {
        setGameOver(true);
        setShowResult(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setTimeLeft(15);
    setIsAnswered(false);
    setGameOver(false);
  };

  const getButtonClass = (option) => {
    if (!isAnswered) return "bg-white";
    
    if (option === questions[currentQuestionIndex].correctAnswer) {
      return "bg-green-100 border-green-500";
    }
    
    if (option === selectedAnswer && option !== questions[currentQuestionIndex].correctAnswer) {
      return "bg-red-100 border-red-500";
    }
    
    return "bg-white opacity-50";
  };

  if (showResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Quiz Completed!</h2>
        <div className="text-5xl font-bold text-indigo-600 mb-6">
          {score} / {questions.length}
        </div>
        <p className="text-xl mb-8">
          {score === questions.length 
            ? "Perfect! You got all questions right!" 
            : score >= questions.length / 2 
              ? "Good job! You're on the right track." 
              : "Keep practicing to improve your score!"}
        </p>
        <button 
          onClick={resetGame}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="text-xl font-semibold">
          Question {currentQuestionIndex + 1}/{questions.length}
        </div>
        <div className="flex items-center">
          <span className="mr-2">Time:</span>
          <div className={`px-3 py-1 rounded-full font-semibold ${timeLeft < 5 ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {timeLeft}s
          </div>
        </div>
        <div className="text-lg font-semibold">
          Score: <span className="text-indigo-600">{score}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md flex-grow flex flex-col">
        <h2 className="text-2xl font-bold mb-6">{currentQuestion.question}</h2>
        
        <div className="flex-grow grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => !isAnswered && handleAnswer(option)}
              disabled={isAnswered}
              className={`p-4 border-2 rounded-lg text-left font-medium hover:border-indigo-500 transition-colors ${getButtonClass(option)}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-gray-600 italic text-center">
        {isAnswered ? (
          selectedAnswer === currentQuestion.correctAnswer ? 
            "Correct answer!" : 
            `Incorrect. The correct answer is ${currentQuestion.correctAnswer}.`
        ) : "Select the correct answer."}
      </div>
    </div>
  );
};

export default QuizGame;