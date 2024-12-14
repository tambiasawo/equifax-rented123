import React, { createContext, useState, useCallback, useContext } from "react";

// Define the type for the context value
type XMLResultType = {
  XMLResult: Document | null; //Document // Use a more specific type if possible
  changeXMLResult: (result: Document) => void;
};

// Create the context with a default value
export const ResultCtx = createContext<XMLResultType>({
  XMLResult: null,
  changeXMLResult: () => {
    throw new Error(
      "changeXMLResult function must be used within a ResultCtxProvider"
    );
  },
});

// Create the context provider component
export const ResultCtxProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [XMLResult, setXMLResult] = useState<Document | null>(null); // Replace `unknown` with a specific type if applicable

  const changeXMLResult = useCallback((result: unknown) => {
    console.log("ctx", result);
    setXMLResult(result as Document);
  }, []);

  const value = { XMLResult, changeXMLResult };

  return <ResultCtx.Provider value={value}>{children}</ResultCtx.Provider>;
};

// Hook for consuming the context
export const useResultCtx = () => {
  const context = useContext(ResultCtx);
  if (!context) {
    throw new Error("useResultCtx must be used within a ResultCtxProvider");
  }
  return context;
};
