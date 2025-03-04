import React, { createContext, useContext, useState } from "react";

const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  return (
    <EditorContext.Provider value={{ format, setFormat }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => useContext(EditorContext);
