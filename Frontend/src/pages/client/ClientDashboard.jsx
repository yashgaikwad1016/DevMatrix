import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/api/projects");
        if (res.data?.success) {
          setProjects(res.data.projects || []);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const activeProject = projects.length > 0 ? projects[0] : null;
  const totalEscrow = projects.reduce((acc, p) => acc + (Number(p.total_paid) || 0), 0);
  const totalAmount = projects.reduce((acc, p) => acc + (Number(p.total_amount) || 0), 0);
  const pendingActionsCount = projects.filter(
    (p) => ["quotation_sent", "awaiting_advance", "under_client_review"].includes(p.status)
  ).length;
  const deliverableCount = projects.filter((p) => p.payment_status === "fully_paid").length * 5;

  const getStatusBadge = (status) => {
    switch (status) {
      case "quotation_sent":
        return { label: "Quotation Ready", bg: "bg-tertiary-fixed text-on-tertiary-fixed" };
      case "awaiting_advance":
        return { label: "Advance Escrow Due", bg: "bg-tertiary-fixed text-on-tertiary-fixed" };
      case "advance_paid":
      case "in_development":
        return { label: "Sprint Active", bg: "bg-secondary-container text-on-secondary-container" };
      case "under_client_review":
        return { label: "Staging Preview Ready", bg: "bg-primary-fixed text-on-primary-fixed" };
      case "fully_paid":
      case "delivered":
        return { label: "Deliverables Unlocked", bg: "bg-secondary-container text-on-secondary-container" };
      default:
        return { label: "Requirements In Review", bg: "bg-surface-container-high text-on-surface" };
    }
  };

  const progressPercent = activeProject
    ? Math.min(100, Math.round(((Number(activeProject.total_paid) || 0) / (Number(activeProject.total_amount) || 1)) * 100))
    : 0;

  return (
    <div className="space-y-space-lg">
      {/* GREETING HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
              Good morning, {user?.name || "Client"}
            </h1>
            <span className="px-2 py-0.5 rounded-sm text-label-sm font-label-sm bg-secondary-container text-on-secondary-container font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span>All Systems Nominal</span>
            </span>
          </div>
          <p className="text-body-md font-body-md text-on-surface-variant">
            {user?.college ? `${user.college} · ` : ""}
            Track your ongoing builds, milestone escrows, and inspect verified staging environments.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="h-9 px-3.5 text-label-md font-label-md border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high rounded-md transition-colors flex items-center space-x-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">support_agent</span>
            <span>Contact Lead Architect</span>
          </button>
          <Link
            to="/client/projects/new"
            className="h-9 px-3.5 text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            <span>Submit New Requirement</span>
          </Link>
        </div>
      </section>

      {/* METRIC SUMMARY CARDS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-label-md font-label-md">Active Projects</span>
            <span className="material-symbols-outlined text-[18px] text-outline">rocket_launch</span>
          </div>
          <div className="text-headline-lg font-headline-lg font-bold text-on-surface mb-1">
            {projects.length} {projects.length === 1 ? "In Flight" : "Projects"}
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Continuous Milestones</span>
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-label-md font-label-md">Pending Client Actions</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary-container">pending_actions</span>
          </div>
          <div className="flex items-baseline space-x-2 mb-1">
            <span className="text-headline-lg font-headline-lg font-bold text-on-surface">
              {pendingActionsCount} Action Item{pendingActionsCount !== 1 ? "s" : ""}
            </span>
            {pendingActionsCount > 0 && (
              <span className="text-label-sm font-label-sm px-1.5 py-0.5 rounded-sm bg-tertiary-fixed text-on-tertiary-fixed font-medium">
                Required
              </span>
            )}
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            {pendingActionsCount > 0 ? "Approve Quote / Test Staging Build" : "No pending bottlenecks"}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-label-md font-label-md">Milestone Escrow Committed</span>
            <span className="material-symbols-outlined text-[18px] text-outline">shield_with_heart</span>
          </div>
          <div className="text-headline-lg font-headline-lg font-bold text-on-surface mb-1">
            Rs.{totalEscrow.toLocaleString("en-IN")}
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            {totalAmount > 0
              ? `${Math.round((totalEscrow / totalAmount) * 100)}% Held in custodial escrow`
              : "Held in custodial escrow protection"}
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
          <div className="flex items-center justify-between text-on-surface-variant mb-2">
            <span className="text-label-md font-label-md">Completed Deliverables</span>
            <span className="material-symbols-outlined text-[18px] text-outline">verified</span>
          </div>
          <div className="text-headline-lg font-headline-lg font-bold text-on-surface mb-1">
            {deliverableCount} Verified
          </div>
          <p className="text-body-sm font-body-sm text-secondary font-medium flex items-center space-x-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            <span>IEEE 830, PPT, Code, DB &amp; Video</span>
          </p>
        </div>
      </section>

      {/* ACTIVE PROJECT CARD */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant font-body-sm">Loading workspace...</div>
      ) : activeProject ? (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="p-space-lg border-b border-outline-variant bg-surface-container-low/40">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center flex-wrap gap-2 mb-1">
                  <h2 className="text-headline-lg font-headline-lg font-bold text-on-surface">
                    {activeProject.project_name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface-variant text-[11px] font-medium border border-outline-variant">
                    {activeProject.project_number}
                  </span>
                  {(() => {
                    const badge = getStatusBadge(activeProject.status);
                    return (
                      <span className={`px-2 py-0.5 rounded-sm text-label-sm font-label-sm font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  <span className="font-medium text-on-surface">Domain:</span> {activeProject.domain || "Custom Engineering"}&nbsp;•&nbsp;
                  <span className="font-medium text-on-surface">Type:</span> {activeProject.project_type || "Full Stack Application"}
                </p>
              </div>
              <div className="flex items-center space-x-3 self-start lg:self-auto">
                {activeProject.deadline && (
                  <div className="text-right">
                    <span className="text-label-sm font-label-sm text-on-surface-variant block uppercase tracking-wider">Target Delivery</span>
                    <span className="text-headline-sm font-headline-sm font-bold text-on-surface">
                      {new Date(activeProject.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
                <Link
                  to={`/client/projects/${activeProject.id}`}
                  className="h-9 px-3.5 text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  <span>Open Project</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="p-space-lg space-y-space-lg">
            {/* Phase Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline font-semibold">Current Phase</span>
                  <h3 className="text-headline-md font-headline-md text-on-surface font-semibold">
                    {activeProject.status === "advance_paid" || activeProject.status === "in_development"
                      ? "Active Development & Sprint Execution"
                      : activeProject.status === "under_client_review"
                      ? "Staging Verification & Acceptance Testing"
                      : activeProject.status === "fully_paid" || activeProject.status === "delivered"
                      ? "Delivered — Artifacts Unlocked"
                      : "Architecture & Requirements Discovery"}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-headline-md font-headline-md font-bold text-on-surface">{progressPercent}%</span>
                  <span className="text-label-sm font-label-sm text-on-surface-variant ml-1">Complete</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full transition-all" style={{ width: `${progressPercent}%` }}></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-space-md pt-space-sm border-t border-outline-variant/60">
                {[
                  { label: "Phase 1: Architecture", done: progressPercent >= 25 },
                  { label: "Phase 2: Core Dev", done: progressPercent >= 50 },
                  { label: "Phase 3: Staging & QA", done: progressPercent >= 75, active: progressPercent >= 50 && progressPercent < 75 },
                  { label: "Phase 4: Final Handover", done: progressPercent >= 100, active: progressPercent >= 75 && progressPercent < 100 },
                ].map((phase, i) => (
                  <div key={i} className={`flex items-center space-x-2 ${!phase.done && !phase.active ? "opacity-50" : ""}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                      phase.done ? "bg-secondary text-on-secondary" : phase.active ? "border-2 border-primary text-on-surface" : "bg-surface-container text-outline border border-outline-variant"
                    }`}>
                      {phase.done ? <span className="material-symbols-outlined text-[14px]">check</span> : i + 1}
                    </div>
                    <div>
                      <div className="text-label-md font-label-md font-semibold text-on-surface">{phase.label}</div>
                      <div className={`text-label-sm font-label-sm ${phase.done ? "text-secondary" : phase.active ? "text-primary" : "text-outline"}`}>
                        {phase.done ? "Completed" : phase.active ? "In Progress" : "Upcoming"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Escrow Ledger Ribbon */}
            <div className="bg-surface-container-low rounded-lg p-space-md border border-outline-variant flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                <div>
                  <span className="text-label-sm font-label-sm text-outline block">Total Contract</span>
                  <span className="text-headline-sm font-headline-sm font-bold text-on-surface">
                    Rs.{Number(activeProject.total_amount || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-label-sm font-label-sm text-outline block">Escrow Released</span>
                  <span className="text-headline-sm font-headline-sm font-bold text-secondary">
                    Rs.{Number(activeProject.total_paid || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-label-sm font-label-sm text-outline block">Advance Held</span>
                  <span className="text-headline-sm font-headline-sm font-bold text-on-surface">
                    Rs.{Number(activeProject.total_paid || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div>
                  <span className="text-label-sm font-label-sm text-outline block">Final Release</span>
                  <span className="text-headline-sm font-headline-sm font-medium text-on-surface-variant">
                    Rs.{Math.max(0, Number(activeProject.total_amount || 0) - Number(activeProject.total_paid || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
              <span className="text-label-sm font-label-sm text-outline flex items-center space-x-1 shrink-0">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                <span>Custodial Razorpay Escrow Active</span>
              </span>
            </div>

            {/* Staging Box */}
            <div className="border border-outline-variant rounded-xl p-space-md bg-surface-container-lowest flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-on-surface">dns</span>
                </div>
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="text-body-sm font-semibold text-on-surface">
                      {activeProject.staging_url || `staging-${activeProject.project_number?.toLowerCase()}.devmatrix.run`}
                    </span>
                    {activeProject.staging_url ? (
                      <span className="px-2 py-0.5 rounded-sm bg-secondary-container text-on-secondary-container text-label-sm font-semibold flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                        <span>Staging Live</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-sm bg-surface-container-high text-on-surface-variant text-label-sm font-semibold">Pending Build</span>
                    )}
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">Isolated sandbox for acceptance testing &amp; preview.</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <Link to={`/client/projects/${activeProject.id}`} className="h-9 px-3 text-label-md font-label-md border border-outline-variant rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface flex items-center space-x-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">terminal</span>
                  <span>View Commits</span>
                </Link>
                {activeProject.staging_url && (
                  <a href={activeProject.staging_url} target="_blank" rel="noreferrer" className="h-9 px-3.5 text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container rounded-md transition-colors flex items-center space-x-1.5 shadow-sm">
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    <span>Inspect Live Sandbox</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-outline block mb-3">rocket_launch</span>
          <h3 className="text-headline-md font-headline-md text-on-surface mb-1">No Active Projects Yet</h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant mb-4">Submit your first project specification to get started.</p>
          <Link to="/client/projects/new" className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-on-primary rounded-md text-label-md font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            <span>Submit New Requirement</span>
          </Link>
        </section>
      )}

      {/* ACTION ITEMS + TIMELINE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-7 space-y-space-md">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant">
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface flex items-center space-x-2">
              <span>Action Items &amp; Milestone Approvals</span>
              {pendingActionsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[11px] font-semibold flex items-center justify-center">{pendingActionsCount}</span>
              )}
            </h3>
            <span className="text-label-sm font-label-sm text-outline">Sign-off authorizes escrow release</span>
          </div>

          {activeProject && ["under_client_review", "quotation_sent", "awaiting_advance"].includes(activeProject.status) ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm space-y-space-sm">
              <span className="text-label-sm font-label-sm px-2 py-0.5 rounded-sm bg-tertiary-fixed text-on-tertiary-fixed font-semibold uppercase">
                Pending Client Verification
              </span>
              <h4 className="text-headline-sm font-headline-sm font-semibold text-on-surface mt-1">
                {activeProject.status === "under_client_review" ? "Staging Acceptance Sign-off Required" :
                 activeProject.status === "quotation_sent" ? "Review & Accept Formal Quotation" :
                 "Advance Escrow Deposit Due"}
              </h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                {activeProject.status === "under_client_review" ? "Live preview ready for user sign-off. Inspect the staging environment and approve the milestone." :
                 activeProject.status === "quotation_sent" ? "Engineering quotation is ready. Review the line items and formally accept to proceed." :
                 "Commit the advance escrow to unlock private repo access and architecture sprint."}
              </p>
              <div className="pt-space-sm border-t border-outline-variant/60 flex flex-wrap items-center gap-2">
                <Link to={`/client/projects/${activeProject.id}`} className="h-8 px-3 text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container rounded-md transition-colors flex items-center space-x-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Review &amp; Take Action</span>
                </Link>
                <button className="h-8 px-3 text-label-md font-label-md border border-outline-variant rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface flex items-center space-x-1.5 shadow-sm">
                  <span className="material-symbols-outlined text-[16px]">edit_note</span>
                  <span>Submit Change Request</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm text-center text-on-surface-variant text-body-sm">
              <span className="material-symbols-outlined block text-2xl mb-2 text-outline">task_alt</span>
              {activeProject ? "No pending action items. Build is progressing on schedule." : "Submit a project to see action items here."}
            </div>
          )}

          {activeProject && (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
              <span className="text-label-sm font-label-sm px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface-variant font-semibold uppercase">Documentation Review</span>
              <h4 className="text-headline-sm font-headline-sm font-semibold text-on-surface mt-1">Review IEEE 830 SRS Specification</h4>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5 mb-3">Formal SRS and architecture documentation for your project is available for review.</p>
              <Link to={`/client/projects/${activeProject.id}`} className="h-8 px-3 text-label-md font-label-md border border-outline-variant rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface flex items-center space-x-1.5 shadow-sm w-fit">
                <span className="material-symbols-outlined text-[16px] text-outline">picture_as_pdf</span>
                <span>View SRS Document</span>
              </Link>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-space-md">
          <div className="flex items-center justify-between pb-1 border-b border-outline-variant">
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface">Recent Verified Activity</h3>
            <a className="text-label-md font-label-md text-on-surface-variant hover:text-on-surface" href="#">Full Audit Log</a>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm">
            {activeProject ? (
              <div className="relative pl-6 space-y-6" style={{ "--tw-before-content": "''" }}>
                <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-outline-variant"></div>
                {[
                  {
                    dot: "bg-secondary",
                    date: new Date(activeProject.updated_at || activeProject.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    title: "Project status updated",
                    desc: `Status moved to: ${activeProject.status?.replace(/_/g, " ")}`,
                  },
                  {
                    dot: Number(activeProject.total_paid) > 0 ? "bg-secondary" : "bg-outline",
                    date: new Date(activeProject.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                    title: "Project specification submitted",
                    desc: `${activeProject.project_name} registered as ${activeProject.project_number}`,
                  },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ${item.dot} ring-4 ring-surface-container-lowest`}></div>
                    <div className="text-label-sm font-label-sm text-outline">{item.date}</div>
                    <div className="text-body-sm font-body-sm font-semibold text-on-surface mt-0.5">{item.title}</div>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-6">No activity yet.</p>
            )}
          </div>
        </div>
      </section>

      {/* RECENT PAYMENTS TABLE */}
      <section className="space-y-space-sm pb-space-xl">
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant">
          <div>
            <h3 className="text-headline-md font-headline-md font-bold text-on-surface">Recent Payments &amp; Escrows</h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">Immutable custodial records and tax compliance receipts.</p>
          </div>
          <button className="h-8 px-3 text-label-md font-label-md border border-outline-variant rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface flex items-center space-x-1 shadow-sm">
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Download Statement</span>
          </button>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-space-md font-semibold">Invoice #</th>
                <th className="py-3 px-space-md font-semibold">Milestone</th>
                <th className="py-3 px-space-md font-semibold text-right">Amount</th>
                <th className="py-3 px-space-md font-semibold">Status</th>
                <th className="py-3 px-space-md font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-body-sm font-body-sm">
              {projects.filter((p) => Number(p.total_paid) > 0).length > 0 ? (
                projects.filter((p) => Number(p.total_paid) > 0).map((p, i) => (
                  <tr key={p.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-space-md font-semibold text-on-surface">
                      #INV-{p.project_number?.replace("PRJ-", "") || (1000 + i)}
                    </td>
                    <td className="py-3 px-space-md text-on-surface font-medium">{p.project_name} — Advance Escrow</td>
                    <td className="py-3 px-space-md text-right font-semibold text-on-surface">
                      Rs.{Number(p.total_paid).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-space-md">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="text-on-surface font-medium">Released &amp; Cleared</span>
                      </div>
                    </td>
                    <td className="py-3 px-space-md text-right">
                      <button className="inline-flex items-center space-x-1 text-label-md font-label-md text-on-surface-variant hover:text-on-surface px-2 py-1 rounded hover:bg-surface-container transition-colors">
                        <span className="material-symbols-outlined text-[16px] text-outline">picture_as_pdf</span>
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-on-surface-variant text-body-sm">
                    No payment records yet. Escrow activity will appear here once a milestone is committed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
