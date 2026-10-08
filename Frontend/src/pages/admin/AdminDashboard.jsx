import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/admin/stats");
        if (res.data?.success) {
          setStats(res.data.stats);
          setRecentProjects(res.data.recent_projects || []);
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-space-lg">
      {/* Top Banner */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-label-sm font-label-sm text-on-surface mb-2">
            <span className="material-symbols-outlined text-sm text-secondary">security</span>
            <span>Master Operations Control Console</span>
          </div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
            Admin Operations Command Center
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Review incoming project requirements, generate binding quotations, track Razorpay escrow, and manage staging deployments.
          </p>
        </div>
        <Link
          to="/admin/projects"
          className="h-9 px-4 rounded-lg bg-primary text-on-primary hover:bg-[#1E293B] text-label-md font-label-md font-medium transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
        >
          <span>Open Project Workspace</span>
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </section>

      {/* Metric Cards Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Total Commissioned</span>
            <span className="material-symbols-outlined text-base">folder_managed</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-on-surface">{stats?.total_projects || 0}</p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">{stats?.active_projects || 0} currently in development</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Gross Platform Escrow</span>
            <span className="material-symbols-outlined text-base text-secondary">payments</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-secondary font-code-sm">
            ₹{Number(stats?.total_revenue || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Settled via Razorpay custody</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Active Students / Clients</span>
            <span className="material-symbols-outlined text-base">group</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-on-surface">{stats?.total_clients || 0}</p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Verified college accounts</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Completed Packages</span>
            <span className="material-symbols-outlined text-base text-secondary">verified</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-on-surface">{stats?.completed_projects || 0}</p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Unlocked 6-in-1 artifact vaults</p>
        </div>
      </section>

      {/* Recent Review Queue */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-outline-variant flex items-center justify-between">
          <div>
            <h2 className="text-headline-sm font-headline-sm font-bold text-on-surface">Recent Intake Queue &amp; SOWs</h2>
            <p className="text-label-sm font-label-sm text-on-surface-variant">Incoming client requirement submissions awaiting review</p>
          </div>
          <Link to="/admin/projects" className="text-label-sm font-label-sm text-primary font-medium hover:underline">
            View All Projects
          </Link>
        </div>

        {recentProjects.length > 0 ? (
          <div className="divide-y divide-outline-variant/60">
            {recentProjects.map((proj) => (
              <div key={proj.id} className="p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low/40 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-code-xs text-code-xs font-semibold px-1.5 py-0.5 rounded bg-surface-container text-on-surface">
                      {proj.project_number}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm text-label-sm font-label-sm font-semibold bg-secondary-container text-on-secondary-container uppercase">
                      {proj.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{proj.project_name}</h3>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Client: {proj.users?.name || "Client"} · {proj.users?.college || "Academic Tier"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={`/client/projects/${proj.id}`}
                    className="h-8 px-3 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-label-sm font-label-sm text-on-surface flex items-center gap-1 transition-colors"
                  >
                    <span>Inspect</span>
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-on-surface-variant text-body-sm">
            No projects currently pending review.
          </div>
        )}
      </section>
    </div>
  );
}
