import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  UserCheck,
  Settings,
  Shield,
  Bot,
  AlertTriangle,
  Scale,
  RefreshCw,
  Mail,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function TermsOfService() {
  const navigate = useNavigate();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="pl-60 pt-16 pb-20">
        <div className="p-6">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Terms of Service
                </h1>
                <p className="text-slate-600">Last updated: December 2024</p>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Badge
                variant="outline"
                className="text-orange-600 border-orange-200"
              >
                Beta Project
              </Badge>
              <Badge
                variant="outline"
                className="text-blue-600 border-blue-200"
              >
                Independent Creator
              </Badge>
              <Badge
                variant="outline"
                className="text-green-600 border-green-200"
              >
                Effective Immediately
              </Badge>
            </div>
          </div>

          <div className="max-w-4xl space-y-8">
            {/* Quick Expand/Collapse All */}
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setExpandedSections([
                    "intro",
                    "eligibility",
                    "responsibilities",
                    "service",
                    "account",
                    "ai",
                    "warranty",
                    "liability",
                    "changes",
                    "contact",
                  ])
                }
              >
                Expand All Sections
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedSections([])}
              >
                Collapse All
              </Button>
            </div>

            <Accordion
              type="multiple"
              value={expandedSections}
              onValueChange={setExpandedSections}
              className="space-y-4"
            >
              {/* Introduction */}
              <AccordionItem value="intro">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <FileText className="h-5 w-5 text-blue-600" />
                      1. Introduction & Agreement
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-700 leading-relaxed mb-4">
                          Welcome to ALTech PDF! By accessing or using our
                          platform, you agree to be bound by these Terms of
                          Service. Please read them carefully before using our
                          services.
                        </p>
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            Important Notice
                          </h4>
                          <p className="text-blue-800 text-sm">
                            ALTech PDF is an independent project created by a
                            solo developer and is not affiliated with any
                            registered company or commercial entity. This
                            platform is currently in beta development phase.
                          </p>
                        </div>
                        <p className="text-slate-700 leading-relaxed mt-4">
                          By creating an account or using any of our tools, you
                          acknowledge that you have read, understood, and agree
                          to be bound by these terms. If you do not agree with
                          any part of these terms, please do not use our
                          service.
                        </p>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Eligibility */}
              <AccordionItem value="eligibility">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Users className="h-5 w-5 text-green-600" />
                      2. Eligibility & Account Requirements
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" />
                              Age Requirement
                            </h4>
                            <p className="text-green-800 text-sm">
                              You must be at least <strong>16 years old</strong>{" "}
                              to create an account and use ALTech PDF. Users
                              under 18 should have parental consent.
                            </p>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Permitted Use
                            </h4>
                            <p className="text-blue-800 text-sm">
                              This service is intended for:
                            </p>
                            <ul className="text-blue-800 text-sm mt-2 ml-4 space-y-1">
                              <li>
                                • Personal document editing and management
                              </li>
                              <li>
                                • Academic research and educational purposes
                              </li>
                              <li>
                                • Professional (non-commercial) document
                                processing
                              </li>
                              <li>• Small business document workflows</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2">
                              Account Responsibility
                            </h4>
                            <p className="text-yellow-800 text-sm">
                              You are responsible for maintaining the
                              confidentiality of your account credentials and
                              for all activities that occur under your account.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* User Responsibilities */}
              <AccordionItem value="responsibilities">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <UserCheck className="h-5 w-5 text-purple-600" />
                      3. User Responsibilities & Content Guidelines
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2">
                            Content Ownership
                          </h4>
                          <p className="text-purple-800 text-sm">
                            You retain full ownership of all files and content
                            you upload. You are solely responsible for ensuring
                            you have the right to upload and process any content
                            on our platform.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-semibold text-red-900 mb-2">
                              Prohibited Content
                            </h4>
                            <ul className="text-red-800 text-sm space-y-1">
                              <li>• Illegal or copyrighted material</li>
                              <li>• Malware or harmful code</li>
                              <li>• Personal information of others</li>
                              <li>• Hate speech or discriminatory content</li>
                              <li>• Adult or inappropriate material</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Technical Limits
                            </h4>
                            <ul className="text-blue-800 text-sm space-y-1">
                              <li>
                                • Maximum file size: <strong>10MB</strong>
                              </li>
                              <li>
                                • Supported formats: PDF, DOCX, TXT, JPG, PNG
                              </li>
                              <li>• No batch processing over 50 files</li>
                              <li>• Fair usage policy applies</li>
                            </ul>
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Enforcement
                          </h4>
                          <p className="text-orange-800 text-sm">
                            Violation of these guidelines may result in content
                            removal, account suspension, or permanent
                            termination of access to the platform.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Use of Service */}
              <AccordionItem value="service">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Settings className="h-5 w-5 text-blue-600" />
                      4. Service Usage & Availability
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2">
                              What You Can Do
                            </h4>
                            <ul className="text-green-800 text-sm space-y-1">
                              <li>
                                • Upload, edit, and download your documents
                              </li>
                              <li>
                                • Use all available PDF manipulation tools
                              </li>
                              <li>
                                • Save files to "My Files" for future access
                              </li>
                              <li>• Share processed documents as needed</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              File Storage Policy
                            </h4>
                            <p className="text-blue-800 text-sm">
                              Files are stored temporarily during processing.
                              Unless explicitly saved to "My Files", uploaded
                              documents are automatically deleted within 24
                              hours for security and storage management.
                            </p>
                          </div>

                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2">
                              Service Limitations
                            </h4>
                            <p className="text-yellow-800 text-sm mb-2">
                              As a beta platform, you may experience:
                            </p>
                            <ul className="text-yellow-800 text-sm space-y-1">
                              <li>• Occasional downtime for maintenance</li>
                              <li>• Bugs or incomplete features</li>
                              <li>
                                • Performance limitations during high usage
                              </li>
                              <li>
                                • Changes to features without prior notice
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Account Management */}
              <AccordionItem value="account">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Shield className="h-5 w-5 text-indigo-600" />
                      5. Account Management & Security
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                            <h4 className="font-semibold text-indigo-900 mb-2">
                              Your Responsibilities
                            </h4>
                            <ul className="text-indigo-800 text-sm space-y-1">
                              <li>• Keep login credentials secure</li>
                              <li>• Use strong, unique passwords</li>
                              <li>• Report suspicious account activity</li>
                              <li>• Keep contact information updated</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-green-900 mb-2">
                              Our Protection
                            </h4>
                            <ul className="text-green-800 text-sm space-y-1">
                              <li>• Password encryption and hashing</li>
                              <li>• Session timeout protection</li>
                              <li>• Account activity monitoring</li>
                              <li>• SSL encryption for all data</li>
                            </ul>
                          </div>
                        </div>

                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">
                            Account Suspension
                          </h4>
                          <p className="text-red-800 text-sm">
                            We reserve the right to suspend or terminate
                            accounts that violate these terms, engage in abusive
                            behavior, or pose security risks to the platform or
                            other users.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* AI Features */}
              <AccordionItem value="ai">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Bot className="h-5 w-5 text-purple-600" />
                      6. AI Features & Content Generation
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <h4 className="font-semibold text-purple-900 mb-2">
                            Future AI Capabilities
                          </h4>
                          <p className="text-purple-800 text-sm">
                            ALTech PDF plans to introduce AI-powered features
                            including content generation, document analysis, and
                            automated suggestions. These features are currently
                            in development.
                          </p>
                        </div>

                        <div className="grid gap-4">
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2">
                              AI Disclaimer
                            </h4>
                            <ul className="text-yellow-800 text-sm space-y-1">
                              <li>
                                • AI suggestions are not legally binding advice
                              </li>
                              <li>
                                • Generated content should be reviewed and
                                verified
                              </li>
                              <li>
                                • AI is not a replacement for professional
                                consultation
                              </li>
                              <li>
                                • Users are responsible for final content
                                decisions
                              </li>
                            </ul>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Content Ownership
                            </h4>
                            <p className="text-blue-800 text-sm">
                              You retain ownership of all content created using
                              AI features. However, you are responsible for
                              ensuring AI-generated content meets your specific
                              needs and requirements.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Disclaimer of Warranty */}
              <AccordionItem value="warranty">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      7. Disclaimer of Warranty
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-2">
                            "As Is" Service
                          </h4>
                          <p className="text-orange-800 text-sm leading-relaxed">
                            ALTech PDF is provided "AS IS" and "AS AVAILABLE"
                            without any warranties of any kind, whether express
                            or implied. We do not guarantee the service will be
                            uninterrupted, error-free, or completely secure.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <h4 className="font-semibold text-red-900 mb-2">
                              No Guarantees
                            </h4>
                            <ul className="text-red-800 text-sm space-y-1">
                              <li>• Continuous availability</li>
                              <li>• Accuracy of processing results</li>
                              <li>• Data integrity or security</li>
                              <li>• Compatibility with all devices</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2">
                              User Precautions
                            </h4>
                            <ul className="text-yellow-800 text-sm space-y-1">
                              <li>• Always backup important files</li>
                              <li>• Verify processed document quality</li>
                              <li>• Test features before critical use</li>
                              <li>• Report bugs or issues promptly</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Limitation of Liability */}
              <AccordionItem value="liability">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Scale className="h-5 w-5 text-red-600" />
                      8. Limitation of Liability
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                          <h4 className="font-semibold text-red-900 mb-2">
                            Liability Limits
                          </h4>
                          <p className="text-red-800 text-sm leading-relaxed">
                            The creator and operator of ALTech PDF shall not be
                            liable for any direct, indirect, incidental,
                            consequential, or punitive damages arising from your
                            use or inability to use the service, including but
                            not limited to data loss, file corruption, or
                            business interruption.
                          </p>
                        </div>

                        <div className="grid gap-4">
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <h4 className="font-semibold text-yellow-900 mb-2">
                              Maximum Liability
                            </h4>
                            <p className="text-yellow-800 text-sm">
                              In no event shall our total liability exceed the
                              amount you paid for the service in the 12 months
                              preceding the claim. For free users, this limit is
                              $0.
                            </p>
                          </div>

                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Exceptions
                            </h4>
                            <p className="text-blue-800 text-sm">
                              These limitations do not apply to liability for
                              gross negligence, willful misconduct, or
                              violations of applicable law where such
                              limitations are prohibited.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Changes to Terms */}
              <AccordionItem value="changes">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <RefreshCw className="h-5 w-5 text-green-600" />
                      9. Changes to Terms
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                          <h4 className="font-semibold text-green-900 mb-2">
                            Update Policy
                          </h4>
                          <p className="text-green-800 text-sm">
                            We reserve the right to modify these Terms of
                            Service at any time to reflect changes in our
                            service, legal requirements, or business practices.
                          </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Notification Methods
                            </h4>
                            <ul className="text-blue-800 text-sm space-y-1">
                              <li>• Homepage banner for major changes</li>
                              <li>• Email notification to registered users</li>
                              <li>• In-app notification popup</li>
                              <li>• Updated "Last modified" date</li>
                            </ul>
                          </div>

                          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                            <h4 className="font-semibold text-purple-900 mb-2">
                              Your Options
                            </h4>
                            <ul className="text-purple-800 text-sm space-y-1">
                              <li>• Review changes before accepting</li>
                              <li>• Continue using = acceptance</li>
                              <li>• Disagree = discontinue use</li>
                              <li>• Download your data anytime</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>

              {/* Contact */}
              <AccordionItem value="contact">
                <Card>
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <CardTitle className="flex items-center gap-2 text-left">
                      <Mail className="h-5 w-5 text-blue-600" />
                      10. Contact Information
                    </CardTitle>
                  </AccordionTrigger>
                  <AccordionContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <h4 className="font-semibold text-blue-900 mb-2">
                            Get Support
                          </h4>
                          <p className="text-blue-800 text-sm mb-3">
                            For questions about these Terms of Service,
                            technical support, or general inquiries:
                          </p>
                          <div className="flex items-center gap-2 p-3 bg-white rounded border border-blue-200">
                            <Mail className="h-4 w-4 text-blue-600" />
                            <code className="text-sm text-blue-900">
                              support@altechpdf.com
                            </code>
                          </div>
                        </div>

                        <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Response Expectations
                          </h4>
                          <p className="text-orange-800 text-sm">
                            As an independent project, response times may vary.
                            We aim to respond within 48-72 hours for non-urgent
                            matters. For urgent issues affecting service
                            availability, we strive for faster response times.
                          </p>
                        </div>

                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                          <h4 className="font-semibold text-slate-900 mb-2">
                            Legal Notices
                          </h4>
                          <p className="text-slate-700 text-sm">
                            These Terms of Service constitute the entire
                            agreement between you and ALTech PDF. Any disputes
                            shall be resolved through good faith negotiation or
                            applicable legal channels in the jurisdiction where
                            the service is operated.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            </Accordion>

            {/* Acceptance Statement */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-900 mb-2">
                      Agreement Acceptance
                    </h3>
                    <p className="text-green-800 text-sm leading-relaxed">
                      By using ALTech PDF, you acknowledge that you have read,
                      understood, and agree to be bound by these Terms of
                      Service. Your continued use of the platform constitutes
                      ongoing acceptance of these terms and any future
                      modifications.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-green-200">
                    <p className="text-xs text-green-700">
                      <strong>Effective Date:</strong> December 2024 •{" "}
                      <strong>Version:</strong> 1.0 • <strong>Status:</strong>{" "}
                      Active
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
