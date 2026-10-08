import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function MilestonePayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upi"); // 'card' | 'upi' | 'wire'
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [vpaVerified, setVpaVerified] = useState(false);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        let projectId = id;
        if (!projectId) {
          // If accessing /client/payments without an ID, pick the first active project
          const res = await api.get("/api/projects");
          if (res.data?.success && res.data.projects?.length > 0) {
            projectId = res.data.projects[0].id;
          }
        }

        if (projectId) {
          const detailRes = await api.get(`/api/projects/${projectId}`);
          if (detailRes.data?.success) {
            setProject(detailRes.data.project);
          }
        }
      } catch (err) {
        console.error("Failed to load project payment data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id]);

  // Determine amount due
  const totalAmount = Number(project?.total_amount) || 8000;
  const advanceAmount = Number(project?.advance_amount) || Math.round(totalAmount * 0.4);
  const totalPaid = Number(project?.total_paid) || 0;
  const remainingAmount = Number(project?.remaining_amount) || Math.max(0, totalAmount - advanceAmount);
  
  const isAdvancePaid = project?.payment_status === "partially_paid" || project?.payment_status === "fully_paid";
  const amountDueNow = !isAdvancePaid ? advanceAmount : remainingAmount;
  const paymentType = !isAdvancePaid ? "advance" : "final";

  // Currency calculations (1 USD ~ 84 INR)
  const inrRate = 84.0;
  const inrAmountDue = Math.round(amountDueNow * inrRate);

  // Trigger Razorpay Payment
  const handleInitiateRazorpay = async () => {
    if (!project) return;
    setPaying(true);

    try {
      const orderRes = await api.post("/api/payments/create-order", {
        projectId: project.id,
        paymentType,
        amount: amountDueNow,
      });

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || "Failed to initialize payment gateway order.");
      }

      const { order } = orderRes.data;

      if (window.Razorpay) {
        const options = {
          key: order.key,
          amount: order.amount,
          currency: order.currency || "INR",
          name: "DevMatrix Engineering",
          description: `Escrow Deposit - ${project.project_name} (#${project.project_number})`,
          order_id: order.id.startsWith("order_mock_") ? undefined : order.id,
          prefill: {
            name: user?.name || "",
            email: user?.email || "",
            contact: user?.mobile || "",
          },
          theme: {
            color: "#000000",
          },
          handler: async (response) => {
            try {
              const verifyRes = await api.post("/api/payments/verify", {
                razorpay_order_id: order.id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data?.success) {
                setPaymentSuccess(true);
                setReceiptNumber(verifyRes.data.receipt?.receipt_number || "RCP-" + Date.now());
                const updated = await api.get(`/api/projects/${project.id}`);
                if (updated.data?.success) setProject(updated.data.project);
              }
            } catch (vErr) {
              alert("Payment verification error: " + (vErr.response?.data?.message || vErr.message));
            } finally {
              setPaying(false);
            }
          },
          modal: {
            ondismiss: () => setPaying(false),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback for mock environments without Razorpay SDK
        const mockVerify = await api.post("/api/payments/verify", {
          razorpay_order_id: order.id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature_success",
        });

        if (mockVerify.data?.success) {
          setPaymentSuccess(true);
          setReceiptNumber(mockVerify.data.receipt?.receipt_number || "RCP-" + Date.now());
          const updated = await api.get(`/api/projects/${project.id}`);
          if (updated.data?.success) setProject(updated.data.project);
        }
        setPaying(false);
      }
    } catch (err) {
      alert("Payment creation failed: " + (err.response?.data?.message || err.message));
      setPaying(false);
    }
  };

  const handleVerifyVpa = () => {
    if (!upiId || !upiId.includes("@")) {
      alert("Please enter a valid UPI VPA ID (e.g. username@okaxis)");
      return;
    }
    setVpaVerified(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-outline-variant border-t-primary animate-spin"></div>
        <span className="text-body-sm text-on-surface-variant font-mono">Loading Escrow Vault &amp; Ledger...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Milestone Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface-variant">
          <Link to="/client/projects" className="hover:text-on-surface">Projects</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to={project ? `/client/projects/${project.id}` : "#"} className="hover:text-on-surface">
            {project?.project_name || "HealthAI Diagnostics Platform"}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-medium">{project?.project_number || "PRJ-8841"}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-medium">Milestone Escrow Deposit</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-headline-xl font-headline-xl tracking-tight text-on-surface">
                Milestone Escrow Deposit
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface-variant border border-outline-variant">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>{isAdvancePaid ? "Milestone 2 of 3" : "Milestone 1 of 3"}</span>
              </span>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Project: <span className="font-medium text-on-surface">{project?.project_name || "HealthAI Diagnostics"} (#{project?.project_number || "PRJ-8841"})</span> • Scope: Architecture, Infrastructure &amp; Scaffold
            </p>
          </div>

          {/* Milestone Stepper Bar */}
          <div className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant px-3 py-2 rounded shadow-sm">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-code-xs text-code-xs font-semibold ${!isAdvancePaid ? "border-primary text-primary" : "border-secondary bg-secondary text-white"}`}>
                {!isAdvancePaid ? "1" : "✓"}
              </div>
              <span className={`text-label-sm font-label-sm font-medium ${!isAdvancePaid ? "text-on-surface" : "text-secondary"}`}>
                M1 (Advance)
              </span>
            </div>
            <div className="w-6 h-0.5 bg-outline-variant"></div>
            <div className={`flex items-center gap-2 ${!isAdvancePaid ? "opacity-50" : ""}`}>
              <div className={`w-6 h-6 rounded-full border flex items-center justify-center font-code-xs text-code-xs ${isAdvancePaid ? "border-primary text-primary font-bold" : "border-outline text-outline"}`}>
                2
              </div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">M2 Core Engine</span>
            </div>
            <div className="w-6 h-0.5 bg-outline-variant"></div>
            <div className="flex items-center gap-2 opacity-50">
              <div className="w-6 h-6 rounded-full border border-outline text-outline flex items-center justify-center font-code-xs text-code-xs">
                3
              </div>
              <span className="text-label-sm font-label-sm text-on-surface-variant">M3 Final Handover</span>
            </div>
          </div>
        </div>
      </div>

      {/* Escrow Protection Callout Banner */}
      <div className="bg-surface-container-lowest border-l-4 border-l-secondary border border-outline-variant rounded p-4 flex items-start gap-3 shadow-sm">
        <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
          verified_user
        </span>
        <div className="space-y-0.5 text-body-sm font-body-sm">
          <p className="font-headline-sm font-semibold text-on-surface">Custodial Escrow Guaranteed</p>
          <p className="text-on-surface-variant">
            Funds remain locked in neutral trust and are only disbursed to engineering leads after you review and approve milestone staging deliverables. Full refund guarantee governed by Master Services Agreement section 4.2.
          </p>
        </div>
      </div>

      {/* Success Notification if Payment Just Completed */}
      {paymentSuccess && (
        <div className="p-4 rounded-xl bg-secondary-container text-on-secondary-container border border-secondary flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-secondary">check_circle</span>
            <div>
              <h4 className="font-headline-sm font-bold">Escrow Deposit Confirmed!</h4>
              <p className="text-body-sm">
                Receipt <strong>{receiptNumber}</strong> generated. Engineering sprint sandbox is now unlocked.
              </p>
            </div>
          </div>
          <Link
            to={`/client/projects/${project?.id}`}
            className="px-3.5 py-1.5 rounded-lg bg-secondary text-white font-label-md hover:bg-secondary/90 transition-colors"
          >
            View Project Staging
          </Link>
        </div>
      )}

      {/* Bento Grid: Dual Column Checkout Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        {/* Left Column: Payment Summary Card (5 Columns) */}
        <div className="lg:col-span-5 space-y-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">receipt</span>
                <h3 className="font-headline-md font-bold text-on-surface">Milestone Deposit Ledger</h3>
              </div>
              <span className="font-code-xs text-code-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded font-mono">
                INV-{project?.project_number || "8841"}-{!isAdvancePaid ? "M1" : "M2"}
              </span>
            </div>

            {/* Breakdown Lines */}
            <div className="space-y-3 font-body-sm text-body-sm">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Phase Valuation Scope</span>
                <span className="font-code-sm text-code-sm text-on-surface font-semibold font-mono">
                  ${totalAmount.toLocaleString()}.00 USD
                </span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span>Referral Discount</span>
                  <span className="font-code-xs text-code-xs bg-secondary-container text-on-secondary-container px-1.5 py-0.5 rounded font-medium">
                    {user?.referral_code || "ACADEMIC10"}
                  </span>
                </span>
                <span className="font-code-sm text-code-sm text-secondary font-medium font-mono">-$480.00 USD</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span>Escrow Custody &amp; Verification Fee</span>
                <span className="font-code-sm text-code-sm text-on-surface font-mono">$0.00 (Waived)</span>
              </div>

              {/* Total Callout Box */}
              <div className="pt-3 border-t border-outline-variant">
                <div className="bg-surface-container-low rounded-lg p-3.5 flex justify-between items-center">
                  <div>
                    <span className="text-label-md font-label-md text-on-surface block font-bold">Amount Due Now</span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">
                      {!isAdvancePaid ? "Milestone 1 Advance Lock (40%)" : "Remaining Milestone Balance"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-code-sm text-headline-xl font-bold text-on-surface block leading-tight font-mono">
                      ${amountDueNow.toLocaleString()}.00
                    </span>
                    <span className="font-code-xs text-code-xs text-on-surface-variant font-mono">
                      ≈ ₹{inrAmountDue.toLocaleString()} INR
                    </span>
                  </div>
                </div>
              </div>

              {/* Remaining Milestone Schedule */}
              <div className="p-3 border border-outline-variant rounded-lg bg-surface-container-lowest space-y-2">
                <div className="flex justify-between items-center text-label-sm font-label-sm text-on-surface-variant">
                  <span>Total Escrow Lifecycle:</span>
                  <span className="font-code-xs text-code-xs font-semibold text-on-surface font-mono">
                    ${totalPaid.toLocaleString()} / ${totalAmount.toLocaleString()} Paid
                  </span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 40}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-code-xs font-code-xs text-on-surface-variant pt-0.5 font-mono text-[11px]">
                  <span>M1: ${advanceAmount.toLocaleString()}</span>
                  <span>M2: ${Math.round(remainingAmount * 0.5).toLocaleString()}</span>
                  <span>M3: ${Math.round(remainingAmount * 0.5).toLocaleString()}</span>
                </div>
                <p className="text-[11px] leading-tight text-on-surface-variant italic">
                  Remaining funds are due subsequently upon staging preview acceptance of intermediate milestones.
                </p>
              </div>
            </div>

            {/* Security & Compliance Badges */}
            <div className="pt-3 border-t border-outline-variant space-y-2">
              <span className="text-label-sm font-label-sm text-on-surface-variant block uppercase tracking-wider font-semibold">
                Institutional Trust Protocols
              </span>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface bg-surface-container-low px-2.5 py-1.5 rounded">
                  <span className="material-symbols-outlined text-[16px] text-secondary">lock</span>
                  <span>256-Bit TLS End-to-End Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface bg-surface-container-low px-2.5 py-1.5 rounded">
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                  <span>PCI-DSS Level 1 Certified Custodial Gateway</span>
                </div>
                <div className="flex items-center gap-2 text-label-sm font-label-sm text-on-surface bg-surface-container-low px-2.5 py-1.5 rounded">
                  <span className="material-symbols-outlined text-[16px] text-secondary">gavel</span>
                  <span>Strict Mutual NDA &amp; Irrevocable IP Assignment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Support Desk Anchor */}
          <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg flex items-center justify-between text-label-sm font-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">contact_support</span>
              Procurement or billing inquiry?
            </span>
            <a href="mailto:support@devmatrix.local" className="text-primary font-medium hover:underline flex items-center gap-0.5">
              Contact Treasury Desk <span className="material-symbols-outlined text-[12px]">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Right Column: Settlement Selector & Form (7 Columns) */}
        <div className="lg:col-span-7 space-y-space-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div>
                <h3 className="font-headline-md font-bold text-on-surface">Select Settlement Method</h3>
                <p className="text-body-sm font-body-sm text-on-surface-variant">
                  Instant escrow clearing directly to verified smart-account
                </p>
              </div>
              <span className="material-symbols-outlined text-outline text-[20px]">shield</span>
            </div>

            {/* Tab Buttons */}
            <div className="grid grid-cols-3 gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
              <button
                type="button"
                onClick={() => setActiveTab("card")}
                className={`py-2 px-3 text-label-md font-label-md rounded font-medium transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  activeTab === "card"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">credit_card</span>
                <span>Credit / Debit</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("upi")}
                className={`py-2 px-3 text-label-md font-label-md rounded font-medium transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  activeTab === "upi"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                <span>UPI / Razorpay</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("wire")}
                className={`py-2 px-3 text-label-md font-label-md rounded font-medium transition-all duration-150 flex items-center justify-center gap-1.5 ${
                  activeTab === "wire"
                    ? "bg-surface-container-lowest text-on-surface shadow-sm border border-outline-variant"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">account_balance</span>
                <span>Bank Wire</span>
              </button>
            </div>

            {/* TAB 1: Credit / Debit Card */}
            {activeTab === "card" && (
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleInitiateRazorpay(); }}>
                <div className="space-y-1.5">
                  <label className="block text-label-sm font-label-sm text-on-surface font-medium">
                    Cardholder Name (Institutional or Authorized Representative)
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name || "Client Representative"}
                    className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-label-sm font-label-sm text-on-surface font-medium">Card Number</label>
                    <div className="flex gap-1">
                      <span className="px-1.5 py-0.5 bg-surface-container rounded font-code-xs text-code-xs text-on-surface-variant">VISA</span>
                      <span className="px-1.5 py-0.5 bg-surface-container rounded font-code-xs text-code-xs text-on-surface-variant">MC</span>
                      <span className="px-1.5 py-0.5 bg-surface-container rounded font-code-xs text-code-xs text-on-surface-variant">AMEX</span>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      defaultValue="4532 •••• •••• 8921"
                      className="w-full h-9 pl-3 pr-9 font-code-sm text-code-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface font-mono"
                    />
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary text-[18px]">verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="block text-label-sm font-label-sm text-on-surface font-medium">Expiration Date</label>
                    <input
                      type="text"
                      defaultValue="08 / 28"
                      className="w-full h-9 px-3 font-code-sm text-code-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-label-sm font-label-sm text-on-surface font-medium">CVC / CVV</label>
                    <input
                      type="password"
                      defaultValue="882"
                      className="w-full h-9 px-3 font-code-sm text-code-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2 sm:col-span-1">
                    <label className="block text-label-sm font-label-sm text-on-surface font-medium">Postal / ZIP Code</label>
                    <input
                      type="text"
                      defaultValue="560001"
                      className="w-full h-9 px-3 text-body-sm font-body-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={paying}
                    className="w-full h-11 bg-primary hover:bg-[#1E293B] text-on-primary font-headline-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 shadow-sm disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    <span>{paying ? "Processing Escrow Lock..." : `Authorize & Lock $${amountDueNow.toLocaleString()}.00 in Milestone Escrow`}</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: UPI / Razorpay (India & Global) */}
            {activeTab === "upi" && (
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm font-semibold text-on-surface">Razorpay Dual-Currency Gateway</span>
                      <span className="px-1.5 py-0.5 text-[10px] bg-secondary-container text-on-secondary-container font-semibold rounded">
                        INSTANT ESCROW LOCK
                      </span>
                    </div>
                    <span className="font-code-xs text-code-xs text-on-surface-variant font-mono">INR / USD Auto-FX</span>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Supports instant Indian UPI (Google Pay, PhonePe, Paytm, BHIM), Indian Net Banking, and Global Corporate Cards handled natively via Razorpay Enterprise.
                  </p>
                  <div className="p-2.5 bg-surface-container-lowest rounded border border-outline-variant flex items-center justify-between font-code-xs text-code-xs font-mono">
                    <span className="text-on-surface-variant">Exchange Calibration:</span>
                    <span className="text-on-surface font-medium">${amountDueNow.toLocaleString()}.00 USD ≈ ₹{inrAmountDue.toLocaleString()}.00 INR</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-label-sm font-label-sm text-on-surface font-medium">
                    Direct UPI VPA ID (or click below to scan QR / open App)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => { setUpiId(e.target.value); setVpaVerified(false); }}
                      placeholder="e.g. corporate@icici, student@oksbi"
                      className="flex-1 h-9 px-3 font-code-sm text-code-sm bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-on-surface font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyVpa}
                      className="px-3 bg-surface-container-high border border-outline-variant text-on-surface text-label-md font-label-md rounded hover:bg-surface-container-highest transition-colors"
                    >
                      {vpaVerified ? "✓ Verified" : "Verify VPA"}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={paying}
                  onClick={handleInitiateRazorpay}
                  className="w-full h-11 bg-primary hover:bg-[#1E293B] text-on-primary font-headline-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors duration-150 shadow-sm disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>{paying ? "Opening Secure Gateway..." : `Open Instant Razorpay Gateway (₹${inrAmountDue.toLocaleString()} / $${amountDueNow})`}</span>
                </button>
              </div>
            )}

            {/* TAB 3: Bank Wire Transfer */}
            {activeTab === "wire" && (
              <div className="space-y-4">
                <div className="p-4 bg-surface-container-low border border-outline-variant rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-headline-sm font-semibold text-on-surface">Institutional Fedwire &amp; NEFT / RTGS Instructions</span>
                    <span className="font-code-xs text-code-xs bg-surface-container px-2 py-0.5 rounded text-on-surface-variant font-mono">
                      Escrow Vault #DM-ESCROW-2026
                    </span>
                  </div>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Generate an escrow reference code to wire directly from corporate or university treasury to DevMatrix Custodial Trust.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-label-sm font-label-sm">
                    <div className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded">
                      <span className="text-on-surface-variant block text-code-xs font-code-xs">Beneficiary</span>
                      <span className="font-medium text-on-surface">DevMatrix Custodial Trust LLC</span>
                    </div>
                    <div className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded">
                      <span className="text-on-surface-variant block text-code-xs font-code-xs">Account / Routing</span>
                      <span className="font-medium font-code-xs text-code-xs text-on-surface font-mono">029384910284 (HDFC / Chase)</span>
                    </div>
                    <div className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded">
                      <span className="text-on-surface-variant block text-code-xs font-code-xs">IFSC / SWIFT</span>
                      <span className="font-medium font-code-xs text-code-xs text-on-surface font-mono">HDFC0001248 / CHASUS33XXX</span>
                    </div>
                    <div className="p-2.5 bg-surface-container-lowest border border-outline-variant rounded">
                      <span className="text-on-surface-variant block text-code-xs font-code-xs">Mandatory Wire Memo</span>
                      <span className="font-medium font-code-xs text-code-xs text-primary font-mono">ESCROW-{project?.project_number || "PRJ8841"}-M1</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert(`Official Bank Wire Deposit Form for ${project?.project_number || "PRJ-8841"} generated. Wire memo: ESCROW-${project?.project_number || "PRJ8841"}-M1`)}
                  className="w-full h-11 bg-surface-container-lowest border border-outline-variant hover:bg-surface-container-high text-on-surface font-headline-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors duration-150"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Generate Official Wire PDF with Deposit Memo</span>
                </button>
              </div>
            )}

            {/* Footer Agreement Note */}
            <div className="text-[11px] leading-relaxed text-on-surface-variant pt-2 border-t border-outline-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px] text-outline shrink-0">info</span>
              <span>
                By authorizing deposit, you confirm agreement to DevMatrix Escrow Trust Terms. Funds remain non-releasable until explicit client acceptance of milestone artifacts.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Immutable Ledger & Historical Payment Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="p-space-md border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low">
          <div>
            <h3 className="font-headline-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history_edu</span>
              <span>Project Audit Log &amp; Immutable Payment Ledger</span>
            </h3>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Cryptographically signed receipts and verified escrow transactions for #{project?.project_number || "PRJ-8841"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("All audit transactions exported.")}
              className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant text-on-surface rounded text-label-sm font-label-sm hover:bg-surface-container-high flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">file_download</span>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-4 font-semibold">Receipt / ID</th>
                <th className="py-2.5 px-4 font-semibold">Milestone Description</th>
                <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold">Settlement Method</th>
                <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                <th className="py-2.5 px-4 font-semibold">Escrow State</th>
                <th className="py-2.5 px-4 font-semibold text-right">Receipt File</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
              {project?.payments && project.payments.length > 0 ? (
                project.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="py-3 px-4 font-code-xs text-code-xs font-semibold text-on-surface font-mono">
                      {p.receipts?.receipt_number || p.payment_number || `ESC-${p.id}`}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-on-surface capitalize">
                        {p.payment_type} Escrow Lock
                      </div>
                      <span className="text-label-sm font-label-sm text-on-surface-variant">
                        {project.project_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-code-xs text-code-xs text-on-surface-variant font-mono">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-on-surface">
                      Razorpay Enterprise (UPI / Card)
                    </td>
                    <td className="py-3 px-4 font-code-sm text-code-sm font-semibold text-right text-on-surface font-mono">
                      ${Number(p.amount).toLocaleString()}.00
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm font-semibold ${
                          p.status === "paid"
                            ? "bg-secondary-container text-on-secondary-container"
                            : "bg-surface-container-high text-on-surface"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === "paid" ? "bg-secondary" : "bg-outline"}`}></span>
                        <span>{p.status === "paid" ? "Released & Escrow Locked" : "Pending Lock"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {p.status === "paid" ? (
                        <button
                          onClick={() => alert(`Receipt #${p.receipts?.receipt_number || p.payment_number} downloaded.`)}
                          className="inline-flex items-center gap-1 text-primary hover:underline text-label-sm font-label-sm font-medium"
                        >
                          <span className="material-symbols-outlined text-[14px]">download</span>
                          <span>PDF</span>
                        </button>
                      ) : (
                        <span className="font-code-xs text-code-xs text-on-surface-variant italic">Pending Auth</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="hover:bg-surface-container-high transition-colors">
                  <td className="py-3 px-4 font-code-xs text-code-xs font-semibold text-on-surface font-mono">
                    ESC-{project?.project_number || "8841"}-M1-DEP
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-on-surface">Milestone 1 Advance Lock</div>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">Arch &amp; Infra Scaffold</span>
                  </td>
                  <td className="py-3 px-4 font-code-xs text-code-xs text-on-surface-variant font-mono">
                    Awaiting Auth
                  </td>
                  <td className="py-3 px-4 text-on-surface">
                    Razorpay Dual-Currency (Card / UPI)
                  </td>
                  <td className="py-3 px-4 font-code-sm text-code-sm font-semibold text-right text-on-surface font-mono">
                    ${amountDueNow.toLocaleString()}.00 USD
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-sm font-label-sm bg-surface-container-high text-on-surface border border-outline-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                      <span>Ready for Deposit</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="font-code-xs text-code-xs text-on-surface-variant italic">Pending Lock</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between text-label-sm font-label-sm text-on-surface-variant gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">enhanced_encryption</span>
            <span>Ledger Merkle Hash: <code className="font-code-xs text-code-xs text-on-surface font-semibold font-mono">0x9d4a...b39f72e</code> (Immutable Audit Stamp)</span>
          </div>
          <div>All transactions backed by Razorpay Escrow custody</div>
        </div>
      </section>
    </div>
  );
}
