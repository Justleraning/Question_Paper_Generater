import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { FORMAT_TEXT_COMMAND } from "@lexical/commands";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="editor-toolbar">
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}>
        <b>B</b>
      </button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}>
        <i>I</i>
      </button>
      <button onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")}>
        <u>U</u>
      </button>
    </div>
  );
};

export default Toolbar;
