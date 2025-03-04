import React from "react";
import { useEditor } from "../../Contexts/EditorContext";

const FormattingPanel = () => {
  const { format, toggleFormat } = useEditor();

  return (
    <div style={{
      width: "110px",
      minHeight: "0",
      backgroundColor: "#f5f5f5",
      display: "flex",
      flexDirection: "initial",
      padding: "5px",
    }}>
      
      <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
        <button
          onClick={() => toggleFormat("bold")}
          style={{
            padding: "10px",
            backgroundColor: format.bold ? "#007bff" : "#ffffff",
            color: format.bold ? "#ffffff" : "#000000",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          B
        </button>

        <button
          onClick={() => toggleFormat("italic")}
          style={{
            padding: "10px",
            backgroundColor: format.italic ? "#007bff" : "#ffffff",
            color: format.italic ? "#ffffff" : "#000000",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            cursor: "pointer",
            fontStyle: "italic"
          }}
        >
          I
        </button>

        <button
          onClick={() => toggleFormat("underline")}
          style={{
            padding: "10px",
            backgroundColor: format.underline ? "#007bff" : "#ffffff",
            color: format.underline ? "#ffffff" : "#000000",
            border: "1px solid #ced4da",
            borderRadius: "5px",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          U
        </button>
      </div>
    </div>
  );
};

export default FormattingPanel;