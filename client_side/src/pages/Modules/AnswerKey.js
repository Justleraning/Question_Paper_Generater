import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import universityLogo from '../../assets/images/logo.png'; // Import the university logo

const AnswerKey = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    questions, 
    courseName, 
    customSubjectName,
    totalMarks = 40, // Default to 40 if not provided
    examTime, 
    canReturn = true 
  } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Group questions by subject
  const groupedQuestions = {};
  questions?.forEach(question => {
    if (!groupedQuestions[question.subject]) {
      groupedQuestions[question.subject] = [];
    }
    groupedQuestions[question.subject].push(question);
  });
  
  // Generate PDF of answer key
  const downloadAnswerKey = () => {
    try {
      setLoading(true);
      
      const doc = new jsPDF();
      
      // Add university logo
      try {
        doc.addImage(universityLogo, 'PNG', 20, 10, 20, 20);
      } catch (logoErr) {
        console.warn("Could not add logo:", logoErr);
      }
      
      // Add title
      doc.setFontSize(18);
      doc.text("ANSWER KEY", 105, 20, { align: 'center' });
      
      // Add course info with customSubjectName if available
      doc.setFontSize(14);
      const courseDisplay = customSubjectName 
        ? `Course: ${courseName} - ${customSubjectName}` 
        : `Course: ${courseName}`;
      doc.text(courseDisplay, 105, 30, { align: 'center' });
      
      // Add total marks and time
      doc.setFontSize(12);
      doc.text(`Total Marks: ${totalMarks || 40}`, 20, 40); // Always show the configured marks
      doc.text(`Exam Time: ${examTime || 1} hours`, 20, 50);
      
      let y = 70;
      
      // Generate answer key by subject
      Object.keys(groupedQuestions).forEach(subject => {
        // Add subject heading
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(`${subject}`, 20, y);
        y += 10;
        
        // Reset font
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        groupedQuestions[subject].forEach((question, index) => {
          // Check if we need a new page
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          
          // Question number and correct option
          const optionLabels = ['A', 'B', 'C', 'D'];
          const correctOptionLetter = optionLabels[question.correctOption] || 'N/A';
          
          const questionNumber = index + 1;
          const text = `${questionNumber}. ${stripHTMLTags(question.question)}`;
          
          // If text is too long, truncate it
          const maxLength = 70;
          const displayText = text.length > maxLength 
            ? text.substring(0, maxLength) + '...' 
            : text;
          
          doc.text(`${displayText}`, 20, y);
          doc.text(`Answer: ${correctOptionLetter}`, 160, y, { align: 'right' });
          
          if (question.marks && question.marks > 1) {
            doc.text(`(${question.marks} marks)`, 185, y, { align: 'right' });
          }
          
          y += 10;
        });
        
        // Add spacing between subjects
        y += 10;
      });
      
      // Save the PDF
      doc.save(`${courseName}_Answer_Key.pdf`);
      setNotification("Answer key downloaded successfully!");
      
    } catch (error) {
      console.error("Error generating answer key PDF:", error);
      setNotification("Failed to generate answer key. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to strip HTML tags from text
  const stripHTMLTags = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  
  // Handle return navigation
  const handleReturn = () => {
    navigate('/all', { 
      state: {
        returnFromAnswerKey: true,
        courseName,
        customSubjectName,
        totalMarks,
        examTime
      }
    });
  };
  
  // Handle dashboard navigation
  const goToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Notification */}
      {notification && (
        <div className="w-full mb-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded">
          {notification}
        </div>
      )}
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Answer Key</h1>
        <p className="text-gray-600">{courseName}</p>
        {customSubjectName && <p className="text-gray-600">{customSubjectName}</p>}
        <p className="text-gray-600">Total Marks: {totalMarks || 40}</p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <button
          onClick={downloadAnswerKey}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Download Answer Key'}
        </button>
        
        <button
          onClick={handleReturn}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Paper Preview
        </button>
        
        <button
          onClick={goToDashboard}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Go to Dashboard
        </button>
      </div>
      
      {/* Answer Key Content */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg mb-6 shadow-sm">
        <div className="flex items-center justify-center mb-4">
          <img src={universityLogo} alt="University Logo" className="h-12 mr-2" />
          <h2 className="text-xl font-bold">Answer Key</h2>
        </div>
        
        {Object.keys(groupedQuestions).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No questions available.</p>
          </div>
        ) : (
          <div>
            {Object.entries(groupedQuestions).map(([subject, subjectQuestions]) => (
              <div key={subject} className="mb-8">
                <h3 className="text-lg font-bold mb-4 pb-2 border-b border-gray-300">
                  {subject}
                </h3>
                
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 text-left border border-gray-300 w-16">Q. No.</th>
                      <th className="p-2 text-left border border-gray-300">Question</th>
                      <th className="p-2 text-center border border-gray-300 w-24">Answer</th>
                      <th className="p-2 text-center border border-gray-300 w-24">Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectQuestions.map((question, index) => {
                      const optionLabels = ['A', 'B', 'C', 'D'];
                      const correctOptionLetter = optionLabels[question.correctOption] || 'N/A';
                      
                      return (
                        <tr key={question.id} className="hover:bg-gray-50">
                          <td className="p-2 border border-gray-300 text-center">{index + 1}</td>
                          <td className="p-2 border border-gray-300">
                            <div className="line-clamp-2">
                              {stripHTMLTags(question.question)}
                            </div>
                          </td>
                          <td className="p-2 border border-gray-300 text-center font-semibold">
                            {correctOptionLetter}
                          </td>
                          <td className="p-2 border border-gray-300 text-center">
                            {question.marks || 1}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerKey;