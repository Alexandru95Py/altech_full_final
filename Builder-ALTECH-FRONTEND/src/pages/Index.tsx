import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { MainContent } from "@/components/dashboard/MainContent";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { FeedbackPrompt } from "@/components/dashboard/FeedbackPrompt";
import { Footer } from "@/components/dashboard/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">
          <div className="space-y-6">
            <MainContent />
            <QuickActions />
          </div>
        </div>
      </main>

      {/* Feedback Prompt */}
      <FeedbackPrompt />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
