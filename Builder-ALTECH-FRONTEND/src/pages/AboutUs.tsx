import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Brain,
  Users,
  Zap,
  Lightbulb,
  Code,
  Sparkles,
  Rocket,
  Heart,
  CheckCircle,
} from "lucide-react";

const AboutUs = () => {
  const philosophyPoints = [
    {
      icon: CheckCircle,
      text: "Clean and intuitive design, inspired by tools like Adobe",
      color: "text-green-600",
    },
    {
      icon: Shield,
      text: "Secure by default – privacy and file safety come first",
      color: "text-blue-600",
    },
    {
      icon: Users,
      text: "Built for everyday users, freelancers, educators, and professionals",
      color: "text-purple-600",
    },
    {
      icon: Zap,
      text: "Under constant development — new features are added weekly",
      color: "text-orange-600",
    },
    {
      icon: Lightbulb,
      text: "Future plans: AI-powered writing, automation, and collaborative editing",
      color: "text-yellow-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="relative overflow-hidden">
          {/* Hero Section */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white">
            <div
              className={
                'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-50'
              }
            ></div>
            <div className="relative max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-20 lg:py-24 text-center">
              <div className="mb-6">
                <Badge
                  variant="outline"
                  className="bg-white/10 text-white border-white/20 mb-4"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Independent Innovation
                </Badge>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                About ALTech PDF
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 font-light">
                Built with passion, driven by purpose.
              </p>
            </div>
          </div>

          {/* Vision Section */}
          <div className="max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 py-16 lg:py-20">
            <Card className="border-0 shadow-xl bg-gradient-to-r from-white to-blue-50">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="mb-8">
                  <Heart className="w-12 h-12 mx-auto text-red-500 mb-4" />
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">
                    Our Vision
                  </h2>
                </div>
                <p className="text-lg text-slate-700 leading-relaxed max-w-3xl mx-auto">
                  ALTech PDF was born from a simple belief: everyone deserves
                  access to powerful, professional-grade PDF tools without
                  complexity or compromise. We're building a smart, intuitive
                  platform that puts accessibility and utility at its core,
                  ensuring that whether you're a student, freelancer, or
                  enterprise professional, you have the tools you need to
                  succeed. Our commitment to data privacy, automation, and
                  future AI integration drives every decision we make. Developed
                  by a dedicated individual with an unwavering commitment to
                  continuous improvement and exceptional user experience, ALTech
                  PDF represents the future of document management.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Futuristic Illustration 1 */}
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="relative">
                <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code className="w-24 h-24 text-blue-600" />
                </div>
              </div>
              <p className="text-slate-500 mt-4 italic">
                Innovation through code
              </p>
            </div>
          </div>

          {/* Philosophy Section */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Why ALTech PDF?</h2>
                <p className="text-xl text-blue-200">
                  Every feature, every design decision, every line of code is
                  guided by our core principles
                </p>
              </div>

              <div className="space-y-6">
                {philosophyPoints.map((point, index) => (
                  <Card
                    key={index}
                    className="bg-white/10 border-white/20 backdrop-blur-sm"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`p-2 rounded-lg bg-white/20 ${point.color}`}
                        >
                          <point.icon className="w-6 h-6" />
                        </div>
                        <p className="text-lg text-white flex-1">
                          {point.text}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Futuristic Illustration 2 */}
          <div className="py-16 bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-6 lg:px-12 xl:px-16 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-8 lg:gap-12">
                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-blue-500 rounded-lg opacity-80 animate-bounce"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-slate-600 font-medium">AI-Powered</p>
                </div>

                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg opacity-80 animate-pulse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-slate-600 font-medium">
                    Future-Ready
                  </p>
                </div>

                <div className="relative">
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-400 to-red-500 rounded-lg opacity-80 animate-bounce"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <p className="mt-4 text-slate-600 font-medium">
                    Lightning Fast
                  </p>
                </div>
              </div>
              <p className="text-slate-500 mt-8 text-lg italic">
                This is just the beginning.
              </p>
            </div>
          </div>

          {/* Development Story */}
          <div className="max-w-4xl mx-auto px-6 py-16">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
              <CardContent className="p-8 md:p-12 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Crafted with Care
                  </h3>
                </div>
                <p className="text-lg text-slate-700 leading-relaxed">
                  ALTech PDF isn't backed by a large corporation or venture
                  capital. It's the passion project of an independent developer
                  who believes in creating tools that truly serve their users.
                  Every feature is thoughtfully designed, every interaction
                  carefully crafted, and every update driven by real user needs.
                  This personal approach means faster iterations, more
                  responsive development, and a product that evolves based on
                  genuine feedback rather than boardroom decisions.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Futuristic Illustration 3 */}
          <div className="text-center py-12 bg-slate-100">
            <div className="max-w-lg mx-auto">
              <div className="relative">
                <div className="grid grid-cols-3 gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg opacity-60 animate-pulse"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg opacity-80 animate-bounce"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg opacity-60 animate-pulse"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-cyan-500 rounded-lg opacity-80 animate-bounce"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg opacity-90"></div>
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-lg opacity-80 animate-bounce"></div>
                </div>
              </div>
              <p className="text-slate-500 mt-6 italic">
                Building the future, one feature at a time
              </p>
            </div>
          </div>

          {/* Roadmap Section */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-blue-900 text-white py-20">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl font-bold mb-8">What's Next?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Brain className="w-10 h-10 mx-auto mb-4 text-cyan-400" />
                    <h3 className="text-lg font-semibold mb-2">
                      AI Integration
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Smart document analysis and automated workflows
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Users className="w-10 h-10 mx-auto mb-4 text-green-400" />
                    <h3 className="text-lg font-semibold mb-2">
                      Collaboration
                    </h3>
                    <p className="text-blue-200 text-sm">
                      Real-time editing and team workspace features
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <Zap className="w-10 h-10 mx-auto mb-4 text-yellow-400" />
                    <h3 className="text-lg font-semibold mb-2">Automation</h3>
                    <p className="text-blue-200 text-sm">
                      Workflow automation and batch processing
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 to-blue-900 text-white">
              <CardContent className="p-12">
                <div className="mb-8">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-10 h-10 text-white" />
                  </div>
                </div>
                <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-6">
                  "This platform is more than a project — it's a promise to keep
                  building better tools, every single day."
                </blockquote>
                <div className="flex items-center justify-center gap-2 text-blue-200">
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">The ALTech PDF Team</span>
                  <Sparkles className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Illustration */}
          <div className="text-center py-16 bg-gradient-to-t from-slate-100 to-white">
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="w-48 h-48 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Rocket className="w-16 h-16 mx-auto text-blue-600 mb-2" />
                    <p className="text-slate-600 font-semibold">
                      Ready for liftoff
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutUs;
