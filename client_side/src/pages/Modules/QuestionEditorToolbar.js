import React from 'react';

// Toolbar for the question editor
const QuestionEditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border rounded-t mb-1 bg-gray-100 p-1 flex flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          editor.isActive('bold') ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          editor.isActive('italic') ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Italic"
      >
        <em>I</em>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          editor.isActive('underline') ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Underline"
      >
        <u>U</u>
      </button>
      
      <div className="border-l border-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Align Left"
      >
        ←
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Align Center"
      >
        ↔
      </button>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Align Right"
      >
        →
      </button>
      
      <div className="border-l border-gray-300 mx-1"></div>
      
 
      
      <div className="flex-grow"></div>
      
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          !editor.can().undo() ? 'text-gray-400 bg-gray-100' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Undo"
      >
        ↩️
      </button>
      
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`px-2 py-1 mx-1 text-sm rounded ${
          !editor.can().redo() ? 'text-gray-400 bg-gray-100' : 'bg-gray-200 hover:bg-gray-300'
        }`}
        title="Redo"
      >
        ↪️
      </button>
    </div>
  );
};

export default QuestionEditorToolbar;