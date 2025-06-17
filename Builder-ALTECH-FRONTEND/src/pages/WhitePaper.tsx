import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertCircle,
  Target,
  CheckCircle,
  Settings,
  Monitor,
  Brain,
  Cloud,
  Calendar,
  Shield,
  Eye,
  Trash2,
  Users,
  Smartphone,
  CreditCard,
  Building,
  Database,
  Zap,
  Lock,
  Sparkles,
} from "lucide-react";

const WhitePaper = () => {
  const objectives = [
    "Build a powerful yet easy-to-use platform",
    "Offer all essential PDF functions (edit, protect, sign, split, etc.)",
    "Integrate AI and automation for next-gen features",
    "Give users control over their documents and data",
    "Constant updates and community-driven evolution",
  ];

  const techStack = [
    {
      icon: Settings,
      title: "Backend",
      description: "Django + REST API",
      detail: "Robust server architecture for reliable document processing",
    },
    {
      icon: Monitor,
      title: "Frontend",
      description: "React / Builder.io",
      detail: "Modern, responsive interface built with cutting-edge tools",
    },
    {
      icon: Brain,
      title: "Planned AI",
      description: "GPT-based assistance",
      detail: "Smart writing, formatting, and document analysis capabilities",
    },
    {
      icon: Cloud,
      title: "Cloud-ready",
      description: "Scalable deployment",
      detail: "Designed for secure, distributed cloud environments",
    },
  ];

  const roadmapData = [
    {
      quarter: "Q1–Q2",
      title: "Core features",
      color: "from-blue-500 to-blue-600",
      features: [
        "User accounts",
        "File security",
        "Basic editing tools",
        "Document sharing",
      ],
    },
    {
      quarter: "Q3–Q4",
      title: "AI + Automation",
      color: "from-yellow-500 to-orange-500",
      features: [
        "Mobile versions",
        "Cloud sync",
        "Smart suggestions",
        "Workflow automation",
      ],
    },
    {
      quarter: "2026+",
      title: "Monetization options",
      color: "from-green-500 to-emerald-600",
      features: [
        "Pro plan",
        "B2B services",
        "Enterprise features",
        "Partner integrations",
      ],
    },
  ];

  const privacyPrinciples = [
    {
      icon: Eye,
      title: "No data exploitation",
      description: "We don't sell or exploit user data",
    },
    {
      icon: Lock,
      title: "Encryption by default",
      description: "All file processing uses end-to-end encryption",
    },
    {
      icon: Trash2,
      title: "User control",
      description: "Users can delete files anytime",
    },
    {
      icon: Shield,
      title: "Privacy standards",
      description: "Compliant with European privacy regulations",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%236366f1" fill-opacity="0.05"%3E%3Cpath d="m0 40 40-40h-40z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-30'
              }
            ></div>
            <div className="relative max-w-7xl mx-auto px-6 lg:px-12 xl:px-16 py-20 lg:py-24 text-center">
              <div className="mb-6">
                <Badge
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 mb-4"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  Technical Overview
                </Badge>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                ALTech PDF – White Paper
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 font-light max-w-3xl mx-auto">
                A clear roadmap for PDF innovation, privacy and automation.
              </p>
            </div>
          </div>

          {/* Problem Statement */}
          <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16 py-16 lg:py-20">
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl md:text-3xl text-slate-900">
                  The Problem We're Solving
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center max-w-5xl mx-auto">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  PDF tools are often expensive, complex, or locked behind
                  paywalls. Users are forced to choose between expensive
                  enterprise solutions or limited free tools that compromise on
                  features and security.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  ALTech PDF aims to offer modern, accessible, privacy-first
                  tools without compromising quality. We believe powerful
                  document management should be available to everyone, not just
                  large corporations.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Futuristic Illustration 1 */}
          <div className="text-center py-12 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="w-20 h-20 text-blue-600" />
                </div>
              </div>
              <p className="text-slate-600 mt-4 italic font-medium">
                Secure document processing
              </p>
            </div>
          </div>

          {/* Vision and Objectives */}
          <div className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-12 xl:px-16">
              <div className="text-center mb-12">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Vision and Objectives
                </h2>
                <p className="text-xl text-slate-600">
                  Our mission is clear: democratize powerful PDF tools for
                  everyone
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
                {objectives.map((objective, index) => (
                  <Card
                    key={index}
                    className="border-green-200 hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-700 font-medium">
                          {objective}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-gradient-to-br from-slate-100 to-blue-50 py-20">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Technology Stack
                </h2>
                <p className="text-xl text-slate-600">
                  Built with modern, reliable technologies for optimal
                  performance
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8">
                {techStack.map((tech, index) => (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <CardContent className="p-6">
                      <div className="w-12 h-12 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                        <tech.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {tech.title}
                      </h3>
                      <p className="text-blue-600 font-medium mb-2">
                        {tech.description}
                      </p>
                      <p className="text-sm text-slate-600">{tech.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Futuristic Illustration 2 */}
          <div className="text-center py-16 bg-slate-900">
            <div className="max-w-4xl mx-auto px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-80 animate-bounce"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Cloud className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-blue-200 font-medium">
                    Cloud Infrastructure
                  </p>
                </div>

                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-80 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-blue-200 font-medium">Automation</p>
                </div>

                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full opacity-80 animate-bounce"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-blue-200 font-medium">
                    AI Integration
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Roadmap Overview */}
          <div className="bg-white py-20">
            <div className="max-w-6xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  Roadmap Overview
                </h2>
                <p className="text-xl text-slate-600">
                  Our journey from core features to enterprise solutions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {roadmapData.map((phase, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div
                      className={`h-2 bg-gradient-to-r ${phase.color}`}
                    ></div>
                    <CardHeader className="text-center">
                      <Badge
                        className={`mx-auto mb-2 bg-gradient-to-r ${phase.color} text-white border-none`}
                      >
                        {phase.quarter}
                      </Badge>
                      <CardTitle className="text-xl text-slate-900">
                        {phase.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {phase.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${phase.color}`}
                            ></div>
                            <span className="text-slate-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Privacy & Ethics */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
            <div className="max-w-5xl mx-auto px-6">
              <div className="text-center mb-12">
                <div className="w-16 h-16 mx-auto bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Privacy & Ethics
                </h2>
                <p className="text-xl text-blue-200">
                  Your data security and privacy are our top priorities
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {privacyPrinciples.map((principle, index) => (
                  <Card
                    key={index}
                    className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white/20 rounded-lg">
                          <principle.icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">
                            {principle.title}
                          </h3>
                          <p className="text-blue-200">
                            {principle.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-100">
              <CardContent className="p-12">
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-6 text-slate-800">
                  "ALTech PDF isn't just a tool – it's the start of a
                  responsible, intelligent, and user-first document platform."
                </blockquote>
                <div className="flex items-center justify-center">
                  <a
                    href="/ALTech_WhitePaper_v1.0_2025.pdf"
                    download="ALTech_WhitePaper_v1.0_2025.pdf"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span className="text-lg">📄</span>
                    Download White Paper v1.0 – 2025 (PDF)
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Technical Appendix */}
          <div className="bg-slate-100 py-16">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Technical Appendix
              </h3>
              <p className="text-slate-600 mb-6">
                For detailed technical specifications, API documentation, and
                implementation guides, please refer to our developer resources.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                <span>Last updated: January 2025</span>
                <span>•</span>
                <span>Version 1.0</span>
                <span>•</span>
                <span>Next review: Q2 2025</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WhitePaper;
