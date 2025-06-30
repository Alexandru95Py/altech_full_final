import { Sidebar } from "@/components/dashboard/Sidebar";
import { Header } from "@/components/dashboard/Header";
import { Footer } from "@/components/dashboard/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Mail,
  FileText,
  Lock,
  Cookie,
  UserCheck,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Privacy Policy
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
            </div>
          </div>

          <div className="max-w-4xl space-y-8">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-slate max-w-none">
                <p className="text-slate-700 leading-relaxed">
                  ALTech PDF is an independent project focused on providing
                  powerful and user-friendly PDF editing tools. Developed by an
                  independent creator, this platform is currently in beta and
                  not affiliated with any registered company or legal entity.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Your privacy is extremely important to us. This Privacy Policy
                  explains how we collect, use, and protect your personal
                  information when you use our services. We are committed to
                  maintaining the highest standards of privacy protection and
                  transparency.
                </p>
              </CardContent>
            </Card>

            {/* What We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  What We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Email Address
                    </h4>
                    <p className="text-slate-700 text-sm">
                      Required for account registration, login authentication,
                      and sending verification codes or important notifications
                      (only if you opt-in).
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Uploaded Documents
                    </h4>
                    <p className="text-slate-700 text-sm">
                      Files you upload for processing are stored temporarily on
                      our servers. These files are only accessible to your
                      account and are automatically deleted unless you choose to
                      save them in "My Files".
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Basic Usage Data
                    </h4>
                    <p className="text-slate-700 text-sm">
                      We collect anonymous usage analytics including page
                      interactions, tool usage frequency, and feature adoption
                      to help improve the platform. This data does not include
                      personal information.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use the Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-purple-600" />
                  How We Use Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-slate-900">
                        Core Functionality:
                      </strong>
                      <span className="text-slate-700 ml-1">
                        To provide PDF editing, processing, file storage, and
                        all platform features.
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-slate-900">Communication:</strong>
                      <span className="text-slate-700 ml-1">
                        To send login verification codes, security alerts, and
                        platform updates (only if you've opted in).
                      </span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong className="text-slate-900">
                        Platform Improvement:
                      </strong>
                      <span className="text-slate-700 ml-1">
                        To analyze usage patterns and improve user experience
                        through feature updates and optimizations.
                      </span>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Data Retention
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Uploaded Files
                    </h4>
                    <p className="text-orange-800 text-sm">
                      Files are stored temporarily for processing purposes only.
                      Unless you explicitly save them to "My Files", they are
                      automatically deleted within 72 hours of upload.
                    </p>
                  </div>

                  <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Account Data
                    </h4>
                    <p className="text-blue-800 text-sm">
                      Your email and account preferences are retained as long as
                      your account remains active. You can request permanent
                      deletion of all your data at any time.
                    </p>
                  </div>

                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Your Control
                    </h4>
                    <p className="text-green-800 text-sm">
                      You have complete control over your data. You can delete
                      individual files, clear all data, or permanently delete
                      your account through your profile settings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Security Measures
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Password Protection
                    </h4>
                    <p className="text-slate-700 text-sm">
                      All passwords are securely hashed using industry-standard
                      encryption before storage.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      File Access Control
                    </h4>
                    <p className="text-slate-700 text-sm">
                      Your files are private and accessible only to your
                      account. No third parties can access your documents.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      No Third-Party Tracking
                    </h4>
                    <p className="text-slate-700 text-sm">
                      We do not use third-party analytics or tracking services
                      that could compromise your privacy.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      SSL Encryption
                    </h4>
                    <p className="text-slate-700 text-sm">
                      All data transmission is protected with 256-bit SSL
                      encryption for maximum security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-yellow-600" />
                  Cookie Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <h4 className="font-semibold text-green-900 mb-2">
                      Essential Cookies
                    </h4>
                    <p className="text-green-800 text-sm">
                      We use session cookies to maintain your login state and
                      provide basic functionality. These cookies are essential
                      for the platform to work properly.
                    </p>
                  </div>

                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <h4 className="font-semibold text-red-900 mb-2">
                      No Advertising Cookies
                    </h4>
                    <p className="text-red-800 text-sm">
                      We do not use any third-party advertising cookies or
                      tracking cookies that could be used for profiling or
                      targeted advertising.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  Your Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Data Access & Portability
                      </h4>
                      <p className="text-blue-800 text-sm mt-1">
                        You can download all your data at any time through your
                        profile settings.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-900">
                        Account Deletion
                      </h4>
                      <p className="text-green-800 text-sm mt-1">
                        You can permanently delete your account and all
                        associated data instantly from your profile.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-900">
                        Privacy Support
                      </h4>
                      <p className="text-purple-800 text-sm mt-1">
                        Contact us for any privacy-related questions or
                        concerns. We respond within 24 hours.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Beta Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertCircle className="h-5 w-5" />
                  Contact & Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-2">
                      Get in Touch
                    </h4>
                    <p className="text-orange-800 text-sm mb-2">
                      For any questions, concerns, or privacy-related requests,
                      please contact us at:
                    </p>
                    <div className="flex items-center gap-2 p-3 bg-white rounded border border-orange-200">
                      <Mail className="h-4 w-4 text-orange-600" />
                      <code className="text-sm text-orange-900">
                        support@altechpdf.com
                      </code>
                    </div>
                  </div>

                  <Separator className="bg-orange-200" />

                  <div className="p-4 bg-orange-100 rounded-lg border border-orange-300">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Beta Project Disclaimer
                    </h4>
                    <p className="text-orange-800 text-sm leading-relaxed">
                      <strong>Important:</strong> ALTech PDF is currently in
                      beta development and is created by an independent
                      developer. This project is not affiliated with any
                      registered company or legal entity. While we take privacy
                      seriously and implement best practices, please be aware
                      that this is a developing platform. We encourage users to
                      avoid uploading highly sensitive documents during the beta
                      phase.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <div className="text-center pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500">
                This Privacy Policy was last updated on{" "}
                <strong>December 2024</strong>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                We will notify users of any significant changes via email or
                platform notification
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
