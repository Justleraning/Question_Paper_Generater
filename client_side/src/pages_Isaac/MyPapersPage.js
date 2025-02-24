import React from "react";

const MyPapersPage = ({ papers, onViewPaper, onEditPaper, onDeletePaper }) => {
  if (!papers || papers.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">My Papers</h1>
        <p className="text-gray-600">No saved papers available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Papers</h1>
      <div className="space-y-6">
        {papers.map((paper) => (
          <div
            key={paper._id}
            className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <h2 className="text-xl font-semibold">{paper.subjectName}</h2>
              <p className="text-gray-600">Total Marks: {paper.totalMarks}</p>
              <p className="text-gray-600">Questions: {paper.questions.length}</p>
              <p className="text-gray-600">Created At: {new Date(paper.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => onViewPaper(paper)}
                className="bg-blue-600 text-white py-1 px-4 rounded-lg hover:bg-blue-700"
              >
                View
              </button>
              <button
                onClick={() => onEditPaper(paper)}
                className="bg-yellow-500 text-white py-1 px-4 rounded-lg hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDeletePaper(paper._id)}
                className="bg-red-600 text-white py-1 px-4 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPapersPage;
