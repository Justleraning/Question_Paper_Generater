import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { FORMAT_TEXT_COMMAND } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical"; // ✅ Correct way to get text content
import { useEditor } from "./EditorContext";

const editorConfig = {
  namespace: "MyEditor",
  theme: {
    paragraph: "editor-paragraph",
  },
  onError(error) {
    console.error("Lexical Error:", error);
  },
};

// ✅ Formatting Toolbar Inside the Editor
const FormattingToolbar = () => {
  const [editor] = useLexicalComposerContext();
  const { format } = useEditor();

  return (
    <div style={{
      display: "flex",
      gap: "8px",
      padding: "8px",
      backgroundColor: "#f1f1f1",
      borderBottom: "1px solid #ddd",
      borderTopLeftRadius: "5px",
      borderTopRightRadius: "5px",
    }}>
      <button 
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
        style={{
          fontWeight: "bold", 
          backgroundColor: format.bold ? "#ccc" : "white",
          padding: "5px",
          border: "1px solid #ddd",
          cursor: "pointer"
        }}>
        B
      </button>
      <button 
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
        style={{
          fontStyle: "italic", 
          backgroundColor: format.italic ? "#ccc" : "white",
          padding: "5px",
          border: "1px solid #ddd",
          cursor: "pointer"
        }}>
        I
      </button>
      <button 
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}
        style={{
          textDecoration: "underline", 
          backgroundColor: format.underline ? "#ccc" : "white",
          padding: "5px",
          border: "1px solid #ddd",
          cursor: "pointer"
        }}>
        U
      </button>
    </div>
  );
};

const LexicalEditor = ({ onChange }) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <div style={{
        width: "500px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: "white",
      }}>
        <FormattingToolbar /> {/* 🔹 The Toolbar is now inside the editor */}
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="editor-input"
              style={{
                width: "100%",
                padding: "8px",
                minHeight: "100px",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                backgroundColor: "white",
                outline: "none",
              }}
            />
          }
          placeholder={<div style={{ padding: "8px", color: "#999" }}>Start typing...</div>}
        />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              const textContent = $getRoot().getTextContent(); 
              if (onChange) onChange(textContent);
            });
          }}
        />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
};

export default LexicalEditor;
