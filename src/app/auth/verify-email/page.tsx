"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw, CheckCircle, ExternalLink } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);

    try {
      // TODO: Call your API to resend the verification email
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to resend email:", error);
    } finally {
      setResendLoading(false);
    }
  };

  const openEmailProvider = () => {
    if (email) {
      const domain = email.split("@")[1];
      const emailProviders: { [key: string]: string } = {
        "gmail.com": "https://mail.google.com",
        "yahoo.com": "https://mail.yahoo.com",
        "outlook.com": "https://outlook.live.com",
        "hotmail.com": "https://outlook.live.com",
        "icloud.com": "https://www.icloud.com/mail",
      };

      const providerUrl = emailProviders[domain] || "mailto:";
      window.open(providerUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-full">
                <Mail className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Check Your Email
              </CardTitle>
              <CardDescription className="text-base mt-2">
                We've sent you a verification link
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email display */}
            <div className="text-center py-3 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                We sent a verification email to:
              </p>
              <p className="text-base font-semibold text-blue-600 dark:text-blue-400 break-all">
                {email || "your email address"}
              </p>
            </div>

            {/* Simple instructions */}
            <div className="text-center text-gray-600 dark:text-gray-400 space-y-2">
              <p>Click the verification link in your email to continue.</p>
              <p className="text-sm">
                (Don't forget to check your spam folder)
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {email && (
                <Button
                  onClick={openEmailProvider}
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Email Inbox
                </Button>
              )}

              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={resendLoading || resendSuccess}
              >
                {resendLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : resendSuccess ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Email Sent!
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Email
                  </>
                )}
              </Button>
            </div>

            {/* Bottom links */}
            <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t space-y-2">
              <button
                onClick={() => router.push("/auth/signin")}
                className="text-green-600 hover:underline block w-full"
              >
                Already verified? Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
