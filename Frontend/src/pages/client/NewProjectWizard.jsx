import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function NewProjectWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Wizard State
  const [formData, setFormData] = useState({
    // Step 1: Domain
    project_name: "",
    short_description: "",
    domain: "Biomedical & Clinical AI",

    // Step 2: Project Type
    project_type: "Full Stack Web Application",
    priority: "normal",

    // Step 3: Tech Stack
    frontend_tech: "Next.js 14 / React",
    backend_tech: "FastAPI / Python",
    database_tech: "PostgreSQL",
    client_wants_tech_recommendation: false,

    // Step 4: Design & Aesthetics
    color_palette: "Obsidian & Emerald (Dark)",
    primary_color: "#1b1b1e",
    accent_color: "#1f6c3a",
    font_family: "Inter & JetBrains Mono",
    theme_mode: "Dark Engineering",

    // Step 5: AI Capabilities
    ai_feature: "RAG & LLM Assistant (LangChain)",
    ai_details: "",

    // Step 6: Deliverables
    include_source_code: true,
    include_ieee_srs: true,
    include_presentation_ppt: true,
    include_demo_video: true,
    include_database_dump: true,

    // Step 7: Deadline
    deadline: "",

    // Step 8: Custom Notes
    additional_notes: "",
  });

  const domains = [
    { title: "Healthcare & Clinical AI", icon: "medical_services", desc: "Diagnostic models, EHR systems, DICOM viewers, HIPAA workflows" },
    { title: "Fintech & Algorithmic Trading", icon: "account_balance", desc: "Payments, fraud detection, ledger architectures, crypto & banking" },
    { title: "E-Commerce & Supply Chain", icon: "shopping_cart", desc: "Multi-tenant storefronts, real-time inventory, recommendation engines" },
    { title: "EdTech & Academic ERP", icon: "school", desc: "LMS platforms, automated grading, proctoring, research repository" },
    { title: "Cybersecurity & Cryptography", icon: "security", desc: "Intrusion detection, zero-trust auth, packet inspection, SIEM dashboards" },
    { title: "IoT & Hardware Cloud", icon: "sensors", desc: "MQTT telemetry, sensor visualization, edge computing, smart automation" },
  ];

  const projectTypes = [
    { title: "Full Stack Web Application", icon: "web", desc: "Production-ready web platform with backend APIs & database" },
    { title: "Machine Learning / AI Pipeline", icon: "psychology", desc: "Trained neural models, PyTorch / TensorFlow weights, API endpoints" },
    { title: "Cross-Platform Mobile Application", icon: "phone_android", desc: "Flutter / React Native app with native device integration" },
    { title: "Cloud Native Microservices", icon: "cloud", desc: "Dockerized microservices, Kubernetes manifests, gRPC & Kafka" },
  ];

  const colorPalettes = [
    { name: "Obsidian & Emerald", primary: "#1b1b1e", accent: "#1f6c3a", bg: "#fbf8fc" },
    { name: "Deep Cobalt & Cyan", primary: "#0f172a", accent: "#0284c7", bg: "#f8fafc" },
    { name: "Minimalist Slate", primary: "#18181b", accent: "#71717a", bg: "#ffffff" },
    { name: "Crimson & Carbon", primary: "#1c1917", accent: "#b91c1c", bg: "#fafaf9" },
  ];

  const fontOptions = [
    { name: "Inter & JetBrains Mono", type: "Modern Engineering" },
    { name: "Roboto & Fira Code", type: "Clean Tech" },
    { name: "Outfit & JetBrains Mono", type: "Futuristic SaaS" },
  ];

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleCreateProject = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Create project row
      const projRes = await api.post("/api/projects", {
        project_name: formData.project_name || `${formData.domain} System`,
        short_description: formData.short_description || "Custom engineering project specification",
        domain: formData.domain,
        project_type: formData.project_type,
        priority: formData.priority,
        deadline: formData.deadline || null,
      });

      if (!projRes.data?.success) {
        throw new Error(projRes.data?.message || "Failed to initialize project");
      }

      const newProject = projRes.data.project;

      // 2. Submit formal requirements intake
      const reqPayload = {
        description: formData.short_description || "Full requirement intake specification",
        client_deadline: formData.deadline || null,
        additional_requirements: formData.additional_notes || null,
        client_wants_tech_recommendation: formData.client_wants_tech_recommendation,
        technologies: [
          { category: "frontend", technology_name: formData.frontend_tech },
          { category: "backend", technology_name: formData.backend_tech },
          { category: "database", technology_name: formData.database_tech },
        ],
        design: {
          design_style: "dark",
          font_family: formData.font_family,
          primary_color: formData.primary_color,
          accent_color: formData.accent_color,
          background_color: "#ffffff",
          custom_instructions: `Color Palette: ${formData.color_palette}`,
        },
        ai_features: [
          {
            feature_name: formData.ai_feature,
            description: formData.ai_details || "Automated AI integration module",
            is_required: true,
          },
        ],
      };

      const reqRes = await api.post(`/api/projects/${newProject.id}/requirements`, reqPayload);
      const requirement = reqRes.data?.requirement;

      // 3. Formally submit the requirement for admin review
      if (requirement?.id) {
        try {
          await api.post(`/api/projects/${newProject.id}/requirements/${requirement.id}/submit`);
        } catch (subErr) {
          console.warn("Auto-submit requirement status notice:", subErr);
        }
      }

      // Redirect directly to project workspace
      navigate(`/client/projects/${newProject.id}`);
    } catch (err) {
      console.error("Submission error:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to save project requirements.";
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-space-lg">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
        <div>
          <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant mb-1">
            <span>Projects</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-medium">Requirement Wizard</span>
            <span className="font-code-xs text-code-xs text-on-surface-variant bg-surface-container-highest px-1 rounded">
              Step {currentStep} of 4
            </span>
          </div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
            Specification Intake Wizard
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Define your technical architecture, design tokens, and timeline for formal 48-hour SLA quotation.
          </p>
        </div>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm">
        <div className="grid grid-cols-4 gap-2">
          {[
            { step: 1, title: "1. Scope & Domain", desc: "Topic & classification" },
            { step: 2, title: "2. Tech Stack", desc: "Languages & databases" },
            { step: 3, title: "3. Design & UI", desc: "Palettes & typography" },
            { step: 4, title: "4. Deliverables", desc: "Artifacts & deadline" },
          ].map((item) => (
            <button
              key={item.step}
              type="button"
              onClick={() => setCurrentStep(item.step)}
              className={`p-2.5 rounded-lg text-left transition-colors flex items-center gap-3 ${
                currentStep === item.step
                  ? "bg-surface-container-highest text-primary font-medium border border-primary/20"
                  : currentStep > item.step
                  ? "bg-surface-container-low text-secondary hover:bg-surface-container"
                  : "text-on-surface-variant hover:bg-surface-container-high"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  currentStep > item.step
                    ? "bg-secondary text-white"
                    : currentStep === item.step
                    ? "bg-primary text-white"
                    : "bg-surface-container text-outline"
                }`}
              >
                {currentStep > item.step ? (
                  <span className="material-symbols-outlined text-sm">check</span>
                ) : (
                  item.step
                )}
              </div>
              <div className="min-w-0 hidden sm:block">
                <span className="font-headline-sm text-headline-sm text-on-surface block truncate">{item.title}</span>
                <span className="text-[11px] text-on-surface-variant block truncate">{item.desc}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded bg-error-container text-error text-body-sm border border-error/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form Inputs on Left (8 Cols), Real-time Summary Card on Right (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
          {/* STEP 1: DOMAIN & BASICS */}
          {currentStep === 1 && (
            <div className="space-y-space-md">
              <div>
                <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Project Domain &amp; Classification</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  Select your core engineering field and provide a working project title.
                </p>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">Project Title / Topic Name *</label>
                <input
                  type="text"
                  required
                  value={formData.project_name}
                  onChange={(e) => handleChange("project_name", e.target.value)}
                  placeholder="e.g. HealthAI Multi-Modal Clinical Diagnostics Platform"
                  className="w-full h-10 px-3 text-body-md font-body-md bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1.5">Engineering Domain</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {domains.map((dom) => (
                    <div
                      key={dom.title}
                      onClick={() => handleChange("domain", dom.title)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        formData.domain === dom.title
                          ? "border-primary bg-surface-container-high"
                          : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 mb-1">
                        <span className="material-symbols-outlined text-primary text-lg">{dom.icon}</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{dom.title}</span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant leading-snug">{dom.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">Project Description &amp; Core Problem Statement</label>
                <textarea
                  rows={4}
                  value={formData.short_description}
                  onChange={(e) => handleChange("short_description", e.target.value)}
                  placeholder="Summarize the core workflow, user roles, algorithms required, or specific problem your application solves..."
                  className="w-full p-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                ></textarea>
              </div>
            </div>
          )}

          {/* STEP 2: TECH STACK */}
          {currentStep === 2 && (
            <div className="space-y-space-md">
              <div>
                <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">System Architecture &amp; Tech Stack</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  Specify framework targets or allow DevMatrix architects to recommend optimal toolchains.
                </p>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1.5">Project Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projectTypes.map((pt) => (
                    <div
                      key={pt.title}
                      onClick={() => handleChange("project_type", pt.title)}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        formData.project_type === pt.title
                          ? "border-primary bg-surface-container-high"
                          : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="material-symbols-outlined text-primary text-lg">{pt.icon}</span>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{pt.title}</span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant leading-snug">{pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Frontend / Client</label>
                  <select
                    value={formData.frontend_tech}
                    onChange={(e) => handleChange("frontend_tech", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option>Next.js 14 / React</option>
                    <option>React + Vite</option>
                    <option>Flutter (Mobile App)</option>
                    <option>Vue 3 / Nuxt</option>
                    <option>HTML5 / Vanilla Tailwind</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Backend Server</label>
                  <select
                    value={formData.backend_tech}
                    onChange={(e) => handleChange("backend_tech", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option>FastAPI / Python</option>
                    <option>Node.js / Express</option>
                    <option>Django / Python</option>
                    <option>Go / Gin</option>
                    <option>Spring Boot / Java</option>
                  </select>
                </div>
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Database Engine</label>
                  <select
                    value={formData.database_tech}
                    onChange={(e) => handleChange("database_tech", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option>PostgreSQL</option>
                    <option>MySQL / MariaDB</option>
                    <option>MongoDB</option>
                    <option>Supabase / Firebase</option>
                    <option>SQLite (Lightweight)</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant flex items-center justify-between">
                <div>
                  <span className="font-headline-sm text-headline-sm text-on-surface block">Need Architecture Advisory?</span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">Let our senior engineers benchmark and propose the most defendable tech stack.</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.client_wants_tech_recommendation}
                  onChange={(e) => handleChange("client_wants_tech_recommendation", e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 3: DESIGN & AESTHETICS */}
          {currentStep === 3 && (
            <div className="space-y-space-md">
              <div>
                <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Design Aesthetics &amp; Visual Tokens</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  Choose visual palettes, typography, and styling themes to ensure an extraordinary presentation.
                </p>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1.5">Color Palette Preset</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {colorPalettes.map((cp) => (
                    <div
                      key={cp.name}
                      onClick={() => {
                        handleChange("color_palette", cp.name);
                        handleChange("primary_color", cp.primary);
                        handleChange("accent_color", cp.accent);
                      }}
                      className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                        formData.color_palette === cp.name
                          ? "border-primary bg-surface-container-high"
                          : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{cp.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: cp.primary }}></span>
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: cp.accent }}></span>
                          <span className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: cp.bg }}></span>
                        </div>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">Primary: {cp.primary} · Accent: {cp.accent}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Typography Pairing</label>
                  <select
                    value={formData.font_family}
                    onChange={(e) => handleChange("font_family", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    {fontOptions.map((f) => (
                      <option key={f.name} value={f.name}>{f.name} ({f.type})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Theme Mood</label>
                  <select
                    value={formData.theme_mode}
                    onChange={(e) => handleChange("theme_mode", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option>Dark Engineering (Sleek High-Contrast)</option>
                    <option>Clean Light Minimalist</option>
                    <option>Glassmorphism &amp; Modern Gradients</option>
                    <option>Academic &amp; Formal Report Style</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">AI Capabilities &amp; Intelligent Features</label>
                <input
                  type="text"
                  value={formData.ai_feature}
                  onChange={(e) => handleChange("ai_feature", e.target.value)}
                  placeholder="e.g. Multi-modal RAG Chatbot, YOLO Vision Object Detection, Time Series Predictor"
                  className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                />
              </div>
            </div>
          )}

          {/* STEP 4: DELIVERABLES & DEADLINE */}
          {currentStep === 4 && (
            <div className="space-y-space-md">
              <div>
                <h2 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Deliverable Package &amp; Project Schedule</h2>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  Confirm the artifacts required for your defense and specify your target delivery deadline.
                </p>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-2">Required Artifact Checklist</label>
                <div className="space-y-2.5">
                  {[
                    { key: "include_source_code", title: "Production Source Code & Docker Manifests", tag: "Git / Zip" },
                    { key: "include_ieee_srs", title: "IEEE 830 Format Software Requirement Specification (SRS)", tag: "45-75 Pages PDF" },
                    { key: "include_presentation_ppt", title: "Defense Presentation Slide Deck", tag: "30-40 Vector Slides" },
                    { key: "include_demo_video", title: "High-Definition 4K Narrated System Demonstration Walkthrough", tag: "MP4 Screencast" },
                    { key: "include_database_dump", title: "Populated Database Seed Dumps & Postman API Collection", tag: "SQL / JSON" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between p-3 rounded-lg border border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={formData[item.key]}
                          onChange={(e) => handleChange(item.key, e.target.checked)}
                          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-0 cursor-pointer"
                        />
                        <span className="font-headline-sm text-headline-sm text-on-surface">{item.title}</span>
                      </div>
                      <span className="font-code-xs text-code-xs px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                        {item.tag}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Target Submission Deadline *</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={(e) => handleChange("deadline", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface mb-1">Delivery Urgency</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleChange("priority", e.target.value)}
                    className="w-full h-9 px-3 bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="normal">Standard (3–4 Weeks Cycle)</option>
                    <option value="high">Expedited (14 Days Express)</option>
                    <option value="urgent">Critical SLA (7 Days Fast-Track)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">Additional Constraints &amp; Special College Guidelines</label>
                <textarea
                  rows={3}
                  value={formData.additional_notes}
                  onChange={(e) => handleChange("additional_notes", e.target.value)}
                  placeholder="Mention any specific rubric, presentation guidelines, evaluator expectations, or custom libraries..."
                  className="w-full p-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:border-primary focus:ring-0 text-on-surface"
                ></textarea>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="mt-space-lg pt-space-md border-t border-outline-variant flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface rounded font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Previous Step</span>
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-5 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleCreateProject}
                className="px-6 py-2.5 bg-primary text-on-primary rounded font-label-md text-label-md font-semibold hover:bg-[#1E293B] transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <span>{loading ? "Formalizing Specification..." : "Submit Specification & Formalize"}</span>
                <span className="material-symbols-outlined text-base">check_circle</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Requirement Specification Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm space-y-space-md">
          <div className="pb-space-sm border-b border-outline-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1">Live Specification Card</span>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
              {formData.project_name || "Untitled Specification"}
            </h3>
            <span className="font-code-xs text-code-xs text-secondary font-medium">Draft Intake #REQ-AUTO</span>
          </div>

          <div className="space-y-3 text-body-sm font-body-sm">
            <div>
              <span className="text-label-sm font-label-sm text-outline block">Selected Domain</span>
              <span className="font-medium text-on-surface">{formData.domain}</span>
            </div>

            <div>
              <span className="text-label-sm font-label-sm text-outline block">Stack Configuration</span>
              <span className="font-code-xs text-code-xs text-on-surface bg-surface-container px-1.5 py-0.5 rounded">
                {formData.frontend_tech} + {formData.backend_tech} + {formData.database_tech}
              </span>
            </div>

            <div>
              <span className="text-label-sm font-label-sm text-outline block">Visual Design Preset</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: formData.primary_color }}></span>
                <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: formData.accent_color }}></span>
                <span className="text-xs text-on-surface font-medium">{formData.color_palette}</span>
              </div>
            </div>

            <div>
              <span className="text-label-sm font-label-sm text-outline block">Target Deadline</span>
              <span className="font-medium text-on-surface">
                {formData.deadline ? new Date(formData.deadline).toLocaleDateString() : "Not specified"}
              </span>
            </div>
          </div>

          <div className="pt-space-sm border-t border-outline-variant bg-surface-container-low/60 p-3 rounded-lg">
            <div className="flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant mb-1">
              <span>SLA Formal Quotation</span>
              <span className="text-secondary font-semibold">48-Hr Guaranteed</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-snug">
              Milestone escrow agreements protect 100% of your advance. You only release funds upon approving live staging previews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
