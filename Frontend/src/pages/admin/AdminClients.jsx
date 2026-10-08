import React, { useState, useEffect } from "react";
import api from "../../services/api";

export default function AdminClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get("/api/admin/clients");
        if (res.data?.success) {
          setClients(res.data.clients || []);
        }
      } catch (err) {
        console.error("Failed to load clients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div className="space-y-space-lg">
      <div className="pb-space-sm border-b border-outline-variant">
        <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
          Client Directory &amp; Academic Affiliations
        </h1>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
          Complete roster of registered engineering students, researcher accounts, and referral network links.
        </p>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-space-md">Client Name &amp; Role</th>
                <th className="py-2.5 px-space-md">Academic Institute</th>
                <th className="py-2.5 px-space-md">Contact Coordinates</th>
                <th className="py-2.5 px-space-md">Referral Code</th>
                <th className="py-2.5 px-space-md text-right">Commissioned Projects</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {clients.map((c) => (
                <tr key={c.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-space-md">
                    <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{c.name}</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant capitalize">{c.user_type}</p>
                  </td>
                  <td className="py-3 px-space-md">
                    <p className="font-headline-sm text-headline-sm text-on-surface">{c.college || "Unspecified College"}</p>
                    <p className="text-label-sm font-label-sm text-on-surface-variant">{c.university || ""}</p>
                  </td>
                  <td className="py-3 px-space-md font-code-xs text-code-xs text-on-surface">
                    <p>{c.email}</p>
                    <p className="text-on-surface-variant">{c.mobile || "No phone"}</p>
                  </td>
                  <td className="py-3 px-space-md font-code-sm text-code-sm font-bold text-secondary">
                    {c.referral_code || "—"}
                  </td>
                  <td className="py-3 px-space-md text-right">
                    <span className="px-2 py-0.5 rounded font-label-sm text-label-sm font-semibold bg-surface-container text-on-surface border border-outline-variant">
                      {c.projects?.length || 0} project{c.projects?.length === 1 ? "" : "s"}
                    </span>
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
