import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const ARTIFACT_TYPES = [
  { type: "GIT / REPO",      icon: "code",           label: "Source Code Repository" },
  { type: "DOC / PDF",       icon: "picture_as_pdf", label: "IEEE 830 SRS Specification" },
  { type: "SLIDES / PPTX",   icon: "slideshow",      label: "Defence Pitch Deck" },
  { type: "ARCH / BUNDLE",   icon: "schema",         label: "Architecture Report" },
  { type: "MEDIA / MP4",     icon: "videocam",       label: "4K Demo Walkthrough Video" },
  { type: "INFRA / DOCKER",  icon: "deployed_code",  label: "Docker Compose Stack" },
];

export default function ClientDeliverables() {
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

  if (loading) {
    return (
      <div className="p-12 text-center text-on-surface-variant font-body-sm">
        Loading deliverables vault...
      </div>
    );
  }

  const deliveredProjects = projects.filter(
    (p) => ["fully_paid", "delivered"].includes(p.payment_status) || p.status === "delivered"
  );
  const lockedProjects = projects.filter(
    (p) => !["fully_paid", "delivered"].includes(p.payment_status) && p.status !== "delivered"
  );

  return (
    <div className="space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
        <div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
            Artifacts Vault
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
            Contractual deliverables, reports, repositories, and demo materials.
            Unlocked after final escrow settlement.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary-container text-on-secondary-container text-label-sm font-label-sm font-semibold">
          <span className="material-symbols-outlined text-[16px]">verified_user</span>
          100% IP Transferred to Client
        </span>
      </div>

      {/* Unlocked Projects */}
      {deliveredProjects.length > 0 && deliveredProjects.map((project) => (
        <section key={project.id} className="space-y-space-md">
          <div className="flex items-center justify-between border-b border-outline-variant pb-2">
            <div>
              <h2 className="text-headline-lg font-headline-lg text-on-surface">
                {project.project_name}
              </h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant">
                {project.project_number} · Deliverable Artifact Manifest
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-secondary font-semibold">
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              <span>6 of 6 Deliverables Unlocked</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARTIFACT_TYPES.map((art) => (
              <div key={art.type} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-code-xs text-code-xs font-semibold text-on-surface">{art.type}</span>
                    <span className="material-symbols-outlined text-secondary">check</span>
                  </div>
                  <h4 className="text-headline-sm font-headline-sm text-on-surface pt-1">{art.label}</h4>
                </div>
                <div className="pt-2 border-t border-outline-variant flex items-center justify-between">
                  <span className="font-code-xs text-code-xs text-on-surface-variant">Available</span>
                  <button className="inline-flex items-center gap-1 text-primary hover:underline text-label-sm font-label-sm font-medium">
                    <span className="material-symbols-outlined text-[14px]">download</span>
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Locked Projects (Awaiting Escrow) */}
      {lockedProjects.length > 0 && (
        <section className="space-y-space-md">
          {deliveredProjects.length > 0 && (
            <div className="border-b border-outline-variant pb-2">
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Pending Escrow Unlock</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant">Complete final escrow settlement to unlock all artifacts.</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedProjects.map((project) => (
              <div key={project.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 space-y-4 shadow-sm opacity-75">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-headline-sm font-headline-sm text-on-surface">{project.project_name}</h3>
                    <p className="text-body-sm font-body-sm text-on-surface-variant">{project.project_number}</p>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[20px]">lock</span>
                </div>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  6 deliverables locked behind final escrow settlement. Complete your milestone payment to unlock the full artifacts vault.
                </p>
                <Link
                  to={`/client/projects/${project.id}/payment`}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>Settle Escrow &amp; Unlock</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-space-xl text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">inventory_2</span>
          </div>
          <h2 className="text-headline-md font-headline-md font-semibold text-on-surface">
            No Deliverables Yet
          </h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant max-w-md mx-auto mt-1 mb-space-md">
            Submit a project requirement and complete the escrow milestones to unlock your full artifacts vault.
          </p>
          <Link
            to="/client/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Start a Project</span>
          </Link>
        </div>
      )}
    </div>
  );
}
