import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ClientProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/api/projects");
        if (res.data?.success) setProjects(res.data.projects || []);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "quotation_sent": return { label: "Quotation Ready", bg: "bg-tertiary-fixed text-on-tertiary-fixed", dot: "bg-tertiary-container" };
      case "awaiting_advance": return { label: "Advance Due", bg: "bg-tertiary-fixed text-on-tertiary-fixed", dot: "bg-tertiary-container" };
      case "advance_paid":
      case "in_development": return { label: "Sprint Active", bg: "bg-secondary-container text-on-secondary-container", dot: "bg-secondary" };
      case "under_client_review": return { label: "Staging Ready", bg: "bg-primary-fixed text-on-primary-fixed", dot: "bg-primary" };
      case "fully_paid":
      case "delivered": return { label: "Delivered", bg: "bg-secondary-container text-on-secondary-container", dot: "bg-secondary" };
      default: return { label: "In Review", bg: "bg-surface-container-high text-on-surface", dot: "bg-outline" };
    }
  };

  return (
    <div className="space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
        <div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">Active Projects</h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
            All your engineering projects, milestones, and escrow states in one view.
          </p>
        </div>
        <Link
          to="/client/projects/new"
          className="h-9 px-3.5 text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container rounded-md transition-colors flex items-center space-x-1.5 shadow-sm w-fit"
        >
          <span className="material-symbols-outlined text-[16px]">add_task</span>
          <span>Submit New Requirement</span>
        </Link>
      </div>

      {/* Project Cards */}
      {loading ? (
        <div className="p-12 text-center text-on-surface-variant text-body-sm">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-space-xl text-center shadow-sm">
          <span className="material-symbols-outlined text-4xl text-outline block mb-3">rocket_launch</span>
          <h3 className="text-headline-md font-headline-md text-on-surface mb-1">No Projects Yet</h3>
          <p className="text-body-sm font-body-sm text-on-surface-variant mb-4">
            Submit your first project specification to get started.
          </p>
          <Link
            to="/client/projects/new"
            className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-on-primary rounded-md text-label-md font-label-md font-semibold hover:bg-primary-container transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">add_task</span>
            <span>Submit New Requirement</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const badge = getStatusBadge(project.status);
            const progress = Math.min(100, Math.round(((Number(project.total_paid) || 0) / (Number(project.total_amount) || 1)) * 100));
            return (
              <div key={project.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
                <div className="p-space-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-on-surface">folder_managed</span>
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-0.5">
                        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
                          {project.project_name}
                        </h3>
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant font-medium">
                          {project.project_number}
                        </span>
                        <span className={`px-2 py-0.5 rounded-sm text-label-sm font-label-sm font-semibold ${badge.bg}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-body-sm font-body-sm text-on-surface-variant">
                        {project.domain || "Custom Engineering"} · {project.project_type || "Full Stack"} ·{" "}
                        {project.deadline
                          ? `Due: ${new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                          : "Flexible Timeline"}
                      </p>
                    </div>
                  </div>

                  {/* Progress + Financials */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:shrink-0">
                    <div className="min-w-[140px]">
                      <div className="flex justify-between text-label-sm font-label-sm text-on-surface-variant mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-on-surface">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full">
                        <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-label-sm font-label-sm text-outline block">Contract</span>
                      <span className="text-headline-sm font-headline-sm font-bold text-on-surface">
                        Rs.{Number(project.total_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Link
                      to={`/client/projects/${project.id}`}
                      className="h-8 px-3 text-label-md font-label-md bg-primary text-on-primary hover:bg-primary-container rounded-md transition-colors flex items-center space-x-1.5 shadow-sm shrink-0"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      <span>Open Workspace</span>
                    </Link>
                  </div>
                </div>

                {/* Bottom bar: metadata chips */}
                <div className="px-space-md py-2 border-t border-outline-variant bg-surface-container-low flex items-center flex-wrap gap-3 text-label-sm font-label-sm text-on-surface-variant">
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">account_balance_wallet</span>
                    <span>Escrow: Rs.{Number(project.total_paid || 0).toLocaleString("en-IN")}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>Created: {new Date(project.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </span>
                  {project.payment_status === "fully_paid" && (
                    <span className="flex items-center space-x-1 text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">lock_open</span>
                      <span>Vault Unlocked</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
