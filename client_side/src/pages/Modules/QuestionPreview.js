import { useLocation, useNavigate } from "react-router-dom";

const QuestionPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { course, subject, questions } = location.state || {};

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold">Preview: {subject} - {course}</h1>

      <ul className="mt-4">
        {questions.length > 0 ? (
          questions.map((q, index) => (
            <li key={index} className="border p-4 rounded-md mt-2">
              <p className="font-semibold">{q.questionText}</p>
              <ul className="mt-2">
                {q.options.map((opt, idx) => (
                  <li key={idx} className={`p-1 ${q.correctAnswer === opt ? "text-green-600 font-bold" : ""}`}>
                    {String.fromCharCode(65 + idx)}. {opt}
                  </li>
                ))}
              </ul>
            </li>
          ))
        ) : (
          <p>No questions entered yet.</p>
        )}
      </ul>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 bg-gray-500 text-white px-4 py-2 rounded"
      >
        Back to Entry
      </button>
    </div>
  );
};

export default QuestionPreview;
