import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { triggerGoogleAuth, triggerGithubAuth } from "../../services/oauth.service";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile: "",
    country_code: "+91",
    college: "",
    university: "",
    user_type: "student",
    referral_code_used: "YASH2026",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleOAuthLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = () => {
    const len = formData.password.length;
    if (len === 0) return 0;
    if (len < 6) return 1;
    if (len < 10) return 2;
    if (/[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password)) return 4;
    return 3;
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const fullMobile = `${formData.country_code} ${formData.mobile}`.trim();
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: fullMobile,
        college: formData.college,
        university: formData.university,
        user_type: formData.user_type,
        referral_code_used: formData.referral_code_used,
      };

      const res = await register(payload);
      if (res.success) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        setError(res.message || "Registration failed.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please verify your information.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen selection:bg-surface-variant selection:text-on-surface">
      {/* Minimal Utility Header Anchor */}
      <header className="w-full h-14 px-gutter border-b border-outline-variant bg-surface-container-lowest flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-7 h-7 bg-primary text-on-primary flex items-center justify-center rounded font-headline-sm text-headline-sm font-bold tracking-tight">
            M
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-headline-md font-headline-md font-semibold text-on-surface tracking-tight">DevMatrix</span>
            <span className="text-label-sm font-label-sm text-on-surface-variant">Client Portal</span>
          </div>
        </Link>
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-5 text-label-md font-label-md">
            <Link to="/#how-it-works" className="text-on-surface-variant hover:text-on-surface transition-colors duration-150">Docs</Link>
            <Link to="/#faq" className="text-on-surface-variant hover:text-on-surface transition-colors duration-150">Support</Link>
            <div className="text-on-surface-variant flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              API Status
            </div>
          </nav>
          <div className="h-4 w-px bg-outline-variant hidden md:block"></div>
          <div className="flex items-center space-x-2 text-label-md font-label-md">
            <span className="text-on-surface-variant">Having issues?</span>
            <a className="text-primary font-medium underline underline-offset-4 hover:text-on-surface transition-colors" href="mailto:support@devmatrix.com">Contact Ops</a>
          </div>
        </div>
      </header>

      {/* Main Split Canvas */}
      <main className="w-full max-w-[1440px] mx-auto min-h-[calc(100vh-3.5rem)] px-gutter py-space-lg lg:py-space-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start">
          {/* Left Column: Platform Value & Trust Architecture */}
          <section className="lg:col-span-5 flex flex-col justify-between space-y-space-lg lg:sticky lg:top-20">
            <div>
              {/* Platform Micro Header */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-container border border-outline-variant mb-space-md">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span className="text-label-sm font-label-sm text-on-surface-variant">Executive Engineering &amp; Milestone Delivery Platform</span>
              </div>

              {/* Hero Value Statement */}
              <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight mb-space-sm text-balance">
                Turn software specifications into verified, production-ready deliverables.
              </h1>
              <p className="text-body-md font-body-md text-on-surface-variant mb-space-lg">
                DevMatrix replaces standard agency ambiguity with deterministic staging environments, milestone escrows, and comprehensive technical defense assets.
              </p>

              {/* Trust Features List */}
              <div className="space-y-space-md border-t border-outline-variant pt-space-lg">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]" data-icon="lock">lock</span>
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Milestone Escrow Protection</h2>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                      Funds are held safely and only disbursed after you inspect and approve live staging builds.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]" data-icon="inventory_2">inventory_2</span>
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">6-in-1 Complete Artifact Delivery</h2>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                      Source code, IEEE 830 documentation, presentation decks, architectural reports, and video walkthroughs.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]" data-icon="terminal">terminal</span>
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">Ephemeral Staging Environments</h2>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                      Inspect your application in real-time on dedicated staging sandboxes at every commit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary flex-shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]" data-icon="verified">verified</span>
                  </div>
                  <div>
                    <h2 className="text-headline-sm font-headline-sm text-on-surface">48-Hour Formal SLA Quotation</h2>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">
                      Guaranteed engineering reviews and fixed-scope agreements before a single rupee is committed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Client Quote Card */}
            <div className="mt-space-lg pt-space-md">
              <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm relative">
                <div className="flex items-center gap-1 text-secondary mb-2">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant ml-2">Verified Academic Defense</span>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface italic leading-relaxed mb-space-md">
                  "DevMatrix eliminated all outsourcing uncertainty. The live staging previews and IEEE documentation passed our technical committee defense seamlessly."
                </p>
                <div className="flex items-center gap-3 border-t border-outline-variant pt-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-primary font-headline-sm text-headline-sm font-semibold">
                    YG
                  </div>
                  <div>
                    <p className="text-headline-sm font-headline-sm text-on-surface">admin</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">Final Year B.Tech Computer Engineering</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Footer */}
            <div className="mt-space-md flex flex-wrap items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]" data-icon="shield">shield</span>
                256-bit SSL Encrypted
              </span>
              <span className="text-outline-variant">•</span>
              <span>Zero IP claim by DevMatrix</span>
              <span className="text-outline-variant">•</span>
              <span>Strict Mutual NDA</span>
            </div>
          </section>

          {/* Right Column: Registration Form Card */}
          <section className="lg:col-span-7">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm p-space-md sm:p-space-lg">
              {/* Top Tab Switcher */}
              <div className="flex border-b border-outline-variant mb-space-lg">
                <button
                  type="button"
                  className="pb-2.5 px-4 text-headline-sm font-headline-sm text-primary border-b-2 border-primary -mb-px flex items-center gap-2"
                >
                  <span>Create Account</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                </button>
                <Link
                  to="/login"
                  className="pb-2.5 px-4 text-headline-sm font-headline-sm text-on-surface-variant hover:text-on-surface border-b-2 border-transparent transition-colors -mb-px"
                >
                  Sign In
                </Link>
              </div>

              {/* Header & Subtitle */}
              <div className="mb-space-lg">
                <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Get started with DevMatrix</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  Create your account to submit specifications and track engineering milestones.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded bg-error-container text-error text-body-sm border border-error/30 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">error</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Social Login Fast-Tracks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm mb-space-md">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError("");
                    triggerGoogleAuth({
                      referralCode: formData.referral_code_used,
                      onLoading: setLoading,
                      onSuccess: (data) => {
                        handleOAuthLogin(data.user, data.accessToken);
                        if (data.user.role === "admin") navigate("/admin/dashboard");
                        else navigate("/client/dashboard");
                      },
                      onError: (msg) => setError(msg),
                    });
                  }}
                  className="h-9 px-3 bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface text-headline-sm font-headline-sm rounded flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setError("");
                    triggerGithubAuth({
                      referralCode: formData.referral_code_used,
                      onLoading: setLoading,
                      onError: (msg) => setError(msg),
                    });
                  }}
                  className="h-9 px-3 bg-surface-container-lowest border border-outline-variant hover:border-outline text-on-surface text-headline-sm font-headline-sm rounded flex items-center justify-center gap-2 transition-colors duration-150 disabled:opacity-50"
                >
                  <svg className="w-4 h-4 fill-current text-on-surface" viewBox="0 0 24 24">
                    <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Subtle Divider */}
              <div className="relative my-space-md">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-label-sm font-label-sm">
                  <span className="bg-surface-container-lowest px-3 text-on-surface-variant">or continue with institutional / student email</span>
                </div>
              </div>

              {/* Form Fields */}
              <form className="space-y-space-md" onSubmit={handleSubmit}>
                {/* Account Type Segmented Selector */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1.5">Account Role &amp; Classification</label>
                  <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container rounded border border-outline-variant">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: "student" })}
                      className={`py-1.5 px-2 text-center text-label-md font-label-md rounded transition-colors ${
                        formData.user_type === "student"
                          ? "bg-surface-container-lowest text-primary shadow-sm font-medium border border-outline-variant"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: "academic" })}
                      className={`py-1.5 px-2 text-center text-label-md font-label-md rounded transition-colors ${
                        formData.user_type === "academic"
                          ? "bg-surface-container-lowest text-primary shadow-sm font-medium border border-outline-variant"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Academic / Faculty
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, user_type: "enterprise" })}
                      className={`py-1.5 px-2 text-center text-label-md font-label-md rounded transition-colors ${
                        formData.user_type === "enterprise"
                          ? "bg-surface-container-lowest text-primary shadow-sm font-medium border border-outline-variant"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Enterprise / Startup
                    </button>
                  </div>
                </div>

                {/* Full Name & Work Email Split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface mb-1" htmlFor="full-name">Full Name *</label>
                    <input
                      id="full-name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Yash Gaikwad"
                      className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface mb-1" htmlFor="work-email">Institutional / Work Email *</label>
                    <input
                      id="work-email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                    />
                  </div>
                </div>

                {/* College / University */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface mb-1" htmlFor="college">College / Institute</label>
                    <input
                      id="college"
                      name="college"
                      type="text"
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="Enter your college name"
                      className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md font-label-md text-on-surface mb-1" htmlFor="university">University Board</label>
                    <input
                      id="university"
                      name="university"
                      type="text"
                      value={formData.university}
                      onChange={handleChange}
                      placeholder="Enter your university name"
                      className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                    />
                  </div>
                </div>

                {/* Mobile Number with Country Code */}
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1" htmlFor="mobile-phone">Mobile Number (Milestone SMS Alerts) *</label>
                  <div className="flex">
                    <div className="relative flex-shrink-0">
                      <select
                        name="country_code"
                        value={formData.country_code}
                        onChange={handleChange}
                        className="h-9 pl-3 pr-7 bg-surface-container border border-r-0 border-outline-variant rounded-l text-label-md font-label-md text-on-surface focus:ring-0 focus:border-outline appearance-none"
                      >
                        <option value="+91">IN (+91)</option>
                        <option value="+1">US (+1)</option>
                        <option value="+44">UK (+44)</option>
                        <option value="+65">SG (+65)</option>
                      </select>
                      <span className="material-symbols-outlined pointer-events-none absolute right-1.5 top-2.5 text-[16px] text-on-surface-variant" data-icon="expand_more">expand_more</span>
                    </div>
                    <input
                      id="mobile-phone"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="Enter 10 digit mobile no."
                      className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded-r focus:border-primary focus:ring-0 text-on-surface"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-label-md font-label-md text-on-surface" htmlFor="password">Password *</label>
                    <span className="text-label-sm font-label-sm text-secondary flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-[13px]" data-icon="check_circle">check_circle</span>
                      {strength >= 3 ? "Strong password" : "Min 8 chars"}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••••••"
                      className="w-full h-9 px-3 pr-10 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-2 text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Toggle visibility"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? "visibility_off" : "visibility"}
                      </span>
                    </button>
                  </div>
                  {/* Strength Bar */}
                  <div className="grid grid-cols-4 gap-1.5 mt-2">
                    <div className={`h-1 rounded-full ${strength >= 1 ? "bg-secondary" : "bg-outline-variant"}`}></div>
                    <div className={`h-1 rounded-full ${strength >= 2 ? "bg-secondary" : "bg-outline-variant"}`}></div>
                    <div className={`h-1 rounded-full ${strength >= 3 ? "bg-secondary" : "bg-outline-variant"}`}></div>
                    <div className={`h-1 rounded-full ${strength >= 4 ? "bg-secondary" : "bg-outline-variant"}`}></div>
                  </div>
                </div>

                {/* Referral Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-label-md font-label-md text-on-surface" htmlFor="referral-code">Referral Code (Optional)</label>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold">
                      <span className="material-symbols-outlined text-[12px]" data-icon="check">check</span>
                      10-15% Milestone Discount Applied ✓
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      id="referral-code"
                      name="referral_code_used"
                      type="text"
                      value={formData.referral_code_used}
                      onChange={handleChange}
                      className="w-full h-9 px-3 font-code-sm text-code-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface tracking-wider"
                    />
                    <span className="absolute right-3 top-2 text-label-sm font-label-sm text-secondary font-mono">PROMO APPLIED</span>
                  </div>
                </div>

                {/* Terms & Escrow Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input defaultChecked className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-0 cursor-pointer" type="checkbox" required />
                    <span className="text-body-sm font-body-sm text-on-surface-variant leading-tight">
                      I agree to the <span className="text-on-surface underline underline-offset-2">Terms of Service</span>, <span className="text-on-surface underline underline-offset-2">Milestone Escrow Agreement</span>, and <span className="text-on-surface underline underline-offset-2">Mutual IP Protection Policy</span>.
                    </span>
                  </label>
                </div>

                {/* Primary Submission CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-primary hover:bg-[#1E293B] text-on-primary rounded font-headline-sm text-headline-sm font-medium transition-colors duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <span>{loading ? "Creating Account..." : "Create Account & Verify OTP"}</span>
                  <span className="material-symbols-outlined text-[16px]" data-icon="arrow_forward">arrow_forward</span>
                </button>

                {/* Bottom Redirect Link */}
                <div className="text-center pt-2">
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium underline underline-offset-4 hover:text-on-surface transition-colors">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* Global Legal & Compliance Micro Strip */}
      <footer className="w-full border-t border-outline-variant bg-surface-container-lowest py-3 px-gutter mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between text-label-sm font-label-sm text-on-surface-variant gap-2">
          <div className="flex items-center space-x-4">
            <span>© {new Date().getFullYear()} DevMatrix Engineering Inc.</span>
            <span>ISO/IEC 27001 Certified Processes</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Security Whitepaper</span>
            <span>IEEE 830 Compliance Standard</span>
            <span>Client Escrow Trust Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
