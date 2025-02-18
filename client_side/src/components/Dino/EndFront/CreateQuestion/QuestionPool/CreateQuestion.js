import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateQuestion.css";

function CreateQuestion() {
  const [questions, setQuestions] = useState([
    {
      id: Date.now(),
      bloomType: "",
      questionType: "",
      text: "",
      options: ["", "", "", ""], // Default 4 options
      optionTypes: ["text", "text", "text", "text"], // Default all text
      images: { questionImage: null, optionImages: [null, null, null, null] },
    },
  ]);

  const navigate = useNavigate();

  // Handle Bloom Type Change
  const handleBloomTypeChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, bloomType: value } : q)));
  };

  // Handle Question Type Change (Show MCQ options if selected)
  const handleQuestionTypeChange = (id, value) => {
    setQuestions(questions.map((q) =>
      q.id === id
        ? {
            ...q,
            questionType: value,
            options: value === "MCQ" ? ["", "", "", ""] : [],
            optionTypes: value === "MCQ" ? ["text", "text", "text", "text"] : [],
            images: { questionImage: null, optionImages: [null, null, null, null] },
          }
        : q
    ));
  };

  // Handle Question Text Change
  const handleQuestionChange = (id, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, text: value } : q)));
  };

  // Handle MCQ Option Change
  const handleOptionChange = (id, index, value) => {
    setQuestions(questions.map((q) =>
      q.id === id ? { ...q, options: q.options.map((opt, idx) => (idx === index ? value : opt)) } : q
    ));
  };

  // Handle MCQ Option Type Change (Switch between Text and Image)
  const handleOptionTypeChange = (id, index, type) => {
    setQuestions(questions.map((q) =>
      q.id === id
        ? {
            ...q,
            optionTypes: q.optionTypes.map((opt, idx) => (idx === index ? type : opt)),
            options: q.options.map((opt, idx) => (idx === index && type === "text" ? "" : opt)),
            images: {
              ...q.images,
              optionImages: q.images.optionImages.map((img, idx) => (idx === index && type === "image" ? null : img)),
            },
          }
        : q
    ));
  };

  // Handle Image Upload for Question & MCQ Options
  const handleImageUpload = (id, file, type, optionIndex = null) => {
    setQuestions(questions.map((q) => {
      if (q.id === id) {
        if (type === "question") {
          return { ...q, images: { ...q.images, questionImage: file } };
        } else if (type === "option" && optionIndex !== null) {
          const updatedOptionImages = [...q.images.optionImages];
          updatedOptionImages[optionIndex] = file;
          return { ...q, images: { ...q.images, optionImages: updatedOptionImages } };
        }
      }
      return q;
    }));
  };

  // Delete Image from Question or Option
  const handleDeleteImage = (id, type, optionIndex = null) => {
    setQuestions(questions.map((q) => {
      if (q.id === id) {
        if (type === "question") {
          return { ...q, images: { ...q.images, questionImage: null } };
        } else if (type === "option" && optionIndex !== null) {
          const updatedOptionImages = [...q.images.optionImages];
          updatedOptionImages[optionIndex] = null;
          return { ...q, images: { ...q.images, optionImages: updatedOptionImages } };
        }
      }
      return q;
    }));
  };

  // Delete Question
  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // Add New Question
  const addNewQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        bloomType: "",
        questionType: "",
        text: "",
        options: ["", "", "", ""],
        optionTypes: ["text", "text", "text", "text"],
        images: { questionImage: null, optionImages: [null, null, null, null] },
      },
    ]);
  };

  // Save Questions & Redirect to Question Pool
  const handleSaveQuestions = () => {
    console.log("Saved Questions:", questions);
    alert("Questions saved successfully!");
    navigate("/question-pool", { state: { updatedQuestions: questions } });
  };

  return (
    <div className="outer-container">
      <div className="inner-container">
        <h1 className="page-title">Create Questions</h1>

        {questions.map((q) => (
          <div key={q.id} className="question-container">
            <button className="delete-btn" onClick={() => deleteQuestion(q.id)}>✖</button>

            {/* Bloom Type Dropdown */}
            <label>Bloom Type:</label>
            <select className="dropdown" value={q.bloomType} onChange={(e) => handleBloomTypeChange(q.id, e.target.value)}>
              <option value="">Select Bloom Type</option>
              <option value="Remember">Remember</option>
              <option value="Understand">Understand</option>
              <option value="Apply">Apply</option>
              <option value="Analyze">Analyze</option>
              <option value="Evaluate">Evaluate</option>
              <option value="Create">Create</option>
            </select>

            {/* Question Type Dropdown */}
            <label>Question Type:</label>
            <select className="dropdown" value={q.questionType} onChange={(e) => handleQuestionTypeChange(q.id, e.target.value)}>
              <option value="">Select Question Type</option>
              <option value="Descriptive">Descriptive</option>
              <option value="MCQ">MCQ</option>
            </select>

            {/* Question Input */}
            <textarea className="question-input" placeholder="Type your Question" value={q.text} onChange={(e) => handleQuestionChange(q.id, e.target.value)} />

            {/* Upload Image for Question */}
            <label>Upload Image for Question:</label>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(q.id, e.target.files[0], "question")} />
            {q.images.questionImage && (
              <div className="image-preview-frame">
                <img src={URL.createObjectURL(q.images.questionImage)} alt="Uploaded" />
                <button className="delete-image-btn" onClick={() => handleDeleteImage(q.id, "question")}>✖</button>
              </div>
            )}

            {/* MCQ Options */}
            {q.questionType === "MCQ" && (
              <div className="mcq-options">
                <label>MCQ Options:</label>
                {q.options.map((option, index) => (
                  <div key={index} className="mcq-option">
                    <select onChange={(e) => handleOptionTypeChange(q.id, index, e.target.value)} className="option-type-dropdown">
                      <option value="text">Text</option>
                      <option value="image">Image</option>
                    </select>
                    {q.optionTypes[index] === "text" ? (
                      <input type="text" placeholder={'Type your Option'} value={option} onChange={(e) => handleOptionChange(q.id, index, e.target.value)} />
                    ) : (
                      <>
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(q.id, e.target.files[0], "option", index)} />
                        {q.images.optionImages[index] && (
                          <div className="image-preview-frame">
                            <img src={URL.createObjectURL(q.images.optionImages[index])} alt="Uploaded" />
                            <button className="delete-image-btn" onClick={() => handleDeleteImage(q.id, "option", index)}>✖</button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <button className="add-btn" onClick={addNewQuestion}>+ Add Question</button>
        <button className="save-btn" onClick={handleSaveQuestions}>Save Questions</button>
      </div>
    </div>
  );
}

export default CreateQuestion;


