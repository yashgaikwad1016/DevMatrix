import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import confetti from "canvas-confetti";

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview, quotation, payment, staging, deliverables
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Change request modal
  const [showCrModal, setShowCrModal] = useState(false);
  const [crTitle, setCrTitle] = useState("");
  const [crDesc, setCrDesc] = useState("");

  const fetchProject = async () => {
    try {
      const res = await api.get(`/api/projects/${id}`);
      if (res.data?.success) {
        setProject(res.data.project);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // Handle Quotation Accept
  const handleAcceptQuotation = async (qtnId) => {
    setActionLoading(true);
    setError("");
    setMsg("");
    try {
      await api.post(`/api/quotations/${qtnId}/accept`);
      setMsg("Quotation formally accepted! Escrow payment unlocked below.");
      fetchProject();
    } catch (err) {
      setError("Failed to accept quotation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Payment (Advance or Final)
  const handlePayment = async (paymentType) => {
    setActionLoading(true);
    setError("");
    setMsg("");

    try {
      const orderRes = await api.post("/api/payments/create-order", {
        projectId: project.id,
        paymentType,
      });

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || "Failed to initialize payment.");
      }

      const { order } = orderRes.data;

      if (window.Razorpay) {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: "DevMatrix Engineering",
          description: `${paymentType.toUpperCase()} Escrow for ${project.project_name}`,
          order_id: order.id,
          handler: async function (response) {
            const verifyRes = await api.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data?.success) {
              setMsg("Payment settled & verified in escrow!");
              confetti({ particleCount: 90, spread: 60 });
              fetchProject();
            }
          },
          prefill: {
            name: user?.name,
            email: user?.email,
          },
          theme: { color: "#000000" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Mock fallback verification
        const verifyRes = await api.post("/api/payments/verify", {
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_success",
        });

        if (verifyRes.data?.success) {
          setMsg(`${paymentType === "advance" ? "Advance" : "Final"} payment verified in escrow!`);
          confetti({ particleCount: 90, spread: 60 });
          fetchProject();
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || err.message || "Payment processing failed.");
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Change Request
  const handleSubmitCR = async (e) => {
    e.preventDefault();
    if (!crTitle) return;
    setActionLoading(true);
    try {
      await api.post(`/api/projects/${project.id}/change-requests`, {
        title: crTitle,
        description: crDesc,
      });
      setMsg("Revision request dispatched to lead architect.");
      setShowCrModal(false);
      setCrTitle("");
      setCrDesc("");
      fetchProject();
    } catch (err) {
      setError("Failed to submit change request.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-on-surface-variant font-body-sm">
        Loading project workspace...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-12 text-center text-on-surface-variant font-body-sm">
        Project not found.{" "}
        <Link to="/client/projects" className="text-primary underline">
          Return to projects
        </Link>
      </div>
    );
  }

  const latestQuotation = project.quotations && project.quotations.length > 0 ? project.quotations[0] : null;

  return (
    <div className="space-y-space-lg">
      {/* Breadcrumb & Metabar */}
      <div className="flex flex-wrap items-center justify-between gap-space-md pb-space-sm border-b border-outline-variant">
        <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <Link to="/client/dashboard" className="hover:text-on-surface">Client Portal</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link to="/client/projects" className="hover:text-on-surface">Projects</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-on-surface font-semibold font-code-sm text-code-sm">{project.project_number}</span>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-space-sm">
          <span className="inline-flex items-center gap-1.5 bg-surface-container-lowest border border-outline-variant px-2.5 py-1 rounded-sm text-on-surface font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
            <span>Target: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "Flexible"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-2.5 py-1 rounded-sm font-label-sm text-label-sm font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span className="capitalize">{project.status?.replace("_", " ")}</span>
          </span>
        </div>
      </div>

      {/* Hero Project Banner */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-space-lg pb-space-lg border-b border-outline-variant">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-code-xs text-code-xs uppercase tracking-wider text-on-surface-variant font-semibold">
                STATEMENT OF WORK &amp; DELIVERABLES VAULT
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight mb-2">
              {project.project_name}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              {project.short_description || "Custom engineering specification and milestone execution pipeline."}
            </p>
          </div>

          <div className="flex items-center gap-space-sm shrink-0">
            <button
              type="button"
              onClick={() => setShowCrModal(true)}
              className="h-9 px-3 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">edit_document</span>
              <span>Request Revision</span>
            </button>
            <a
              href={`/api/projects/${project.id}/spec-pdf`}
              target="_blank"
              rel="noreferrer"
              className="h-9 px-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Download PDF Spec</span>
            </a>
          </div>
        </div>

        {/* Metadata Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md pt-space-lg">
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-0.5">Project Domain</span>
            <span className="font-headline-sm text-headline-sm text-on-surface">{project.domain || "Custom"}</span>
            <span className="block font-body-sm text-body-sm text-on-surface-variant">{project.project_type || "Web App"}</span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-0.5">Contract Amount</span>
            <span className="font-code-sm text-code-sm font-semibold text-on-surface">
              ₹{Number(project.total_amount).toLocaleString("en-IN")}
            </span>
            <span className="block font-body-sm text-body-sm text-on-surface-variant">Fixed-Scope SLA</span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-0.5">Escrow Deposited</span>
            <span className="font-code-sm text-code-sm font-semibold text-secondary">
              ₹{Number(project.total_paid).toLocaleString("en-IN")}
            </span>
            <span className="block font-body-sm text-body-sm text-on-surface-variant">
              {project.payment_status === "fully_paid" ? "100% Settled" : "Milestone Locked"}
            </span>
          </div>
          <div>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-0.5">Payment Custody</span>
            <span className="font-body-md text-body-md font-semibold text-secondary flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span>Mutual Escrow</span>
            </span>
            <span className="block font-body-sm text-body-sm text-on-surface-variant">Razorpay Secured</span>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {msg && (
        <div className="p-3 rounded bg-secondary-container text-on-secondary-container text-body-sm border border-secondary/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{msg}</span>
        </div>
      )}
      {error && (
        <div className="p-3 rounded bg-error-container text-error text-body-sm border border-error/30 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Workspace Tabs Header */}
      <div className="flex border-b border-outline-variant">
        {[
          { id: "overview", label: "SRS Specification", icon: "assignment" },
          { id: "quotation", label: "Formal Quotation", icon: "receipt_long" },
          { id: "payment", label: "Milestone Escrow", icon: "account_balance_wallet" },
          { id: "staging", label: "Live Staging Sandbox", icon: "devices" },
          { id: "deliverables", label: "Artifacts Vault", icon: "inventory_2" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-4 text-headline-sm font-headline-sm border-b-2 transition-colors flex items-center gap-2 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-base">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ==================== TAB 1: OVERVIEW & SRS SPECIFICATION ==================== */}
      {activeTab === "overview" && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-space-lg">
          <div>
            <h3 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Software Requirement Specification Matrix</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Authoritative functional breakdown formatted according to IEEE 830 standards.
            </p>
          </div>

          {(() => {
            const reqList = project.project_requirements || project.requirements || [];
            if (reqList.length === 0) {
              return (
                <div className="p-8 text-center text-on-surface-variant text-body-sm bg-surface-container-low/40 rounded-lg border border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-3xl text-outline block mb-1">assignment</span>
                  No formal requirements logged yet.
                </div>
              );
            }

            return (
              <div className="space-y-6">
                {reqList.map((req, idx) => {
                  const techList = req.project_technologies || req.technologies || [];
                  const designObj = req.project_designs || req.design || (req.design_choices && req.design_choices[0]) || null;
                  const aiList = req.project_ai_features || req.ai_features || [];
                  const frList = req.functional_requirements || [];

                  return (
                    <div key={req.id || idx} className="p-5 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-outline-variant/60">
                        <div className="flex items-center gap-2.5">
                          <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Specification Version #{req.version || idx + 1}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-secondary-container text-on-secondary-container">
                            {req.status?.replace("_", " ") || "submitted"}
                          </span>
                        </div>
                        <span className="font-code-xs text-code-xs text-on-surface-variant">
                          Submitted {req.created_at ? new Date(req.created_at).toLocaleDateString() : "Recently"}
                        </span>
                      </div>

                      {/* Problem Statement / Scope */}
                      {req.description && (
                        <div>
                          <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1">Scope &amp; Description</span>
                          <p className="text-body-sm font-body-sm text-on-surface leading-relaxed whitespace-pre-line bg-surface-container-low/50 p-3 rounded-lg border border-outline-variant/50">
                            {req.description}
                          </p>
                        </div>
                      )}

                      {/* Additional Notes */}
                      {req.additional_requirements && (
                        <div>
                          <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1">Additional Client Directives</span>
                          <p className="text-body-sm font-body-sm text-on-surface-variant italic bg-surface-container-low/30 p-2.5 rounded-lg border border-outline-variant/40">
                            "{req.additional_requirements}"
                          </p>
                        </div>
                      )}

                      {/* Tech Stack */}
                      {techList.length > 0 && (
                        <div>
                          <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1.5">Approved Architecture Stack</span>
                          <div className="flex flex-wrap gap-2">
                            {techList.map((t, tIdx) => (
                              <span key={t.id || tIdx} className="font-code-xs text-code-xs px-2.5 py-1 rounded bg-surface-container-high border border-outline-variant text-on-surface flex items-center gap-1.5">
                                <span className="text-outline uppercase text-[10px]">{t.category}:</span>
                                <strong>{t.technology_name || t.tech_name || "Specified"}</strong>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Capabilities */}
                      {aiList.length > 0 && (
                        <div>
                          <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1.5">AI Modules &amp; Capabilities</span>
                          <div className="space-y-1.5">
                            {aiList.map((ai, aIdx) => (
                              <div key={ai.id || aIdx} className="p-2.5 rounded bg-surface-container-low/50 border border-outline-variant/60 flex items-start gap-2">
                                <span className="material-symbols-outlined text-primary text-base mt-0.5">psychology</span>
                                <div>
                                  <span className="text-label-md font-label-md font-semibold text-on-surface block">{ai.feature_name}</span>
                                  {ai.description && <span className="text-body-sm font-body-sm text-on-surface-variant">{ai.description}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Design & Aesthetic Preferences */}
                      {designObj && (
                        <div>
                          <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1.5">Aesthetic &amp; Interface Preset</span>
                          <div className="p-3 rounded-lg bg-surface-container-low/40 border border-outline-variant/60 flex flex-wrap items-center gap-4 text-body-sm font-body-sm">
                            {designObj.design_style && (
                              <span>Style: <strong className="text-on-surface capitalize">{designObj.design_style}</strong></span>
                            )}
                            {designObj.font_family && (
                              <span>Typography: <strong className="text-on-surface">{designObj.font_family}</strong></span>
                            )}
                            {(designObj.primary_color || designObj.accent_color) && (
                              <div className="flex items-center gap-2">
                                <span>Palette:</span>
                                {designObj.primary_color && (
                                  <span className="w-4 h-4 rounded-full border border-black/15 shadow-inner" style={{ backgroundColor: designObj.primary_color }} title={`Primary: ${designObj.primary_color}`}></span>
                                )}
                                {designObj.accent_color && (
                                  <span className="w-4 h-4 rounded-full border border-black/15 shadow-inner" style={{ backgroundColor: designObj.accent_color }} title={`Accent: ${designObj.accent_color}`}></span>
                                )}
                              </div>
                            )}
                            {designObj.custom_instructions && (
                              <span className="text-on-surface-variant font-code-xs text-code-xs">({designObj.custom_instructions})</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Functional Requirements */}
                      {frList.length > 0 && (
                        <div>
                          <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold block mb-1.5">Functional Modules</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {frList.map((fr, fIdx) => (
                              <div key={fr.id || fIdx} className="p-2.5 rounded bg-surface-container-low/40 border border-outline-variant/60">
                                <span className="font-semibold text-on-surface block text-label-md font-label-md">{fr.title}</span>
                                {fr.description && <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">{fr.description}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </section>
      )}

      {/* ==================== TAB 2: FORMAL QUOTATION ==================== */}
      {activeTab === "quotation" && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm space-y-space-md">
          <div className="p-space-lg border-b border-outline-variant bg-surface-container-low/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">Itemized Engineering Quotation</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Binding Statement of Work (SOW) with milestone breakdown and fixed pricing.
              </p>
            </div>
            {latestQuotation && latestQuotation.status === "sent" && (
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleAcceptQuotation(latestQuotation.id)}
                className="px-4 py-2 bg-secondary text-white rounded font-label-md text-label-md font-semibold hover:bg-opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">verified</span>
                <span>Accept Quotation &amp; Proceed to Escrow</span>
              </button>
            )}
          </div>

          {latestQuotation ? (
            <div className="p-space-lg space-y-space-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase">
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">Work Package &amp; Deliverable Scope</th>
                      <th className="py-2.5 px-3 text-right w-36">Total (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/60">
                    {latestQuotation.line_items?.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                        <td className="py-3 px-3 text-center font-code-sm text-code-sm text-outline">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <span className="font-headline-sm text-headline-sm text-on-surface block">{item.title}</span>
                          <span className="text-body-sm font-body-sm text-on-surface-variant">{item.description}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-code-sm text-code-sm font-semibold text-on-surface">
                          ₹{Number(item.total_price).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Quotation Summary Totals */}
              <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant max-w-md ml-auto space-y-2 text-body-sm font-body-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Gross SOW Amount:</span>
                  <span className="font-code-sm">₹{Number(latestQuotation.base_amount).toLocaleString("en-IN")}</span>
                </div>
                {Number(latestQuotation.referral_discount_amount) > 0 && (
                  <div className="flex justify-between text-secondary font-medium">
                    <span>Partner Referral Discount (10%):</span>
                    <span className="font-code-sm">-₹{Number(latestQuotation.referral_discount_amount).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-on-surface font-bold text-headline-sm border-t border-outline-variant pt-2">
                  <span>Net Binding Quotation:</span>
                  <span className="font-code-sm text-headline-sm text-on-surface">₹{Number(latestQuotation.total_amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant text-label-sm border-t border-outline-variant pt-1.5">
                  <span>Advance Escrow Commitment (40%):</span>
                  <span className="font-code-sm font-semibold text-primary">₹{Number(latestQuotation.advance_amount_required).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-on-surface-variant text-body-sm">
              Your specification is undergoing architectural review. Formal quote guaranteed within 48 hours.
            </div>
          )}
        </section>
      )}

      {/* ==================== TAB 3: MILESTONE ESCROW & PAYMENTS ==================== */}
      {activeTab === "payment" && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-space-lg">
          <div>
            <h3 className="text-headline-lg font-headline-lg text-on-surface">Milestone Escrow Gateway</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Pay securely in milestone stages via Razorpay. Funds remain protected in custodial lock until you approve staging builds.
            </p>
          </div>

          {/* Escrow Progress Box */}
          <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-label-md text-label-md text-on-surface">Escrow Settlement Progress</span>
              <span className="font-code-sm text-code-sm font-bold text-secondary">
                ₹{Number(project.total_paid).toLocaleString("en-IN")} / ₹{Number(project.total_amount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-3">
              <div
                className="bg-secondary h-3 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round(((Number(project.total_paid) || 0) / (Number(project.total_amount) || 1)) * 100))}%`,
                }}
              ></div>
            </div>
          </div>

          {/* Milestone Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
            {/* Advance Milestone Card */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Milestone 1: 40% Advance Deposit</span>
                {Number(project.total_paid) > 0 ? (
                  <span className="text-secondary flex items-center gap-1 font-label-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Paid
                  </span>
                ) : (
                  <span className="text-primary font-label-sm font-semibold">Action Due</span>
                )}
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Unlocks private Git repo, database schema scaffolding, and architecture blueprint sprint.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-code-sm text-code-sm font-bold text-on-surface">
                  ₹{latestQuotation ? Number(latestQuotation.advance_amount_required).toLocaleString("en-IN") : "Pending Quote"}
                </span>
                {Number(project.total_paid) === 0 && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handlePayment("advance")}
                    className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    <span>Deposit Advance Escrow</span>
                  </button>
                )}
              </div>
            </div>

            {/* Final Release Milestone Card */}
            <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Milestone 2: Final Release Escrow</span>
                {project.payment_status === "fully_paid" ? (
                  <span className="text-secondary flex items-center gap-1 font-label-sm font-semibold">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Settled
                  </span>
                ) : (
                  <span className="text-on-surface-variant font-label-sm">Requires Staging Approval</span>
                )}
              </div>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Unlocks complete deliverables vault: Source Code ZIP, IEEE 830 Report PDF, PPT, and 4K video.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="font-code-sm text-code-sm font-bold text-on-surface">
                  ₹{latestQuotation ? Number(latestQuotation.remaining_amount).toLocaleString("en-IN") : "Pending Quote"}
                </span>
                {Number(project.total_paid) > 0 && project.payment_status !== "fully_paid" && (
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handlePayment("final")}
                    className="px-4 py-2 bg-secondary text-white rounded font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">lock_open</span>
                    <span>Settle Remaining &amp; Unlock All</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== TAB 4: LIVE STAGING SANDBOX ==================== */}
      {activeTab === "staging" && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">Ephemeral Staging Container</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Live sandbox deployment running on isolated cloud infrastructure for acceptance testing.
              </p>
            </div>
            {project.staging_url && (
              <a
                href={project.staging_url}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3.5 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>Open in New Tab</span>
              </a>
            )}
          </div>

          <div className="border border-outline-variant rounded-lg overflow-hidden bg-surface-container-low h-[550px] relative">
            {project.staging_url ? (
              <iframe
                src={project.staging_url}
                title="Staging Preview"
                className="w-full h-full border-0"
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">dns</span>
                <p className="font-headline-sm text-headline-sm text-on-surface">Staging sandbox spinning up</p>
                <p className="text-body-sm font-body-sm mt-1 max-w-sm">
                  Once the development team pushes the first sprint build, live staging will appear here automatically.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== TAB 5: DELIVERABLES ARTIFACT VAULT ==================== */}
      {activeTab === "deliverables" && (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-space-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
            <div>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">Academic &amp; Deliverables Vault</h3>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                Verified 6-part defense package. Downloads are unlocked once project reaches fully paid status.
              </p>
            </div>
            {project.payment_status === "fully_paid" ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-container text-on-secondary-container rounded font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-sm">lock_open</span>
                <span>Vault Fully Unlocked</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed rounded font-label-sm text-label-sm font-semibold">
                <span className="material-symbols-outlined text-sm">lock</span>
                <span>Locked Until Final Escrow Release</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { type: "source_code", title: "Production Source Code & Docker", icon: "data_object", ext: "ZIP Repo" },
              { type: "ieee_report", title: "IEEE 830 Standard Project Report", icon: "article", ext: "PDF Report" },
              { type: "ppt", title: "Final Defense Presentation Deck", icon: "slideshow", ext: "PPTX / Slides" },
              { type: "video", title: "HD System Demonstration Walkthrough", icon: "videocam", ext: "MP4 Video" },
              { type: "database", title: "Populated Database Seeds & SQL", icon: "database", ext: "SQL / JSON" },
            ].map((art) => (
              <div key={art.type} className="p-4 rounded-xl border border-outline-variant bg-surface flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-code-xs text-code-xs text-on-surface-variant font-medium">{art.ext}</span>
                    <span className="material-symbols-outlined text-on-surface-variant">{art.icon}</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface mb-1">{art.title}</h4>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    {project.payment_status === "fully_paid" ? "Verified and ready for instant download." : "Payment gate active."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant flex items-center justify-between">
                  {project.payment_status === "fully_paid" ? (
                    <a
                      href={`/api/deliverables/download/${project.id}/${art.type}`}
                      className="inline-flex items-center gap-1 text-label-sm font-label-sm font-semibold text-secondary hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm">download</span>
                      <span>Download Artifact</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-label-sm font-label-sm text-outline">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span>Requires Final Release</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Revision Request Modal */}
      {showCrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg max-w-lg w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-md font-headline-md font-bold text-on-surface">Request Scope Revision</h3>
              <button
                type="button"
                onClick={() => setShowCrModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmitCR} className="space-y-3">
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">Revision Topic / Feature Title</label>
                <input
                  type="text"
                  required
                  value={crTitle}
                  onChange={(e) => setCrTitle(e.target.value)}
                  placeholder="e.g. Add DICOM zoom and rotation controls"
                  className="w-full h-9 px-3 bg-surface border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">Detailed Revision Notes</label>
                <textarea
                  rows={4}
                  required
                  value={crDesc}
                  onChange={(e) => setCrDesc(e.target.value)}
                  placeholder="Explain exactly what adjustments or fixes are required..."
                  className="w-full p-3 bg-surface border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCrModal(false)}
                  className="px-3.5 py-1.5 border border-outline-variant rounded text-label-md font-label-md hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-primary text-on-primary rounded text-label-md font-label-md font-medium hover:bg-[#1E293B] shadow-sm disabled:opacity-50"
                >
                  {actionLoading ? "Submitting..." : "Submit Revision"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
