import api from "./api";

// Fallback to environment variables if available
let cachedConfig = {
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  githubClientId: import.meta.env.VITE_GITHUB_CLIENT_ID || "",
};

export async function fetchOAuthConfig() {
  if (cachedConfig.googleClientId && cachedConfig.githubClientId) {
    return cachedConfig;
  }
  try {
    const res = await api.get("/api/auth/oauth-config");
    if (res.data?.success) {
      cachedConfig = {
        googleClientId: res.data.googleClientId || cachedConfig.googleClientId,
        githubClientId: res.data.githubClientId || cachedConfig.githubClientId,
      };
    }
  } catch (err) {
    console.warn("Could not fetch remote OAuth config, using env fallback:", err.message);
  }
  return cachedConfig;
}

/**
 * Trigger Google OAuth Sign In / Sign Up
 */
export async function triggerGoogleAuth({ referralCode, onSuccess, onError, onLoading }) {
  try {
    const config = await fetchOAuthConfig();
    const googleClientId = config.googleClientId;

    if (!googleClientId) {
      throw new Error("Google Client ID is not configured.");
    }

    // Try Google Identity Services (GIS) token client popup first
    if (window.google?.accounts?.oauth2) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: "email profile openid",
        callback: async (response) => {
          if (response.error) {
            onLoading?.(false);
            onError?.(response.error_description || response.error || "Google authorization cancelled.");
            return;
          }
          try {
            onLoading?.(true);
            const res = await api.post("/api/auth/google", {
              token: response.access_token,
              referral_code_used: referralCode || undefined,
            });
            if (res.data?.success) {
              onSuccess?.(res.data);
            } else {
              onError?.(res.data?.message || "Google authentication failed.");
            }
          } catch (err) {
            onError?.(err.response?.data?.message || err.message || "Google authentication failed.");
          } finally {
            onLoading?.(false);
          }
        },
      });
      tokenClient.requestAccessToken({ prompt: "consent" });
      return;
    }

    // Fallback: Full redirect flow
    onLoading?.(true);
    sessionStorage.setItem("devmatrix_oauth_provider", "google");
    if (referralCode) {
      sessionStorage.setItem("devmatrix_referral_code", referralCode);
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=openid%20email%20profile&prompt=select_account`;

    window.location.href = googleAuthUrl;
  } catch (error) {
    onLoading?.(false);
    onError?.(error.message || "Failed to start Google authentication.");
  }
}

/**
 * Trigger GitHub OAuth Sign In / Sign Up
 */
export async function triggerGithubAuth({ referralCode, onError, onLoading }) {
  try {
    const config = await fetchOAuthConfig();
    const githubClientId = config.githubClientId;

    if (!githubClientId) {
      throw new Error("GitHub Client ID is not configured.");
    }

    onLoading?.(true);
    sessionStorage.setItem("devmatrix_oauth_provider", "github");
    if (referralCode) {
      sessionStorage.setItem("devmatrix_referral_code", referralCode);
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(
      githubClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    window.location.href = githubAuthUrl;
  } catch (error) {
    onLoading?.(false);
    onError?.(error.message || "Failed to start GitHub authentication.");
  }
}

export default {
  fetchOAuthConfig,
  triggerGoogleAuth,
  triggerGithubAuth,
};
