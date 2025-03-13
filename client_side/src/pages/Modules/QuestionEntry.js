import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getQuestionByIndex, saveQuestion, getQuestionById } from "../../services/paperService.js";

// Import components
import QuestionEditorToolbar from "./QuestionEditorToolbar.js";
import SubjectProgressDisplay from "./SubjectProgressDisplay.js";
import NavigationButtons from "./NavigationButtons.js";
import ConfirmModal from "./ConfirmModal.js";
import StatusMessages from "./StatusMessage.js";
import QuestionOptionsForm from "./QuestionOptionsForm.js";
import QuestionPreviewModal from "./QuestionPreview.js";
import NextSubjectConfirmModal from "./NextSubjectConfirmModal.js";

// Constants
const SUBJECTS = ["LR", "QP", "ENG", "CUSTOM"];
const SUBJECT_NAMES = {
  LR: "Logical Reasoning",
  QP: "Quantitative Problem Solving",
  ENG: "English",
  CUSTOM: ""
};
const createDefaultOptions = () => Array(4).fill(null).map(() => ({ type: "Text", value: "" }));
const CSS_STYLES = `
  .tiptap-editor .ProseMirror { min-height: 120px; width: 100%; outline: none; }
  .editor-container { padding: 0 !important; overflow: hidden; }
  .editor-content { width: 100% !important; padding: 16px !important; }
  .subject-config-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
    background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; 
    justify-content: center; z-index: 1000; }
  .subject-config-modal { background-color: white; padding: 2rem; border-radius: 0.5rem; 
    max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto; }
`;

