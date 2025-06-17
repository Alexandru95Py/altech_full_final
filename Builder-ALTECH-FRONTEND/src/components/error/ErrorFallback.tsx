import React from "react";
import { useError } from "@/contexts/ErrorContext";
import { ErrorModal } from "./ErrorModal";
import { ErrorToast } from "./ErrorToast";

export const ErrorFallback: React.FC = () => {
  const { errorState, hideError } = useError();

  if (!errorState.isVisible || !errorState.config) {
    return null;
  }

  const { config } = errorState;

  // Handle modal errors
  if (config.type === "modal") {
    return (
      <ErrorModal
        isOpen={errorState.isVisible}
        config={config}
        onClose={hideError}
      />
    );
  }

  // Handle toast errors
  if (config.type === "toast") {
    return <ErrorToast config={config} onDismiss={hideError} />;
  }

  return null;
};
