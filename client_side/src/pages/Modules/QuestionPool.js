import { useEffect, useState } from "react";
import { getQuestionPool, deleteQuestion } from "../../services/paperService.js";

const QuestionPool = () => {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const data = await getQuestionPool();
      setQuestions(data);
    } catch (error) {
      console.error("❌ Error fetching questions:", error);
    }
  };

  const handleDelete = async (questionId) => {
    try {
      await deleteQuestion(questionId);
      fetchQuestions();
    } catch (error) {
      console.error("❌ Error deleting question:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Question Pool</h1>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {questions.length > 0 ? (
          questions.map((question) => (
            <div key={question._id} className="bg-white p-4 rounded-lg shadow-md">
              <p className="text-gray-700">{question.questionText}</p>
              <button
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                onClick={() => handleDelete(question._id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No questions found.</p>
        )}
      </div>
    </div>
  );
};

export default QuestionPool;
