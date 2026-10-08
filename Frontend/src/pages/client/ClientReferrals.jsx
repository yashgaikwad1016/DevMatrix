import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function ClientReferrals() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/api/referrals/stats");
        if (res.data?.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load referral stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const referralCode = stats?.referral_code || user?.referral_code || "REF-DX-9824";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-space-lg">
      <div className="pb-space-sm border-b border-outline-variant">
        <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
          Partner Network &amp; Referral Program
        </h1>
        <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
          Share your referral code with college peers to unlock 10–15% instant discounts on their project quotations.
        </p>
      </div>

      {/* Main Referral Card */}
      <div className="bg-surface-container-high border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">card_giftcard</span>
            </div>
            <div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-medium border border-outline-variant mb-1">
                DevMatrix Partner Network
              </span>
              <h2 className="text-headline-lg font-headline-lg text-on-surface">Earn While You Build</h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant max-w-xl mt-0.5">
                Peers receive 10–15% milestone discounts, and you earn credit toward your project milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3.5 py-2 bg-surface-container-lowest border border-outline-variant rounded font-code-sm text-code-sm text-on-surface tracking-wider font-semibold">
              {referralCode}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="h-9 px-3.5 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>{copied ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Referred Peers</span>
            <span className="material-symbols-outlined text-base">group</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-on-surface">{stats?.total_referred || 0}</p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Accounts registered with your code</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Active Sprints</span>
            <span className="material-symbols-outlined text-base text-secondary">verified</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-secondary">{stats?.successful_referrals || 0}</p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Projects with confirmed escrow</p>
        </div>

        <div className="bg-surface-container-lowest p-space-md rounded-xl border border-outline-variant shadow-sm space-y-1">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider">Peer Savings Delivered</span>
            <span className="material-symbols-outlined text-base text-primary">savings</span>
          </div>
          <p className="text-headline-xl font-headline-xl font-bold text-on-surface font-code-sm">
            ₹{Number(stats?.total_savings_generated || 0).toLocaleString("en-IN")}
          </p>
          <p className="text-label-sm font-label-sm text-on-surface-variant">Total discount savings passed to peers</p>
        </div>
      </div>

      {/* Referral Log */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-sm space-y-space-sm">
        <h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">Referral Activity Log</h3>
        {stats?.referrals && stats.referrals.length > 0 ? (
          <div className="divide-y divide-outline-variant/60 text-body-sm font-body-sm">
            {stats.referrals.map((ref) => (
              <div key={ref.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{ref.referred_user}</p>
                  <p className="text-on-surface-variant text-label-sm font-label-sm">{new Date(ref.created_at).toLocaleDateString()}</p>
                </div>
                <span className="px-2 py-0.5 rounded font-label-sm text-label-sm bg-surface-container text-on-surface border border-outline-variant">
                  {ref.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm font-body-sm text-on-surface-variant text-center py-6">
            No referral activities yet. Share your code with fellow engineering students!
          </p>
        )}
      </div>
    </div>
  );
}
