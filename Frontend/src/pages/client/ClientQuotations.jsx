import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ClientQuotations() {
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

  const quotations = projects.flatMap((p) =>
    (p.quotations || []).map((q) => ({ ...q, project: p }))
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return "bg-secondary-container text-on-secondary-container";
      case "sent":
      case "pending":
        return "bg-tertiary-fixed text-on-tertiary-fixed";
      case "rejected":
        return "bg-error-container text-on-error-container";
      default:
        return "bg-surface-container-high text-on-surface";
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-on-surface-variant font-body-sm">
        Loading quotations...
      </div>
    );
  }

  return (
    <div className="space-y-space-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
        <div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
            Formal Quotations
          </h1>
          <p className="text-body-md font-body-md text-on-surface-variant mt-0.5">
            Review and accept engineering proposals tied to your project escrow.
          </p>
        </div>
        <Link
          to="/client/projects/new"
          className="h-9 px-3.5 text-label-md font-label-md bg-primary text-on-primary hover:bg-[#1E293B] rounded-md transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">add_task</span>
          <span>Submit New Requirement</span>
        </Link>
      </div>

      {/* Quotations Table */}
      {quotations.length === 0 ? (
        <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl p-space-xl text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-surface-container text-primary flex items-center justify-center mx-auto mb-3">
            <span className="material-symbols-outlined text-2xl">receipt_long</span>
          </div>
          <h2 className="text-headline-md font-headline-md font-semibold text-on-surface">
            No Quotations Yet
          </h2>
          <p className="text-body-sm font-body-sm text-on-surface-variant max-w-md mx-auto mt-1 mb-space-md">
            Once your project requirements are reviewed by our engineering team, a formal quotation will appear here for your approval.
          </p>
          <Link
            to="/client/projects/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>Submit Requirements</span>
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          <div className="p-space-md border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
            <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">
              All Quotations ({quotations.length})
            </h3>
            <button className="h-8 px-3 text-label-md font-label-md border border-outline-variant rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface flex items-center space-x-1 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download All</span>
            </button>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">
                <th className="py-3 px-space-md font-semibold">Quotation #</th>
                <th className="py-3 px-space-md font-semibold">Project</th>
                <th className="py-3 px-space-md font-semibold text-right">Total Amount</th>
                <th className="py-3 px-space-md font-semibold text-right">Advance Required</th>
                <th className="py-3 px-space-md font-semibold">Status</th>
                <th className="py-3 px-space-md font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-space-md font-code-sm text-code-sm font-semibold text-on-surface">
                    #QUO-{q.id}
                  </td>
                  <td className="py-3 px-space-md">
                    <div className="font-medium text-on-surface">{q.project.project_name}</div>
                    <div className="text-label-sm font-label-sm text-on-surface-variant font-code-xs">
                      #{q.project.project_number}
                    </div>
                  </td>
                  <td className="py-3 px-space-md text-right font-code-sm text-code-sm font-semibold text-on-surface">
                    ₹{Number(q.total_amount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-space-md text-right font-code-sm text-code-sm font-semibold text-secondary">
                    ₹{Number(q.advance_amount_required).toLocaleString("en-IN")}
                  </td>
                  <td className="py-3 px-space-md">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm font-semibold capitalize ${getStatusBadge(q.status)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-space-md text-right">
                    <Link
                      to={`/client/projects/${q.project.id}`}
                      className="inline-flex items-center gap-1 text-label-md font-label-md text-primary hover:underline font-medium"
                    >
                      <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      <span>View & Accept</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
