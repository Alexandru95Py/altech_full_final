import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Shield,
  Brain,
  Smartphone,
  User,
  Zap,
  MessageSquare,
  Code,
  CreditCard,
  Eye,
  Download,
  Sparkles,
} from "lucide-react";

const FAQ = () => {
  const faqData = [
    {
      id: "what-is",
      icon: HelpCircle,
      question: "What is ALTech PDF?",
      answer:
        "ALTech PDF is a modern platform designed to help you manage your PDF files efficiently — split, merge, edit, sign, protect, and more. It's built by an independent developer with a focus on usability and innovation.",
      category: "General",
    },
    {
      id: "pricing",
      icon: CreditCard,
      question: "Is ALTech PDF free?",
      answer:
        "Yes, all current features are available for free. Premium features like AI Assistant and advanced tools may be introduced in the future, but the core tools will remain free.",
      category: "Pricing",
    },
    {
      id: "privacy",
      icon: Shield,
      question: "Is my data private and secure?",
      answer:
        "Absolutely. Your uploaded files are processed securely and never shared. You can delete them anytime. We do not sell or use your data for advertising.",
      category: "Privacy",
    },
    {
      id: "account",
      icon: User,
      question: "Can I use ALTech PDF without creating an account?",
      answer:
        'You can explore some tools without an account, but features like saving to "My Files" require login for privacy and file history tracking.',
      category: "Account",
    },
    {
      id: "ai-features",
      icon: Brain,
      question: "Will there be AI features?",
      answer:
        "Yes, AI-powered assistance is planned for future versions. You'll be able to write, format, and generate PDF content smarter and faster.",
      category: "Features",
    },
    {
      id: "installation",
      icon: Download,
      question: "Do I need to install anything?",
      answer:
        "No installation is required. ALTech PDF works directly in your browser — desktop or mobile.",
      category: "Technical",
    },
    {
      id: "developer",
      icon: Code,
      question: "Who built this?",
      answer:
        "The platform was created and is maintained by a single independent developer, with a long-term vision to make PDF management simple, secure, and smart.",
      category: "About",
    },
    {
      id: "updates",
      icon: Zap,
      question: "How often is the app updated?",
      answer:
        "New features are added regularly. We aim to improve functionality weekly based on user feedback.",
      category: "Development",
    },
    {
      id: "support",
      icon: MessageSquare,
      question: "How can I report a problem or request a feature?",
      answer:
        "Use the Support button in the sidebar to send us a message. You can also attach screenshots or files when submitting a request.",
      category: "Support",
    },
  ];

  const categories = [...new Set(faqData.map((item) => item.category))];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "General":
        return HelpCircle;
      case "Pricing":
        return CreditCard;
      case "Privacy":
        return Shield;
      case "Account":
        return User;
      case "Features":
        return Brain;
      case "Technical":
        return Smartphone;
      case "About":
        return Code;
      case "Development":
        return Zap;
      case "Support":
        return MessageSquare;
      default:
        return HelpCircle;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      General: "from-blue-500 to-blue-600",
      Pricing: "from-green-500 to-green-600",
      Privacy: "from-red-500 to-red-600",
      Account: "from-purple-500 to-purple-600",
      Features: "from-yellow-500 to-orange-500",
      Technical: "from-indigo-500 to-indigo-600",
      About: "from-pink-500 to-pink-600",
      Development: "from-cyan-500 to-cyan-600",
      Support: "from-emerald-500 to-emerald-600",
    };
    return (
      colors[category as keyof typeof colors] || "from-slate-500 to-slate-600"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-white">
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23a855f7" fill-opacity="0.05"%3E%3Ccircle cx="15" cy="15" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-40'
              }
            ></div>
            <div className="relative max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-20 lg:py-24 text-center">
              <div className="mb-6">
                <Badge
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 mb-4"
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Help Center
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                FAQ
              </h1>
              <h2 className="text-xl md:text-2xl text-purple-100 font-light mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-purple-200 max-w-2xl mx-auto">
                Find answers to the most common questions about ALTech PDF.
                Can't find what you're looking for? Contact our support team.
              </p>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="bg-white border-b border-slate-200 py-6">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 xl:px-16">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Browse by Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category);
                  return (
                    <Badge
                      key={category}
                      variant="outline"
                      className={cn(
                        "cursor-pointer hover:shadow-md transition-all",
                        `bg-gradient-to-r ${getCategoryColor(category)} text-white border-none`,
                      )}
                      onClick={() => {
                        const element = document.getElementById(
                          `category-${category.toLowerCase()}`,
                        );
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <IconComponent className="w-3 h-3 mr-1" />
                      {category}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-16 lg:py-20">
            <div className="space-y-8">
              {categories.map((category) => {
                const categoryQuestions = faqData.filter(
                  (item) => item.category === category,
                );
                const IconComponent = getCategoryIcon(category);

                return (
                  <div key={category} id={`category-${category.toLowerCase()}`}>
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} flex items-center justify-center`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900">
                        {category}
                      </h3>
                      <div className="flex-1 h-px bg-slate-200"></div>
                    </div>

                    <Card className="shadow-sm">
                      <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                          {categoryQuestions.map((faq, index) => (
                            <AccordionItem
                              key={faq.id}
                              value={faq.id}
                              className={cn(
                                "border-b border-slate-200",
                                index === categoryQuestions.length - 1 &&
                                  "border-b-0",
                              )}
                            >
                              <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 transition-colors">
                                <div className="flex items-center gap-3 text-left">
                                  <div
                                    className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getCategoryColor(category)} flex items-center justify-center opacity-80`}
                                  >
                                    <faq.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-medium text-slate-900">
                                    {faq.question}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-6 pb-4">
                                <div className="pl-11">
                                  <p className="text-slate-700 leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Still Need Help Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <Card className="border-0 shadow-xl bg-white">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Still Need Help?
                    </h3>
                    <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
                      Couldn't find the answer you were looking for? Our support
                      team is here to help you with any questions or issues you
                      might have.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                      <CardContent className="p-4 text-center">
                        <MessageSquare className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                        <h4 className="font-semibold text-slate-900 mb-1">
                          Contact Support
                        </h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Get help from our support team
                        </p>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Open Support Chat →
                        </button>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                      <CardContent className="p-4 text-center">
                        <Eye className="w-8 h-8 mx-auto text-green-600 mb-2" />
                        <h4 className="font-semibold text-slate-900 mb-1">
                          Feature Request
                        </h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Suggest new features or improvements
                        </p>
                        <button className="text-green-600 hover:text-green-700 font-medium text-sm">
                          Submit Idea →
                        </button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-900 text-white py-12">
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-400 mb-2">
                    24/7
                  </div>
                  <p className="text-slate-300">Support Availability</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400 mb-2">
                    &lt;1hr
                  </div>
                  <p className="text-slate-300">Average Response Time</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    99.9%
                  </div>
                  <p className="text-slate-300">User Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="max-w-4xl mx-auto px-6 py-16 text-center">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
              <CardContent className="p-12">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">
                    Ready to Get Started?
                  </h3>
                  <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
                    Join thousands of users who trust ALTech PDF for their
                    document management needs.
                  </p>
                  <button className="bg-white text-slate-900 px-6 py-3 rounded-lg font-medium hover:bg-slate-100 transition-colors">
                    Try ALTech PDF Now
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default FAQ;
