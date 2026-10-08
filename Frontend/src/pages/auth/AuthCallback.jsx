import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleOAuthLogin } = useAuth();
  const [statusMessage, setStatusMessage] = useState("Authenticating and setting up account...");
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const error = searchParams.get("error");
        const errorDesc = searchParams.get("error_description");
        if (error) {
          throw new Error(errorDesc || error || "OAuth provider rejected authorization.");
        }

        const code = searchParams.get("code");
        const provider = sessionStorage.getItem("devmatrix_oauth_provider");
        const referralCode = sessionStorage.getItem("devmatrix_referral_code");

        // Check hash for Google token flow (#access_token=...)
        const hash = window.location.hash ? window.location.hash.substring(1) : "";
        const hashParams = new URLSearchParams(hash);
        const googleAccessToken = hashParams.get("access_token");

        let response = null;

        if (googleAccessToken || provider === "google") {
          setStatusMessage("Verifying Google account with DevMatrix...");
          response = await api.post("/api/auth/google", {
            token: googleAccessToken || undefined,
            code: code || undefined,
            redirect_uri: `${window.location.origin}/auth/callback`,
            referral_code_used: referralCode || undefined,
          });
        } else if (code) {
          setStatusMessage("Connecting GitHub profile and credentials...");
          response = await api.post("/api/auth/github", {
            code,
            referral_code_used: referralCode || undefined,
          });
        } else {
          throw new Error("No authorization code or token found in callback URL.");
        }

        if (response?.data?.success && response?.data?.user) {
          // Clear session storage markers
          sessionStorage.removeItem("devmatrix_oauth_provider");
          sessionStorage.removeItem("devmatrix_referral_code");

          setStatusMessage("Authentication verified! Launching your workspace...");
          handleOAuthLogin(response.data.user, response.data.accessToken);

          setTimeout(() => {
            if (response.data.user.role === "admin") {
              navigate("/admin/dashboard", { replace: true });
            } else {
              navigate("/client/dashboard", { replace: true });
            }
          }, 600);
        } else {
          throw new Error(response?.data?.message || "OAuth authentication failed.");
        }
      } catch (err) {
        console.error("OAuth Callback Error:", err);
        setErrorMessage(
          err.response?.data?.message || err.message || "Failed to complete authentication."
        );
      }
    };

    processCallback();
  }, [searchParams, navigate, handleOAuthLogin]);

  return (
    <div className="min-h-screen bg-surface-container-lowest flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container border border-outline-variant rounded-xl p-8 shadow-sm text-center">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 rounded bg-surface border border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-xl">terminal</span>
          </div>
          <span className="font-headline font-bold text-lg text-on-surface tracking-tight">DevMatrix</span>
        </div>

        {errorMessage ? (
          <div>
            <div className="w-12 h-12 rounded-full bg-error-container text-error flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-2xl">error_outline</span>
            </div>
            <h3 className="text-headline-sm font-semibold text-on-surface mb-2">Authentication Failed</h3>
            <p className="text-body-sm text-error bg-error/10 border border-error/20 rounded p-3 mb-6">
              {errorMessage}
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full h-10 bg-secondary text-on-secondary rounded font-label-md hover:bg-secondary/90 transition-colors"
              >
                Return to Sign In
              </button>
              <button
                onClick={() => navigate("/register")}
                className="w-full h-10 border border-outline-variant text-on-surface rounded font-label-md hover:bg-surface-container-high transition-colors"
              >
                Create an Account
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-full border-4 border-outline-variant border-t-secondary animate-spin mx-auto mb-4"></div>
            <h3 className="text-headline-sm font-semibold text-on-surface mb-2">Connecting to DevMatrix</h3>
            <p className="text-body-sm text-on-surface-variant mb-4">{statusMessage}</p>
            <div className="text-label-sm text-slate-400 font-mono text-xs">
              Synchronizing with MySQL &amp; MongoDB cluster...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
