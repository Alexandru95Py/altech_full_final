import React, { createContext, useContext, useState, useCallback } from "react";
import { ErrorConfig, ErrorState, DEFAULT_ERROR_CONFIG } from "@/types/error";

interface ErrorContextType {
  showError: (config: Partial<ErrorConfig>) => void;
  showModalError: (config: Partial<ErrorConfig>) => void;
  showToastError: (config: Partial<ErrorConfig>) => void;
  hideError: () => void;
  errorState: ErrorState;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within ErrorProvider");
  }
  return context;
};

interface ErrorProviderProps {
  children: React.ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    isVisible: false,
    config: null,
  });

  const showError = useCallback((config: Partial<ErrorConfig>) => {
    const mergedConfig = {
      ...DEFAULT_ERROR_CONFIG,
      ...config,
    };

    setErrorState({
      isVisible: true,
      config: mergedConfig,
    });

    // Auto-dismiss for toast notifications
    if (
      mergedConfig.type === "toast" &&
      mergedConfig.duration &&
      mergedConfig.duration > 0
    ) {
      setTimeout(() => {
        setErrorState((prev) => ({ ...prev, isVisible: false }));
      }, mergedConfig.duration);
    }
  }, []);

  const showModalError = useCallback(
    (config: Partial<ErrorConfig>) => {
      showError({ ...config, type: "modal" });
    },
    [showError],
  );

  const showToastError = useCallback(
    (config: Partial<ErrorConfig>) => {
      showError({ ...config, type: "toast" });
    },
    [showError],
  );

  const hideError = useCallback(() => {
    setErrorState({ isVisible: false, config: null });
  }, []);

  const value = {
    showError,
    showModalError,
    showToastError,
    hideError,
    errorState,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
};
