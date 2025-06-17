import React, { createContext, useContext, useState, useEffect } from "react";

interface TutorialContextType {
  showTutorial: boolean;
  setShowTutorial: (show: boolean) => void;
  completeTutorial: () => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
  hasCompletedTutorial: boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false);

  useEffect(() => {
    // Check tutorial completion status on mount
    const completed = localStorage.getItem("altech-tutorial-completed");
    const isFirstVisit = !localStorage.getItem("altech-first-visit");
    const shouldRestart = localStorage.getItem("altech-restart-tutorial");

    setHasCompletedTutorial(!!completed);

    // Show tutorial for new users or when manually restarted
    if (!completed && (isFirstVisit || shouldRestart)) {
      // Small delay to ensure components are mounted
      setTimeout(() => {
        setShowTutorial(true);
      }, 1000);

      localStorage.setItem("altech-first-visit", "true");
      localStorage.removeItem("altech-restart-tutorial");
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
    setHasCompletedTutorial(true);
    localStorage.setItem("altech-tutorial-completed", "true");
  };

  const skipTutorial = () => {
    setShowTutorial(false);
    setHasCompletedTutorial(true);
    localStorage.setItem("altech-tutorial-completed", "true");
  };

  const restartTutorial = () => {
    localStorage.removeItem("altech-tutorial-completed");
    localStorage.setItem("altech-restart-tutorial", "true");
    setHasCompletedTutorial(false);
    setShowTutorial(true);
  };

  const value: TutorialContextType = {
    showTutorial,
    setShowTutorial,
    completeTutorial,
    skipTutorial,
    restartTutorial,
    hasCompletedTutorial,
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorialContext = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error(
      "useTutorialContext must be used within a TutorialProvider",
    );
  }
  return context;
};