const QuestionEntry = () => {
  const navigate = useNavigate();
  const { courseName, subjectName } = useParams();
  const decodedCourseName = decodeURIComponent(courseName || "");
  const decodedSubjectName = decodeURIComponent(subjectName || "");
  SUBJECT_NAMES.CUSTOM = decodedSubjectName;
  
  // References
  const editorRef = useRef(null);

  // Main state object
  const [state, setState] = useState({
    // Config
    markType: 40,
    isConfigured: false,
    questionCounts: { LR: 15, QP: 15, ENG: 15, CUSTOM: 15 },
    
    // Current question
    currentSubjectIndex: 0,
    currentQuestionIndex: 1,
    questionText: "",
    options: createDefaultOptions(),
    correctOption: null,
    isQuestionSaved: false,
    
    // Progress
    subjectProgress: SUBJECTS.reduce((acc, subject) => {
      acc[subject] = { completed: false, questions: {} };
      return acc;
    }, {}),
    questionIds: SUBJECTS.reduce((acc, subject) => {
      acc[subject] = {};
      return acc;
    }, {}),
    
    // UI
    isLoading: false,
    error: null,
    notification: null,
    isPreviewModalOpen: false,
    isConfirmModalOpen: false,
    isNextSubjectModalOpen: false,
    isSubjectConfigModalOpen: true
  });

  // Destructure state
  const {
    markType, isConfigured, questionCounts,
    currentSubjectIndex, currentQuestionIndex, questionText, options, correctOption, isQuestionSaved,
    subjectProgress, questionIds,
    isLoading, error, notification, 
    isPreviewModalOpen, isConfirmModalOpen, isNextSubjectModalOpen, isSubjectConfigModalOpen
  } = state;

  // Current subject info
  const currentSubject = SUBJECTS[currentSubjectIndex];
  const currentSubjectName = SUBJECT_NAMES[currentSubject];

  // Update specific state properties
  const updateState = (updates) => setState(prev => ({ ...prev, ...updates }));
  const setNotificationWithTimeout = (msg) => {
    updateState({ notification: msg });
    setTimeout(() => updateState({ notification: null }), 3000);
  };

  // Reset fields
  const resetFields = () => {
    updateState({
      questionText: "",
      options: createDefaultOptions(),
      correctOption: null,
      isQuestionSaved: false
    });
    editor?.commands?.setContent?.("");
  };

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ bold: false, italic: false }),
      Bold, Italic, Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] })
    ],
    content: "",
    onUpdate: ({ editor }) => updateState({
      questionText: editor.getHTML(),
      isQuestionSaved: false
    })
  });

  // Initialize
  useEffect(() => {
    if (editor) editorRef.current = editor;
    
    // Add CSS
    const styleTag = document.createElement('style');
    styleTag.innerHTML = CSS_STYLES;
    document.head.appendChild(styleTag);
    return () => document.head.removeChild(styleTag);
  }, [editor]);

  // Mark question as unsaved when edited
  useEffect(() => updateState({ isQuestionSaved: false }), [questionText, options, correctOption]);

  // Fetch and load question
  const fetchQuestion = async (subject, index) => {
    if (!editor) return;
    
    try {
      updateState({ isLoading: true, error: null, isQuestionSaved: false });
      
      const subjectName = SUBJECT_NAMES[subject];
      const questionId = questionIds[subject][index];
      
      let data = questionId 
        ? await getQuestionById(questionId)
        : await getQuestionByIndex(decodedCourseName, subjectName, index);
      
      if (data?.questionId && !questionId) {
        const updatedIds = {...questionIds};
        updatedIds[subject][index] = data.questionId;
        updateState({ questionIds: updatedIds });
      }
  
      if (data?.question) {
        // Format options
        let formattedOptions = Array.isArray(data.options) 
          ? data.options.map(opt => ({ type: "Text", value: opt.value || "" }))
          : [];
  
        // Fill with default options
        const fullOptions = [
          ...formattedOptions, 
          ...Array(Math.max(0, 4 - formattedOptions.length)).fill(null).map(() => ({ type: "Text", value: "" }))
        ];
        
        // Ensure correctOption is a number and convert from 0-based to 1-based
        const validCorrectOption = typeof data.correctOption === 'number' 
          ? data.correctOption + 1 
          : typeof data.correctOption === 'string' 
            ? Number(data.correctOption) + 1 
            : null;
  
        // Update state and cache
        const updatedProgress = {...subjectProgress};
        updatedProgress[subject].questions[index] = {
          text: stripHTMLTags(data.question), 
          options: fullOptions,
          correctOption: validCorrectOption,
          questionId: data.questionId
        };
        
        updateState({
          questionText: stripHTMLTags(data.question),
          options: fullOptions,
          correctOption: validCorrectOption,
          isQuestionSaved: true,
          subjectProgress: updatedProgress
        });
        
        editor?.commands?.setContent?.(data.question);
      } else {
        resetFields();
      }
    } catch (error) {
      console.error(`[${subject}] Error fetching question:`, error);
      updateState({ error: `Failed to load question.` });
      resetFields();
    } finally {
      updateState({ isLoading: false });
    }
  };

  // Load question when subject or index changes
  useEffect(() => {
    if (!editor || !isConfigured) return;
    
    const subject = currentSubject;
    const index = currentQuestionIndex;
    const cachedQuestion = subjectProgress[subject]?.questions[index];
    
    if (cachedQuestion) {
      updateState({
        questionText: cachedQuestion.text || "",
        options: cachedQuestion.options || createDefaultOptions(),
        correctOption: cachedQuestion.correctOption,
        isQuestionSaved: true
      });
      editor.commands.setContent(cachedQuestion.text || "");
    } else {
      fetchQuestion(subject, index);
    }
  }, [currentSubject, currentQuestionIndex, editor, isConfigured]);

  // Save current question
  const saveCurrentQuestion = async () => {
    try {
      const subject = currentSubject;
      const index = currentQuestionIndex;
      
      // Validation
      if (!questionText?.trim()) {
        updateState({ error: "Question text cannot be empty" });
        return false;
      }
  
      const formattedOptions = options.map(opt => ({
        type: "Text",
        value: (opt?.value || "").trim(),
      }));
  
      if (formattedOptions.filter(opt => opt.value.length > 0).length < 2) {
        updateState({ error: "At least two options are required" });
        return false;
      }
  
      if (correctOption === null || correctOption === undefined) {
        updateState({ error: "Please select a correct option" });
        return false;
      }
      
      // Convert correctOption to number and validate
      const validCorrectOption = Number(correctOption);
      if (isNaN(validCorrectOption) || validCorrectOption < 1 || validCorrectOption > 4) {
        updateState({ error: "Invalid correct option selected" });
        return false;
      }
  
      // Get questionId
      const questionId = questionIds[subject][index];
      
      // Update cache
      const updatedProgress = {...subjectProgress};
      updatedProgress[subject].questions[index] = {
        text: questionText, 
        options: [...formattedOptions],
        correctOption: validCorrectOption,
        questionId: questionId
      };
      
      // Check if subject is complete
      updatedProgress[subject].completed = 
        Object.keys(updatedProgress[subject].questions).length === questionCounts[subject];
      
      // Send to backend - ensure we're sending a number for correctOption
      const payload = {
        courseName: decodedCourseName,
        subject: SUBJECT_NAMES[subject],
        question: stripHTMLTags(questionText) ,
        options: formattedOptions,
        correctOption: validCorrectOption - 1, // Convert to 0-based, ensure it's a number
        index,
        questionId,
      };
  
      console.log("Saving question with payload:", payload);
  
      const result = await saveQuestion(decodedCourseName,SUBJECT_NAMES[subject] , payload);
      
      // Save new questionId
      if (result?.question?.questionId) {
        const updatedIds = {...questionIds};
        updatedIds[subject][index] = result.question.questionId;
        updateState({ questionIds: updatedIds });
      }
      
      updateState({
        subjectProgress: updatedProgress,
        isQuestionSaved: true,
        error: null
      });
      
      setNotificationWithTimeout("Question saved successfully!");
      return true;
    } catch (error) {
      console.error("Save error:", error);
      updateState({ error: `Failed to save: ${error.message || "Unknown error"}` });
      return false;
    }
  };

  const stripHTMLTags = (html) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };
  // Navigation handlers
  const handleSaveQuestion = async () => {
    updateState({ error: null });
    await saveCurrentQuestion();
  };

  const handleNextQuestion = async () => {
    // Validate
    if (!questionText?.trim() || 
        options.filter(opt => opt?.value?.trim().length > 0).length < 2 ||
        correctOption === null) {
      updateState({ notification: "Please complete all required fields." });
      return;
    }
    
    // Save and advance
    if (await saveCurrentQuestion()) {
      if (currentQuestionIndex < questionCounts[currentSubject]) {
        updateState({ currentQuestionIndex: currentQuestionIndex + 1 });
      } else {
        // End of subject
        const updatedProgress = {...subjectProgress};
        updatedProgress[currentSubject].completed = true;
        
        updateState({
          notification: `Completed all questions for ${currentSubjectName}!`,
          subjectProgress: updatedProgress,
          isNextSubjectModalOpen: currentSubjectIndex < SUBJECTS.length - 1
        });
      }
    }
  };

  const handlePrevQuestion = async () => {
    if (currentQuestionIndex > 1) {
      if (questionText?.trim() && correctOption !== null) await saveCurrentQuestion();
      updateState({ currentQuestionIndex: currentQuestionIndex - 1, error: null });
    }
  };

 

  const showNextSubjectConfirm = async () => {
    // Validate and save
    if (!questionText?.trim() || correctOption === null) {
      updateState({ notification: "Please complete the current question first." });
      return;
    }
    
    if (await saveCurrentQuestion()) updateState({ isNextSubjectModalOpen: true });
  };
  
  const handleNextSubject = async () => {
    // Mark completed and move to next
    const updatedProgress = {...subjectProgress};
    updatedProgress[currentSubject].completed = true;
    
    if (currentSubjectIndex < SUBJECTS.length - 1) {
      updateState({
        error: null,
        isNextSubjectModalOpen: false,
        subjectProgress: updatedProgress,
        currentSubjectIndex: currentSubjectIndex + 1,
        currentQuestionIndex: 1
      });
      resetFields();
      setNotificationWithTimeout(`Now entering ${SUBJECT_NAMES[SUBJECTS[currentSubjectIndex + 1]]}`);
    } else {
      updateState({
        isNextSubjectModalOpen: false,
        subjectProgress: updatedProgress,
        notification: "All subjects completed! Preview the final paper."
      });
    }
  };

  // Option updates
  const updateOption = (optionIndex, field, value) => {
    const updatedOptions = [...options];
    
    if (!updatedOptions[optionIndex]) {
      updatedOptions[optionIndex] = { type: "Text", value: "" };
    }
    
    if (field === "value" || field === "type") {
      updatedOptions[optionIndex][field] = value;
    }
    
    updateState({ options: updatedOptions, isQuestionSaved: false });
  };

  // Preview and final actions
  const handlePreviewSubject = async () => {
    if (!isQuestionSaved && questionText?.trim()) await saveCurrentQuestion();
    updateState({ isPreviewModalOpen: true, error: null });
  };

  const getCurrentSubjectQuestions = () => {
    const questionsMap = subjectProgress[currentSubject]?.questions || {};
    return Object.entries(questionsMap)
      .filter(([_, q]) => q?.text)
      .map(([index, q]) => ({ ...q, index: parseInt(index) }))
      .sort((a, b) => a.index - b.index);
  };

  const handleShowFinalPreviewConfirm = async () => {
    if (!isQuestionSaved && questionText?.trim()) {
      if (await saveCurrentQuestion()) updateState({ isConfirmModalOpen: true });
    } else {
      updateState({ isConfirmModalOpen: true });
    }
  };
  
  const handleFinalPreviewConfirmed = async () => {
    // Prepare all questions
    const allQuestions = {};
    SUBJECTS.forEach(subject => {
      const questions = Object.entries(subjectProgress[subject]?.questions || {})
        .filter(([_, q]) => q?.text)
        .map(([idx, q]) => ({
          index: parseInt(idx),
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
          questionId: q.questionId
        }))
        .sort(() => 0.5 - Math.random()) // Randomize
        .slice(0, markType === 40 ? 15 : 20); // Limit
      
      allQuestions[subject] = questions;
    });
    
    // Navigate to preview
    updateState({ isConfirmModalOpen: false });
    navigate("/all", {
      state: {
        courseName: decodedCourseName,
        customSubjectName: decodedSubjectName,
        allQuestions,
        subjects: SUBJECTS,
        subjectNames: SUBJECT_NAMES,
        questionCounts,
        markType
      }
    });
  };

  // Edit and delete
  const handleEditFromPreview = (questionData, action = 'edit') => {
    if (!questionData) return;
    
    if (action === 'delete') {
      deleteQuestion(questionData.index);
    } else {
      updateState({
        currentQuestionIndex: questionData.index,
        questionText: questionData.text || "",
        options: questionData.options || createDefaultOptions(),
        correctOption: questionData.correctOption,
        isQuestionSaved: true,
        isPreviewModalOpen: false
      });
      
      editor?.commands?.setContent?.(questionData.text || "");
    }
  };

  const deleteQuestion = async (indexToDelete) => {
    try {
      const subject = currentSubject;
      
      // Delete and reindex
      const updatedProgress = {...subjectProgress};
      const updatedIds = {...questionIds};
      
      delete updatedProgress[subject].questions[indexToDelete];
      delete updatedIds[subject][indexToDelete];
      
      // Get remaining questions
      const remaining = Object.entries(updatedProgress[subject].questions)
        .filter(([_, q]) => q?.text)
        .map(([idx, q]) => ({index: parseInt(idx), ...q}))
        .sort((a, b) => a.index - b.index);
      
      // Reindex
      const reindexed = {};
      const reindexedIds = {};
      
      remaining.forEach((q, i) => {
        const newIndex = i + 1;
        reindexed[newIndex] = {
          text: q.text,
          options: q.options,
          correctOption: q.correctOption,
          questionId: q.questionId
        };
        
        if (q.questionId) reindexedIds[newIndex] = q.questionId;
      });
      
      // Update state
      updatedProgress[subject].questions = reindexed;
      updatedIds[subject] = reindexedIds;
      
      // Adjust current index
      const count = Object.keys(reindexed).length;
      const newIndex = currentQuestionIndex > count && count > 0 ? count : currentQuestionIndex;
      
      updateState({
        subjectProgress: updatedProgress,
        questionIds: updatedIds,
        currentQuestionIndex: newIndex,
        error: null
      });
      
      setNotificationWithTimeout("Question deleted and reindexed successfully.");
      return true;
    } catch (error) {
      updateState({ error: `Failed to delete: ${error.message || "Unknown error"}` });
      return false;
    }
  };

  // Status checks
  const areAllSubjectsComplete = () => SUBJECTS.every(subject => subjectProgress[subject].completed);
  const isCurrentSubjectComplete = () => Object.keys(subjectProgress[currentSubject]?.questions || {}).length > 0;
  const hasAnyQuestions = () => SUBJECTS.some(subject => 
    Object.keys(subjectProgress[subject]?.questions || {}).length > 0
  );
  
  // Configuration
  const handleMarkTypeChange = (newValue) => {
    const newType = parseInt(newValue);
    if (newType === 40 || newType === 60) {
      const maxQuestions = newType === 40 ? 15 : 20;
      
      // Update counts
      const updatedCounts = {};
      Object.keys(questionCounts).forEach(subject => {
        updatedCounts[subject] = Math.min(questionCounts[subject], maxQuestions);
      });
      
      updateState({ markType: newType, questionCounts: updatedCounts });
    }
  };
  
  const handleConfigSubmit = (e) => {
    e.preventDefault();
    updateState({
      isConfigured: true,
      isSubjectConfigModalOpen: false,
      notification: `Starting with ${currentSubjectName}. ${markType} Marks Paper.`
    });
  };
  
  // Render configuration modal
  const SubjectConfigModal = () => (
    <div className="subject-config-overlay">
      <div className="subject-config-modal">
        <h2 className="text-xl font-bold mb-4">Configure Question Paper</h2>
        
        <div className="mb-6">
          <p className="font-medium mb-2">Select Paper Type:</p>
          <div className="flex gap-4">
            {[40, 60].map(type => (
              <label key={type} className="flex items-center">
                <input 
                  type="radio" 
                  value={type} 
                  checked={markType === type}
                  onChange={() => handleMarkTypeChange(type)}
                  className="mr-2"
                />
                {type} Marks ({type === 40 ? 15 : 20} questions per section)
              </label>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleConfigSubmit}>
          {SUBJECTS.map((subject) => (
            <div key={subject} className="mb-4">
              <label className="block font-medium mb-1">
                {SUBJECT_NAMES[subject] || subject} Questions:
              </label>
              <input
                type="number"
                min="1"
                max={markType === 40 ? 15 : 20}
                value={questionCounts[subject]}
                onChange={(e) => {
                  const count = parseInt(e.target.value);
                  if (!isNaN(count)) {
                    const max = markType === 40 ? 15 : 20;
                    const validCount = Math.min(Math.max(1, count), max);
                    const updatedCounts = {...questionCounts, [subject]: validCount};
                    updateState({ questionCounts: updatedCounts });
                  }
                }}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
          ))}
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 mt-6"
          >
            Start Creating Questions
          </button>
        </form>
      </div>
    </div>
  );
  
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto px-4 md:px-8 py-6 min-h-screen overflow-y-auto pb-32">
      {/* Modals */}
      {isSubjectConfigModalOpen && <SubjectConfigModal />}
      
      <QuestionPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => updateState({ isPreviewModalOpen: false })}
        subjectName={currentSubjectName}
        questions={getCurrentSubjectQuestions()}
        onEditQuestion={handleEditFromPreview}
        showOptions={true}
      />
      
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onCancel={() => updateState({ isConfirmModalOpen: false })}
        onConfirm={handleFinalPreviewConfirmed}
        title="Confirmation"
        message="Once you proceed to Final Preview, you cannot return. Continue?"
      />
      
      <NextSubjectConfirmModal
        isOpen={isNextSubjectModalOpen}
        onCancel={() => updateState({ isNextSubjectModalOpen: false })}
        onConfirm={handleNextSubject}
        currentSubjectName={currentSubjectName}
        nextSubjectName={currentSubjectIndex < SUBJECTS.length - 1 ? 
          SUBJECT_NAMES[SUBJECTS[currentSubjectIndex + 1]] : ""}
        completedQuestions={Object.keys(subjectProgress[currentSubject]?.questions || {}).length}
        totalQuestions={questionCounts[currentSubject]}
      />
      
      {/* Status messages */}
      <StatusMessages 
        notification={notification}
        error={error}
        isLoading={isLoading}
      />
      
      {isConfigured && (
        <>
          {/* Paper information */}
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded mb-4 w-full text-center">
            {markType} Marks Paper ({questionCounts[currentSubject]} questions per section)
          </div>
          
          {/* Progress */}
          <SubjectProgressDisplay
            SUBJECTS={SUBJECTS}
            SUBJECT_NAMES={SUBJECT_NAMES}
            currentSubjectIndex={currentSubjectIndex}
            subjectProgress={subjectProgress}
            currentQuestionIndex={currentQuestionIndex}
            TOTAL_QUESTIONS={questionCounts[currentSubject]}
            isCurrentSubjectComplete={isCurrentSubjectComplete}
            questionCounts={questionCounts}
          />

          {/* Question header */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mt-2">Enter Questions for {currentSubjectName}</h2>
            <h3 className="text-lg font-semibold text-gray-700">{decodedCourseName} - {decodedSubjectName}</h3>
            <p className="text-sm text-gray-500 mt-1 mb-3">
              Question {currentQuestionIndex} of {questionCounts[currentSubject]}
            </p>
          </div>

          {/* Editor */}
          <QuestionEditorToolbar editor={editor} />
          <div className="w-full max-w-3xl mx-auto border border-black rounded editor-container">
            <EditorContent editor={editor} className="editor-content tiptap-editor" />
          </div>

          {/* Options */}
          <QuestionOptionsForm
            options={options}
            updateOption={updateOption}
            correctOption={correctOption}
            setCorrectOption={(option) => updateState({ correctOption: option })}
            hideImageOption={true}
          />
          
          {/* Navigation */}
          <NavigationButtons
            currentQuestionIndex={currentQuestionIndex}
            handlePrevQuestion={handlePrevQuestion}
            handleNextQuestion={handleNextQuestion}
            handlePreviewSubject={handlePreviewSubject}
            handleShowFinalPreviewConfirm={handleShowFinalPreviewConfirm}
            showNextSubjectConfirm={showNextSubjectConfirm}
            isCurrentSubjectComplete={isCurrentSubjectComplete}
            areAllSubjectsComplete={areAllSubjectsComplete}
            currentSubjectIndex={currentSubjectIndex}
            SUBJECTS={SUBJECTS}
            hasAnyQuestions={hasAnyQuestions}
          />
        </>
      )}
    </div>
  );
};

export default QuestionEntry;