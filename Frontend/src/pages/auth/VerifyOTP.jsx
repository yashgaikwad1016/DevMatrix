import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function VerifyOTP() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const qEmail = searchParams.get("email");
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await verifyEmail(email, otp);
      if (res.success) {
        setMessage("Email verified successfully! Initializing client workspace...");
        setTimeout(() => {
          navigate("/client/dashboard");
        }, 1200);
      } else {
        setError(res.message || "Invalid OTP code.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Please provide your email address to resend OTP.");
      return;
    }
    setError("");
    setMessage("");
    setResending(true);

    try {
      const res = await resendOTP(email);
      if (res.success) {
        setMessage("A fresh verification code has been dispatched to your email.");
      } else {
        setError(res.message || "Failed to resend code.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend OTP.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen selection:bg-surface-variant selection:text-on-surface flex flex-col">
      {/* Header */}
      <header className="w-full h-14 px-gutter border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-primary text-on-primary flex items-center justify-center rounded font-headline-sm text-headline-sm font-bold tracking-tight">
            M
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-headline-md font-headline-md font-semibold text-on-surface tracking-tight">DevMatrix</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Identity Verification</span>
          </div>
        </Link>
        <Link to="/login" className="text-label-md font-label-md text-on-surface-variant hover:text-on-surface">
          Back to Login
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md sm:p-space-lg shadow-sm">
          {/* Header Icon & Title */}
          <div className="text-center mb-space-lg">
            <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-2xl">mark_email_read</span>
            </div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
              Verify Your Email
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Enter the 6-digit code sent to <strong className="text-on-surface font-mono">{email || "your email"}</strong>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded bg-error-container text-error text-body-sm border border-error/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded bg-secondary-container text-on-secondary-container text-body-sm border border-secondary/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{message}</span>
            </div>
          )}

          <form className="space-y-space-md" onSubmit={handleSubmit}>
            {!searchParams.get("email") && (
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                />
              </div>
            )}

            <div>
              <label className="block text-label-md font-label-md text-on-surface mb-1 text-center">
                6-Digit Security Token
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full h-12 text-center font-code-sm text-2xl tracking-[0.5em] font-bold bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full h-10 bg-primary hover:bg-[#1E293B] text-on-primary rounded font-headline-sm text-headline-sm font-medium transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? "Verifying Token..." : "Verify & Unlock Portal"}</span>
              <span className="material-symbols-outlined text-[16px]" data-icon="arrow_forward">arrow_forward</span>
            </button>
          </form>

          {/* Resend Action */}
          <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center justify-between text-label-sm font-label-sm">
            <span className="text-on-surface-variant">Didn't receive the OTP?</span>
            <button
              type="button"
              disabled={resending}
              onClick={handleResend}
              className="font-medium text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-sm ${resending ? "animate-spin" : ""}`}>refresh</span>
              <span>{resending ? "Sending..." : "Resend Code"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
