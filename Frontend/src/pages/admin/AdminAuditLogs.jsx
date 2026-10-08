import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/api/admin/audit-logs");
        if (res.data?.success) {
          setLogs(res.data.logs || []);
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-space-lg">
      <div className="pb-space-sm border-b border-outline-variant">
        <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
          System Audit Trail &amp; Governance Ledger
        </h1>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
          Cryptographically recorded log of administrative decisions, quotation approvals, escrow events, and Git commit tags.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-space-md">Event Timestamp</th>
                <th className="py-2.5 px-space-md">Operation</th>
                <th className="py-2.5 px-space-md">Actor</th>
                <th className="py-2.5 px-space-md">Project Scope</th>
                <th className="py-2.5 px-space-md">Audit Context Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-space-md font-code-xs text-code-xs text-on-surface-variant">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-code-xs text-code-xs font-bold text-on-surface bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-space-md font-headline-sm text-headline-sm font-semibold text-on-surface">
                    {log.users?.name || "System Automated"}
                  </td>
                  <td className="py-3 px-space-md font-code-xs text-code-xs text-secondary font-bold">
                    {log.projects?.project_number || "—"}
                  </td>
                  <td className="py-3 px-space-md text-body-sm font-body-sm text-on-surface-variant">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
