import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuestionsBySubject, getQuestionByIndex } from "../../services/paperService.js";

const QuestionPreview = () => {
  const navigate = useNavigate();
  const { subjectKey } = useParams(); // Get the subject key from URL params
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debug, setDebug] = useState({ logs: [] });
  const [courseName, setCourseName] = useState("");
  const [subjectName, setSubjectName] = useState("");

  // Map subject keys to full names
  const subjectMap = {
    "LR": "Logical Reasoning",
    "QP": "Quantitative Problem Solving",
    "ENG": "English",
    "CUSTOM": localStorage.getItem("customSubjectName") || "Custom Subject"
  };

  // Add a debug log
  const addDebugLog = (message) => {
    setDebug(prev => ({
      ...prev,
      logs: [...prev.logs, { time: new Date().toISOString(), message }]
    }));
    console.log(message);
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        
        // Get the actual course name from localStorage
        const course = localStorage.getItem("currentCourse") || "";
        const subject = subjectMap[subjectKey] || "";
        
        addDebugLog(`🔍 Attempting to fetch questions for ${course} - ${subject}`);
        setCourseName(course);
        setSubjectName(subject);
        
        if (!course || !subject) {
          addDebugLog("⚠️ Missing course or subject information");
          setIsLoading(false);
          return;
        }

        // ALTERNATIVE APPROACH: Fetch individual questions if API endpoint is not ready
        // This will try to fetch questions one by one up to TOTAL_QUESTIONS
        const TOTAL_QUESTIONS = 20; // Adjust if your total is different
        const fetchedQuestions = [];
        
        for (let i = 1; i <= TOTAL_QUESTIONS; i++) {
          try {
            addDebugLog(`📡 Trying to fetch question #${i}`);
            const question = await getQuestionByIndex(course, subject, i);
            
            // If we get a valid question, add it to our array
            if (question && question.question && question.question.trim() !== "") {
              addDebugLog(`✅ Found question #${i}`);
              fetchedQuestions.push({
                ...question,
                index: i
              });
            }
          } catch (err) {
            addDebugLog(`❌ Error fetching question #${i}: ${err.message}`);
            // Continue to the next question even if this one fails
          }
        }
        
        addDebugLog(`📊 Total questions found: ${fetchedQuestions.length}`);
        setQuestions(fetchedQuestions);
        setIsLoading(false);
      } catch (err) {
        addDebugLog(`❌ Error in main fetch process: ${err.message}`);
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [subjectKey]);

  // Handler to go back to the question entry page
  const handleBackToEntry = () => {
    // Navigate back to the question entry page
    const course = localStorage.getItem("currentCourse") || "";
    const customSubject = localStorage.getItem("customSubjectName") || "";
    
    if (course) {
      navigate(`/enter-questions/${encodeURIComponent(course)}/${encodeURIComponent(customSubject || subjectName)}`);
    } else {
      navigate(-1); // Fallback to browser history
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        Preview: {subjectName} - {courseName}
      </h1>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-lg">Loading questions...</p>
        </div>
      ) : (
        <>
          {questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={index} className="border border-gray-300 p-5 rounded-md bg-white shadow-sm">
                  <div className="mb-3">
                    <span className="font-bold mr-2">Question {q.index || (index + 1)}:</span>
                    <div dangerouslySetInnerHTML={{ __html: q.question }} />
                  </div>
                  
                  <div className="mt-4">
                    <span className="font-semibold">Options:</span>
                    <ul className="mt-2 space-y-2">
                      {q.options && q.options.map((opt, idx) => (
                        <li key={idx} className={`p-2 ${
                          q.correctOption === String.fromCharCode(65 + idx) ? 
                          "bg-green-100 border-l-4 border-green-500 pl-3" : ""
                        }`}>
                          <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {
                            opt.type === "Text" ? opt.value : 
                            opt.type === "Image" ? `[Image: ${opt.fileName || "Uploaded Image"}]` : 
                            opt.value || opt
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    Correct Answer: {q.correctOption || "Not specified"}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-md">
              <p className="text-lg text-gray-600">No questions have been entered for this subject yet.</p>
              <p className="mt-2 text-gray-500">Go back and create some questions to see them here.</p>
            </div>
          )}
          
          <div className="mt-8">
            <button
              onClick={handleBackToEntry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition-colors"
            >
              Back to Question Entry
            </button>
          </div>
          
          {/* Debug Information (only in development) */}
          {process.env.NODE_ENV !== 'production' && (
            <div className="mt-10 p-4 border border-gray-300 rounded bg-gray-50">
              <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
              <div className="text-xs font-mono bg-gray-100 p-3 rounded h-40 overflow-auto">
                {debug.logs.map((log, idx) => (
                  <div key={idx} className="mb-1">
                    <span className="text-gray-500">{log.time}</span>: {log.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QuestionPreview;