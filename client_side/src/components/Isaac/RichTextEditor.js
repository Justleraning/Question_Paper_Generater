import React from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const RichTextEditor = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"], // Text styling
      ["blockquote", "code-block"],             // Blocks
      [{ list: "ordered" }, { list: "bullet" }], // Lists
      ["link", "image"],                        // Links and images
    ],
  };

  return <ReactQuill value={value} onChange={onChange} modules={modules} />;
};

export default RichTextEditor;
