import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Shield,
  Lock,
  Clock,
  CheckCircle2,
  MapPin,
  Eye,
  ArrowLeft,
  Mail,
  Server,
  UserCheck,
  Globe,
  AlertTriangle,
} from "lucide-react";

export default function SecurityPrivacy() {
  const navigate = useNavigate();

  const securityFeatures = [
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "File Protection",
      description: "All uploaded PDFs are encrypted during processing",
      details: [
        "End-to-end encryption using industry-standard AES-256",
        "Files are never shared, inspected, or viewed by humans",
        "Secure transmission protocols (HTTPS/TLS 1.3)",
        "Zero-knowledge processing architecture",
      ],
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: "Auto-Deletion Policy",
      description:
        "Uploaded and processed files are automatically deleted from our servers after 72 hours",
      details: [
        "Automatic deletion after 72 hours guaranteed",
        "Users can manually delete files earlier via 'My Files'",
        "Secure deletion using military-grade wiping",
        "No backup copies retained after deletion",
      ],
    },
    {
      icon: <UserCheck className="h-8 w-8 text-purple-600" />,
      title: "Secure Authentication",
      description:
        "User access is protected with secure login and token-based authentication",
      details: [
        "Multi-factor authentication (MFA) support",
        "Passwords are never stored in plaintext",
        "JWT tokens with automatic expiration",
        "Account lockout protection against brute force",
      ],
    },
    {
      icon: <MapPin className="h-8 w-8 text-orange-600" />,
      title: "Hosted in the EU",
      description:
        "Servers are GDPR-compliant and hosted within the European Union",
      details: [
        "Full GDPR compliance and data protection",
        "Data residency within EU boundaries",
        "Regular compliance audits and certifications",
        "Right to data portability and deletion",
      ],
    },
    {
      icon: <Eye className="h-8 w-8 text-red-600" />,
      title: "No Tracking / Ads",
      description: "ALTech PDF does not track users or sell data",
      details: [
        "No advertising or tracking cookies",
        "No third-party analytics scripts",
        "No personal data sold to advertisers",
        "Privacy-first business model",
      ],
    },
  ];

  const complianceStandards = [
    { name: "GDPR", description: "General Data Protection Regulation" },
    { name: "ISO 27001", description: "Information Security Management" },
    { name: "SOC 2", description: "Security, Availability & Confidentiality" },
    { name: "CCPA", description: "California Consumer Privacy Act" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <Header />

      <main className="ml-60 pt-16 min-h-screen">
        <div className="px-8 py-6">
          <div className="w-full">
            {/* Back Navigation */}
            <Button
              variant="ghost"
              onClick={() => navigate("/tools")}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>

            {/* Header Section */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Shield className="h-16 w-16 text-blue-600" />
                  <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-4">
                Your Privacy, Our Priority
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                User trust is the foundation of ALTech PDF. We are committed to
                protecting your data and ensuring complete transparency in how
                we handle your files.
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  100% Secure
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  <Globe className="h-3 w-3 mr-1" />
                  GDPR Compliant
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  <Server className="h-3 w-3 mr-1" />
                  EU Hosted
                </Badge>
              </div>
            </div>

            {/* Core Security Features */}
            <div className="space-y-8 mb-12">
              <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
                How We Protect Your Data
              </h2>

              {securityFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-slate-600 mb-4 text-lg">
                          {feature.description}
                        </p>
                        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-4">
                          {feature.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Compliance Standards */}
            <Card className="mb-12">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    Compliance & Certifications
                  </h3>
                  <p className="text-slate-600">
                    We maintain the highest industry standards for data
                    protection and security
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                  {complianceStandards.map((standard, index) => (
                    <div key={index} className="text-center">
                      <div className="bg-slate-100 rounded-lg p-4 mb-3 hover:bg-slate-200 transition-colors">
                        <div className="text-lg font-bold text-slate-900">
                          {standard.name}
                        </div>
                      </div>
                      <p className="text-sm text-slate-600">
                        {standard.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Data Rights Section */}
            <Card className="mb-12 border-blue-200 bg-blue-50">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-900 mb-3">
                      Your Data Rights
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 text-sm text-blue-800">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Right to access your data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Right to data portability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Right to deletion (Right to be forgotten)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Right to rectification</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card className="mb-12 border-orange-200 bg-orange-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">
                      Important Security Reminder
                    </h4>
                    <p className="text-sm text-orange-800">
                      For maximum security, we recommend logging out of your
                      account when using shared or public computers. Your files
                      are automatically deleted after 72 hours, but you can
                      remove them manually at any time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Questions About Your Data?
                </h3>
                <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                  Want to learn more about your data protection rights or have
                  specific security questions? Our support team is here to help
                  you understand how we protect your privacy.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    variant="secondary"
                    className="bg-white text-slate-900 hover:bg-slate-100"
                    onClick={() => {
                      // This would typically open a support modal or contact form
                      window.location.href = "mailto:privacy@altechpdf.com";
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Privacy Team
                  </Button>
                  <Button
                    variant="outline"
                    className="border-slate-400 text-slate-100 hover:bg-slate-700"
                    onClick={() => navigate("/privacy")}
                  >
                    Read Full Privacy Policy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center mt-8 text-sm text-slate-500">
              <p>This page was last updated on December 2024</p>
              <p>Version 2.1 • Next review: March 2024</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
