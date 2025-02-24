import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';

// Function to strip HTML tags
const stripHtmlTags = (html) => html.replace(/<[^>]*>/g, '');

const AnswerKeyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const finalPaper = location.state?.finalPaper || [];
  const correctAnswers = location.state?.correctAnswers || [];

  // Download Answer Key
  const handleDownload = () => {
    if (correctAnswers.length === 0) {
      alert('No answer key available for download.');
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: correctAnswers.map((answer, index) => 
            new Paragraph({
              children: [
                new TextRun({ text: `${index + 1}. `, bold: true }),
                new TextRun({ text: stripHtmlTags(answer.question), bold: true }),
                new TextRun({ text: `\nCorrect Answer: ${stripHtmlTags(answer.correctOption)}`, italics: true }),
              ],
            })
          ),
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, 'AnswerKey.docx');
    });
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Answer Key</h1>

      <div className="w-full max-w-3xl">
        {correctAnswers.length > 0 ? (
          correctAnswers.map((answer, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <p className="font-medium">{index + 1}. {stripHtmlTags(answer.question)}</p>
              <p className="text-green-600 font-semibold">Correct Answer: {stripHtmlTags(answer.correctOption)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No answers available.</p>
        )}
      </div>

      <div className="flex space-x-4 mt-6">
        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Download Answer Key
        </button>
        <button
          onClick={() => navigate('/final-paper', { state: { finalPaper, correctAnswers } })}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          Go Back to Final Paper
        </button>
      </div>
    </div>
  );
};

export default AnswerKeyPage;
