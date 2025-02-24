import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQPContext } from '../Contexts/QPContext.js';
import randomizeQuestions from '../Utils/randomizeQuestions.js';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Pencil } from 'lucide-react';
import logo from '../assets/image.png';

const stripHtmlTags = (input) => {
  if (!input) return "__________";
  return input.replace(/<[^>]*>/g, "").trim();
};

const isImageUrl = (url) => {
  return /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg))|data:image\//i.test(url);
};

const FinalPaperPage = () => {
  const { subjectDetails, questions, marks } = useQPContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [finalPaper, setFinalPaper] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editText, setEditText] = useState('');
  const [editOption, setEditOption] = useState(null);
  const [isPreview, setIsPreview] = useState(true);
  const paperRef = useRef(null);

  // ✅ Handle randomization of questions
  const handleRandomize = useCallback(() => {
    console.log("🔄 Randomizing Questions...");
    console.log("📜 Questions Before Randomization:", questions);

    const randomizedPaper = randomizeQuestions(questions, marks === 20 ? 20 : 30);
    setFinalPaper(randomizedPaper);

    const answers = randomizedPaper.map((q) => ({
      question: stripHtmlTags(q.text),
      correctOption: stripHtmlTags(q.correctOption),
    }));

    setCorrectAnswers(answers);
    console.log("✅ Final Paper after Randomization:", randomizedPaper);
  }, [questions, marks]);

  // ✅ Load paper from state or randomize
  useEffect(() => {
    if (location.state?.finalPaper) {
      setFinalPaper(location.state.finalPaper);
      setCorrectAnswers(location.state.correctAnswers || []);
    } else {
      handleRandomize();
    }
  }, [location.state, handleRandomize]);

  // ✅ Handle editing question text
  const handleEditQuestion = (index) => {
    setEditingIndex(index);
    setEditText(finalPaper[index].text);
  };

  const handleSaveQuestion = () => {
    const updatedPaper = [...finalPaper];
    updatedPaper[editingIndex].text = editText;
    setFinalPaper(updatedPaper);
    setEditingIndex(null);
    setEditText('');
  };

  // ✅ Handle editing an option
  const handleEditOption = (qIndex, key) => {
    setEditingIndex(qIndex);
    setEditOption({ key, text: finalPaper[qIndex].options[key] });
  };

  const handleSaveOption = () => {
    const updatedPaper = [...finalPaper];
    updatedPaper[editingIndex].options[editOption.key] = editOption.text;
    setFinalPaper(updatedPaper);
    setEditingIndex(null);
    setEditOption(null);
  };

  // ✅ Download PDF
  const handleDownloadPDF = () => {
    setIsPreview(false);
    setTimeout(() => {
      if (!paperRef.current) return;
      html2canvas(paperRef.current, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('Final_Question_Paper.pdf');
        setTimeout(() => setIsPreview(true), 500);
      });
    }, 100);
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">Final Question Paper</h1>
      <button onClick={handleRandomize} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4">
        Randomize Questions
      </button>

      {finalPaper.length > 0 && (
        <div ref={paperRef} className="w-full max-w-3xl border p-6 bg-white text-center">
          <img src={logo} alt="University Logo" className="w-24 h-24 mx-auto mb-2" />
          <h2 className="text-lg font-medium">St Joseph's University, Bengaluru-27</h2>
          <h3 className="font-semibold">B.C.A Examination Paper</h3>
          <p className="text-md font-bold">Subject Name: {stripHtmlTags(subjectDetails.name)}</p>
          <p className="text-md font-bold">Subject Code: {stripHtmlTags(subjectDetails.code)}</p>
          <p className="text-md font-bold text-right">Max Marks: {marks || '__________'}</p>
          <hr className="my-4" />

          {finalPaper.map((question, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center">
                {editingIndex === index ? (
                  <input type="text" value={editText} onChange={(e) => setEditText(e.target.value)} onBlur={handleSaveQuestion} className="border p-1" />
                ) : (
                  <p className="font-medium">{index + 1}. {stripHtmlTags(question.text)}</p>
                )}
                {isPreview && <Pencil className="cursor-pointer" onClick={() => handleEditQuestion(index)} size={20} />}
              </div>

              {/* ✅ FIXED OPTIONS DISPLAY */}
              <div className="grid grid-cols-2 gap-4 mt-2">
                {Array.isArray(question.options) ? (
                  question.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <p className="font-medium">{String.fromCharCode(65 + i)}. {stripHtmlTags(option)}</p>
                    </div>
                  ))
                ) : (
                  Object.entries(question.options || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <p className="font-medium">{key}. {stripHtmlTags(value)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => navigate('/answer-key', { state: { finalPaper, correctAnswers } })} className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
        Answer Key
      </button>
      <button onClick={handleDownloadPDF} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
        Download PDF
      </button>
      <button onClick={() => alert('Paper Submitted Successfully!')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
        Submit
      </button>
    </div>
  );
};

export default FinalPaperPage;
