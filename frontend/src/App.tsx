import { useState, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { SupportModal } from "@/components/dashboard/SupportModal";
import { ErrorFallback } from "@/components/error/ErrorFallback";
import { Tutorial } from "@/components/tutorial/Tutorial";
import { MockModeBanner } from "@/components/shared/MockModeBanner";

import { AuthProvider } from "@/contexts/authContext";
import { StorageProvider } from "@/contexts/StorageContext";
import { TutorialProvider, useTutorialContext } from "@/contexts/TutorialContext";
import { ErrorProvider } from "@/contexts/ErrorContext";

// Debug utils
import "@/utils/downloadTest";
import "@/utils/simpleDownloadTest";

// Pages
import Index from "./pages/Index";
import Tools from "./pages/Tools";
import MyFiles from "./pages/MyFiles";
import FillSign from "./pages/FillSign";
import ProtectDocument from "./pages/ProtectDocument";
import CreatePDF from "./pages/CreatePDF";
import AboutUs from "./pages/AboutUs";
import WhitePaper from "./pages/WhitePaper";
import FAQ from "./pages/FAQ";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import SplitPDF from "./pages/SplitPDF";
import MergePDF from "./pages/MergePDF";
import ReorderPDF from "./pages/ReorderPDF";
import CompressPDF from "./pages/CompressPDF";
import ExtractPages from "./pages/ExtractPages";
import RotatePages from "./pages/RotatePages";
import ConvertPDF from "./pages/ConvertPDF";
import DeletePages from "./pages/DeletePages";
import BatchProcessing from "./pages/BatchProcessing";
import SecurityPrivacy from "./pages/SecurityPrivacy";
import GenerateCV from "./pages/GenerateCV";
import TestPage from "./pages/TestPage";
import VerifyEmail from "./pages/VerifyEmail";
import NotFound from "./pages/NotFound";

// Global support modal context
interface SupportContextType {
  openSupportModal: () => void;
}
const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const useSupportModal = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error("useSupportModal must be used within SupportProvider");
  }
  return context;
};

const queryClient = new QueryClient();

const AppContent = () => {
  const { showTutorial, completeTutorial, skipTutorial } = useTutorialContext();

  return (
    <>
      {/* <MockModeBanner /> */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/files" element={<MyFiles />} />
        <Route path="/fill-sign" element={<FillSign />} />
        <Route path="/protect" element={<ProtectDocument />} />
        <Route path="/create" element={<CreatePDF />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/whitepaper" element={<WhitePaper />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/split-pdf" element={<SplitPDF />} />
        <Route path="/tools/merge" element={<MergePDF />} />
        <Route path="/tools/reorder" element={<ReorderPDF />} />
        <Route path="/tools/compress" element={<CompressPDF />} />
        <Route path="/tools/extract" element={<ExtractPages />} />
        <Route path="/tools/rotate" element={<RotatePages />} />
        <Route path="/tools/convert" element={<ConvertPDF />} />
        <Route path="/tools/delete" element={<DeletePages />} />
        <Route path="/tools/batch" element={<BatchProcessing />} />
        <Route path="/security" element={<SecurityPrivacy />} />
        <Route path="/generate-cv" element={<GenerateCV />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Tutorial
        isVisible={showTutorial}
        onComplete={completeTutorial}
        onSkip={skipTutorial}
      />
    </>
  );
};

const App = () => {
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const openSupportModal = () => setIsSupportModalOpen(true);
  const closeSupportModal = () => setIsSupportModalOpen(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StorageProvider>
          <AuthProvider>
            <TutorialProvider>
              <ErrorProvider>
                <SupportContext.Provider value={{ openSupportModal }}>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AppContent />
                  </BrowserRouter>
                  <SupportModal
                    isOpen={isSupportModalOpen}
                    onClose={closeSupportModal}
                  />
                  <ErrorFallback />
                </SupportContext.Provider>
              </ErrorProvider>
            </TutorialProvider>
          </AuthProvider>
        </StorageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;