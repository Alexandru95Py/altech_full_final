import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { djangoAPI } from "@/lib/api";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Try to get email from query param
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, []);

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await djangoAPI.verifyEmailCode(email, code);
      if (response.success) {
        toast.success("Email verified! You can now log in.");
        navigate("/auth");
      } else {
        toast.error(response.message || "Verification failed.");
      }
    } catch (error) {
      toast.error("Verification failed. Please check your code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="mb-4 text-slate-600">Enter the 6-digit code sent to your email address.</p>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="6-digit code"
          value={code}
          onChange={e => setCode(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />
        <button
          onClick={handleVerify}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </button>
      </div>
    </div>
  );
}
