import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  // Interactive Calculator State
  const [scopeTier, setScopeTier] = useState("fullstack"); // mvp, fullstack, enterprise
  const [techStack, setTechStack] = useState("web");
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includePpt, setIncludePpt] = useState(true);
  const [includePriority, setIncludePriority] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Price calculations
  const calculateTotal = () => {
    let base =
      scopeTier === "mvp" ? 1800 : scopeTier === "fullstack" ? 2800 : 4200;
    if (techStack === "aiml") base += 500;
    if (techStack === "mobile") base += 400;
    if (includeDocs) base += 300;
    if (includePpt) base += 250;
    if (includePriority) base += 450;
    return base;
  };

  const total = calculateTotal();
  const m1 = Math.round(total * 0.4);
  const m2 = Math.round(total * 0.4);
  const m3 = total - m1 - m2;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("REF-DX-9824");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-space-xl">
      {/* ==================== HERO SECTION ==================== */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center pt-space-lg pb-space-lg">
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Live status ticker pill */}
          <div className="inline-flex items-center gap-space-xs self-start px-2.5 py-1 rounded-sm bg-surface-container-lowest border border-outline-variant text-on-surface font-label-sm text-label-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-code-xs text-code-xs text-secondary font-medium">
              ESCROW VERIFIED
            </span>
            <span className="text-outline">·</span>
            <span>Zero upfront risk via structured milestones</span>
          </div>

          <div className="flex flex-col gap-space-sm">
            <h1 className="font-headline-xl text-headline-xl sm:text-[34px] sm:leading-[42px] font-semibold text-on-surface tracking-tight max-w-2xl">
              From specification to production-ready software, delivered with
              milestone certainty.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              A transparent engineering service where clients commission custom
              software, inspect live staging previews, pay in milestone stages,
              and receive verified source code, IEEE reports, PPTs, and setup
              guides.
            </p>
          </div>

          {/* Hero Actions */}
          <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
            <Link
              to="/register"
              className="h-10 px-4 bg-primary text-on-primary border border-transparent rounded hover:bg-inverse-surface transition-colors flex items-center gap-2 font-headline-sm text-headline-sm shadow-sm"
            >
              <span>Submit Requirements</span>
              <span
                className="material-symbols-outlined text-base"
                data-icon="arrow_forward"
              >
                arrow_forward
              </span>
            </Link>
            <a
              href="#live-preview-section"
              className="h-10 px-4 bg-surface-container-lowest text-on-surface border border-outline-variant rounded hover:bg-surface-container-high transition-colors flex items-center gap-2 font-headline-sm text-headline-sm"
            >
              <span
                className="material-symbols-outlined text-base"
                data-icon="visibility"
              >
                visibility
              </span>
              <span>Explore Live Demo &amp; Portfolio</span>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-space-sm pt-space-md border-t border-outline-variant max-w-lg">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-sm text-secondary"
                  data-icon="schedule"
                >
                  schedule
                </span>
                48-Hr Quotation
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Guaranteed SLA review
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-sm text-secondary"
                  data-icon="lock"
                >
                  lock
                </span>
                Milestone Escrow
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Release funds on approval
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-1">
                <span
                  className="material-symbols-outlined text-sm text-secondary"
                  data-icon="verified"
                >
                  verified
                </span>
                100% Deliverables
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Complete artifact bundle
              </span>
            </div>
          </div>
        </div>

        {/* Interface Preview Card (Realistic Ultra-clean Product Mockup) */}
        <div className="lg:col-span-5" id="live-preview-section">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md shadow-[0_4px_6px_-1px_rgba(0,0,0,0.06),0_2px_4px_-2px_rgba(0,0,0,0.04)]">
            {/* Mockup Window Bar */}
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                <span className="ml-2 font-code-xs text-code-xs text-on-surface-variant">
                  preview.devmatrix.dev/prj-8841
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-secondary-container text-on-secondary-container font-label-sm text-label-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
                Milestone 3 / 4 Live
              </span>
            </div>

            {/* Mockup Content */}
            <div className="pt-space-md flex flex-col gap-space-md">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Active Production Build
                  </span>
                  <span className="font-code-xs text-code-xs text-on-surface-variant">
                    Sprint #6 · Commit 8b9f12
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface mt-0.5">
                  HealthAI Diagnostics Platform
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Multi-modal clinical model deployment with HIPAA compliance
                  hooks
                </p>
              </div>

              {/* Milestone Progress Gauge */}
              <div className="bg-surface p-space-sm rounded-lg border border-outline-variant">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-label-md text-label-md text-on-surface">
                    Milestone Progress
                  </span>
                  <span className="font-code-sm text-code-sm font-semibold text-secondary">
                    72% Completed
                  </span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2">
                  <div
                    className="bg-secondary h-2 rounded-full"
                    style={{ width: "72%" }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-2 font-label-sm text-label-sm text-on-surface-variant">
                  <span>Phase 1: Architecture (Done)</span>
                  <span>Phase 2: Core ML (Done)</span>
                  <span className="font-medium text-on-surface">
                    Phase 3: Staging
                  </span>
                </div>
              </div>

              {/* Live Staging Link Card */}
              <div className="flex items-center justify-between p-2.5 bg-surface-container-low border border-outline-variant rounded">
                <div className="flex items-center gap-2">
                  <span
                    className="material-symbols-outlined text-secondary"
                    data-icon="rocket_launch"
                  >
                    rocket_launch
                  </span>
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface block font-medium">
                      Ephemeral Staging Container
                    </span>
                    <span className="font-code-xs text-code-xs text-on-surface-variant">
                      https://staging-dx88.devmatrix.run
                    </span>
                  </div>
                </div>
                <a
                  href="https://preview.devmatrix.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2 py-1 bg-surface-container-lowest border border-outline-variant rounded text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors flex items-center gap-1"
                >
                  <span>Inspect</span>
                  <span
                    className="material-symbols-outlined text-xs"
                    data-icon="open_in_new"
                  >
                    open_in_new
                  </span>
                </a>
              </div>

              {/* Artifact Checklist */}
              <div>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1.5">
                  Verified Artifact Checklist
                </span>
                <ul className="space-y-1.5 font-body-sm text-body-sm">
                  <li className="flex items-center justify-between py-1 px-2 rounded bg-surface">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <span
                        className="material-symbols-outlined text-secondary text-sm"
                        data-icon="check_circle"
                      >
                        check_circle
                      </span>
                      Docker &amp; FastAPI Backend Repo
                    </span>
                    <span className="font-code-xs text-code-xs text-secondary font-medium">
                      Ready
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-1 px-2 rounded bg-surface">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <span
                        className="material-symbols-outlined text-secondary text-sm"
                        data-icon="check_circle"
                      >
                        check_circle
                      </span>
                      IEEE 830 SRS Document (PDF)
                    </span>
                    <span className="font-code-xs text-code-xs text-secondary font-medium">
                      Validated
                    </span>
                  </li>
                  <li className="flex items-center justify-between py-1 px-2 rounded bg-surface">
                    <span className="flex items-center gap-1.5 text-on-surface">
                      <span
                        className="material-symbols-outlined text-secondary text-sm"
                        data-icon="check_circle"
                      >
                        check_circle
                      </span>
                      Executive Slide Deck (36 slides)
                    </span>
                    <span className="font-code-xs text-code-xs text-secondary font-medium">
                      Completed
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PROBLEM VS SOLUTION GRID ==================== */}
      <section className="pt-space-lg pb-space-lg" id="problem-solution">
        <div className="flex flex-col items-center text-center mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
            Traditional Dev vs DevMatrix
          </span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">
            Why Traditional Freelancing Breaks &amp; How We Fix It
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-1">
            Software outsourcing often fails due to misaligned incentives and
            missing artifacts. DevMatrix replaces ambiguity with cryptographic
            and milestone certainty.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
          {/* Column 1: Client Frustrations */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center gap-2 mb-space-md">
              <span
                className="material-symbols-outlined text-error"
                data-icon="cancel"
              >
                cancel
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                Common Client Frustrations
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              What happens when you rely on unvetted freelance boards or loose
              agency agreements.
            </p>
            <div className="space-y-space-md">
              <div className="p-3 bg-error-container/20 rounded border border-error-container">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  Vanished Contractors &amp; Scope Drift
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Developers disappear halfway through the project after taking
                  50% upfront deposits, leaving code in uncompilable states.
                </p>
              </div>
              <div className="p-3 bg-error-container/20 rounded border border-error-container">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  Zero Technical Documentation
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  No SRS reports, missing architecture diagrams, zero test
                  coverage, and code that cannot be transferred to your internal
                  team or evaluated by examiners.
                </p>
              </div>
              <div className="p-3 bg-error-container/20 rounded border border-error-container">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  "Works on My Machine" Syndrome
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Builds that only function in local dev environments without
                  container configurations, schema scripts, or deployment
                  manifests.
                </p>
              </div>
              <div className="p-3 bg-error-container/20 rounded border border-error-container">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  Continuous Upselling &amp; Hostage Code
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Repositories withheld until unexpected hourly surcharges are
                  settled without verification of completed specs.
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: DevMatrix Architecture */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg shadow-sm">
            <div className="flex items-center gap-2 mb-space-md">
              <span
                className="material-symbols-outlined text-secondary"
                data-icon="check_circle"
              >
                check_circle
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                The DevMatrix Architecture
              </h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Rigorous engineering pipeline enforcing complete transparency at
              every sprint gate.
            </p>
            <div className="space-y-space-md">
              <div className="p-3 bg-surface rounded border border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  Structured Specification Wizard
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Every module, tech choice, endpoint, and deadline is scoped
                  into an authoritative milestone agreement before a dollar is
                  spent.
                </p>
              </div>
              <div className="p-3 bg-surface rounded border border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  Milestone-Based Escrow Payments
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Funds are held in secure escrow. Sprints are paid out only
                  after you inspect and approve functional builds on live
                  staging.
                </p>
              </div>
              <div className="p-3 bg-surface rounded border border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  Continuous Ephemeral Previews
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Every push generates an isolated staging cloud instance. Test
                  UI, API responses, and database integrity in real-time browser
                  environments.
                </p>
              </div>
              <div className="p-3 bg-surface rounded border border-outline-variant">
                <h4 className="font-headline-sm text-headline-sm text-on-surface mb-0.5">
                  The 6-in-1 Artifact Package
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Source code is only step one. Every delivery contains
                  IEEE-formatted reports, presentation decks, video
                  walkthroughs, and Docker builds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6-STEP DELIVERY LIFECYCLE ==================== */}
      <section className="pt-space-lg pb-space-lg" id="how-it-works">
        <div className="flex flex-col items-center text-center mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
            Predictable Execution
          </span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">
            The 6-Step Engineering Lifecycle
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-1">
            Disciplined milestone gates ensure precision engineering from
            initial draft to final production sign-off.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
          {/* Step 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-outline transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-7 h-7 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-code-sm text-code-sm font-semibold">
                  01
                </span>
                <span className="font-code-xs text-code-xs text-on-surface-variant">
                  STEP 01
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                Requirement Submission
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Specify domain targets, desired tech stacks (Next.js, FastAPI,
                PyTorch), AI requirements, and your non-negotiable delivery
                date.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-sm text-secondary"
                data-icon="tune"
              >
                tune
              </span>
              Automated parameter builder
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-outline transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-7 h-7 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-code-sm text-code-sm font-semibold">
                  02
                </span>
                <span className="font-code-xs text-code-xs text-on-surface-variant">
                  STEP 02
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                Formal Scope Quotation
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Our senior engineers return a line-item statement of work with
                milestone timelines, compute architecture, and fixed pricing
                within 48 hours.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-sm text-secondary"
                data-icon="description"
              >
                description
              </span>
              48-hour bound SLA guarantee
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-outline transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-7 h-7 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center font-code-sm text-code-sm font-semibold">
                  03
                </span>
                <span className="font-code-xs text-code-xs text-secondary font-medium">
                  ESCROW GATE
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                Advance Escrow Deposit
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Lock milestone 1 with a 40% escrow commitment. Funds remain in
                custodial lock and are only disbursed upon your preview
                approval.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-sm text-secondary"
                data-icon="shield"
              >
                shield
              </span>
              Protected custodial escrow
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-outline transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-7 h-7 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-code-sm text-code-sm font-semibold">
                  04
                </span>
                <span className="font-code-xs text-code-xs text-on-surface-variant">
                  STEP 04
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                Private Sprint Commits
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Development commences with test-driven methodologies. Watch
                branch activity, continuous integration status, and lint scores
                in real-time.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-sm text-secondary"
                data-icon="commit"
              >
                commit
              </span>
              Clean Git history &amp; audits
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-outline transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-7 h-7 rounded bg-surface-container-high text-on-surface flex items-center justify-center font-code-sm text-code-sm font-semibold">
                  05
                </span>
                <span className="font-code-xs text-code-xs text-on-surface-variant">
                  STEP 05
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                Live Staging Preview
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Receive a dedicated staging link with dummy datasets. Trigger
                change requests or verify that all acceptance criteria are
                fulfilled.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-sm text-secondary"
                data-icon="devices"
              >
                devices
              </span>
              Interactive sandbox testing
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md flex flex-col justify-between hover:border-outline transition-colors shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="w-7 h-7 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center font-code-sm text-code-sm font-semibold">
                  06
                </span>
                <span className="font-code-xs text-code-xs text-secondary font-medium">
                  COMPLETE
                </span>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface mb-1">
                Deliverables Release
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Approve the build, settle remaining escrow, and immediately
                unlock complete git ownership, documentation, presentation
                slides, and setup scripts.
              </p>
            </div>
            <div className="mt-space-md pt-space-sm border-t border-outline-variant flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
              <span
                className="material-symbols-outlined text-sm text-secondary"
                data-icon="lock_open"
              >
                lock_open
              </span>
              Full IP transfer &amp; ZIP manifest
            </div>
          </div>
        </div>
      </section>

      {/* ==================== COMPLETE DELIVERABLES SHOWCASE ==================== */}
      <section className="pt-space-lg pb-space-lg" id="deliverables">
        <div className="flex flex-col items-center text-center mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1">
            Comprehensive Artifact Bundle
          </span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">
            Everything Delivered. Nothing Left to Guess.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-1">
            Every project includes full intellectual property rights and an
            exhaustive 6-part documentation and execution suite.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {/* Artifact Card 1 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface font-code-xs text-code-xs font-semibold">
                  GIT / DOCKER
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="data_object"
                >
                  data_object
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                Production Source Code
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Clean, modular code structure formatted according to PEP8 /
                ESLint / Prettier. Full Git repository history, Dockerfile,
                docker-compose.yml, and environment configs.
              </p>
            </div>
            <div className="pt-space-md border-t border-outline-variant flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
              <span>sha256: 7f8a...92b</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Ready for deployment
              </span>
            </div>
          </div>

          {/* Artifact Card 2 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface font-code-xs text-code-xs font-semibold">
                  IEEE / SRS PDF
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="article"
                >
                  article
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                Academic &amp; Technical Specs
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Rigorous IEEE-standard software requirement specifications
                (SRS), detailed ER diagrams, sequence charts, and mathematical
                model descriptions formatted for academic defense.
              </p>
            </div>
            <div className="pt-space-md border-t border-outline-variant flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
              <span>45-75 Pages PDF</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Standard compliant
              </span>
            </div>
          </div>

          {/* Artifact Card 3 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface font-code-xs text-code-xs font-semibold">
                  PPTX / KEYNOTE
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="slideshow"
                >
                  slideshow
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                Presentation Slide Deck
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Professional, editable slide deck prepared for thesis committee
                defense or project juries. Includes architecture flows,
                comparative benchmarks, and live demo slide flow.
              </p>
            </div>
            <div className="pt-space-md border-t border-outline-variant flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
              <span>30-40 Vector Slides</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Editable graphics
              </span>
            </div>
          </div>

          {/* Artifact Card 4 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface font-code-xs text-code-xs font-semibold">
                  DOCX / PDF
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="menu_book"
                >
                  menu_book
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                Project Architecture Report
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                Complete write-up with literature review, methodology
                comparison, unit testing logs, API endpoint definitions, and
                empirical performance metrics.
              </p>
            </div>
            <div className="pt-space-md border-t border-outline-variant flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
              <span>Editable Word + PDF</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Peer-review level
              </span>
            </div>
          </div>

          {/* Artifact Card 5 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface font-code-xs text-code-xs font-semibold">
                  MP4 / 4K
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="videocam"
                >
                  videocam
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                Demonstration Walkthrough
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                High-definition narrated screencast demonstrating clean system
                setup, terminal build commands, user workflows, and edge-case
                execution.
              </p>
            </div>
            <div className="pt-space-md border-t border-outline-variant flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
              <span>10-15 Min Walkthrough</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Chapter marks
              </span>
            </div>
          </div>

          {/* Artifact Card 6 */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center px-2 py-0.5 rounded-sm bg-surface-container-highest text-on-surface font-code-xs text-code-xs font-semibold">
                  BIN / DB / ENV
                </span>
                <span
                  className="material-symbols-outlined text-on-surface-variant"
                  data-icon="inventory_2"
                >
                  inventory_2
                </span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
                Setup Executables &amp; Seeders
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
                One-click run scripts, populated SQL/NoSQL seeds, Postman API
                collections, and compiled binaries (APK, desktop binaries, or
                server images).
              </p>
            </div>
            <div className="pt-space-md border-t border-outline-variant flex items-center justify-between font-code-xs text-code-xs text-on-surface-variant">
              <span>Postman + Seed Dumps</span>
              <span className="font-label-sm text-label-sm text-secondary font-medium">
                Instant launch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== QUOTATION CALCULATOR / ESTIMATOR ==================== */}
      <section className="pt-space-lg pb-space-lg" id="calculator">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg lg:p-space-xl shadow-sm">
          <div className="max-w-3xl mx-auto flex flex-col gap-space-lg">
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1 block">
                Transparent Estimation
              </span>
              <h2 className="font-headline-xl text-headline-xl text-on-surface">
                Interactive Milestone Budget Estimator
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Configure your project scope parameters below for an instant
                ballpark calculation. Formal binding quotes are guaranteed
                within 48 hours.
              </p>
            </div>

            {/* Interactive Calculator Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm border-t border-outline-variant">
              {/* Left Controls */}
              <div className="flex flex-col gap-space-md">
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1.5">
                    Project Scope Tier
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setScopeTier("mvp")}
                      className={`py-2 px-3 border rounded text-center font-label-md text-label-md transition-colors ${
                        scopeTier === "mvp"
                          ? "border-primary bg-primary text-on-primary font-semibold"
                          : "border-outline-variant bg-surface hover:bg-surface-container-high text-on-surface"
                      }`}
                    >
                      MVP / Core
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeTier("fullstack")}
                      className={`py-2 px-3 border rounded text-center font-label-md text-label-md transition-colors ${
                        scopeTier === "fullstack"
                          ? "border-primary bg-primary text-on-primary font-semibold"
                          : "border-outline-variant bg-surface hover:bg-surface-container-high text-on-surface"
                      }`}
                    >
                      Full Stack
                    </button>
                    <button
                      type="button"
                      onClick={() => setScopeTier("enterprise")}
                      className={`py-2 px-3 border rounded text-center font-label-md text-label-md transition-colors ${
                        scopeTier === "enterprise"
                          ? "border-primary bg-primary text-on-primary font-semibold"
                          : "border-outline-variant bg-surface hover:bg-surface-container-high text-on-surface"
                      }`}
                    >
                      Enterprise
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1.5">
                    Primary Tech Stack
                  </label>
                  <select
                    value={techStack}
                    onChange={(e) => setTechStack(e.target.value)}
                    className="w-full h-9 rounded border border-outline-variant bg-surface-container-lowest font-body-sm text-body-sm text-on-surface px-3 focus:border-primary focus:outline-none"
                  >
                    <option value="web">
                      Full-Stack Web (React/Next.js + Node/Python)
                    </option>
                    <option value="aiml">
                      AI / Machine Learning (PyTorch, LangChain, FastAPI)
                    </option>
                    <option value="mobile">
                      Mobile App (Flutter / React Native + Supabase)
                    </option>
                    <option value="embedded">
                      Embedded &amp; Systems (Rust, C++, IoT Cloud)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1.5">
                    Deliverable Package Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDocs}
                        onChange={(e) => setIncludeDocs(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-0"
                      />
                      <span>
                        IEEE Format SRS &amp; Design Architecture Report
                      </span>
                    </label>
                    <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePpt}
                        onChange={(e) => setIncludePpt(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-0"
                      />
                      <span>
                        Presentation Deck (PPTX) &amp; HD Walkthrough Video
                      </span>
                    </label>
                    <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includePriority}
                        onChange={(e) => setIncludePriority(e.target.checked)}
                        className="rounded border-outline-variant text-primary focus:ring-0"
                      />
                      <span>Priority 14-Day Delivery Fast Track</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Estimate Output Box */}
              <div className="bg-surface p-space-md rounded-lg border border-outline-variant flex flex-col justify-between">
                <div>
                  <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">
                    Estimated Milestone Schedule
                  </span>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="font-headline-xl text-headline-xl sm:text-[32px] font-bold text-on-surface">
                      ₹{(total * 25).toLocaleString()} – ₹
                      {((total + 500) * 25).toLocaleString()}
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      INR estimate
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Split across 3 inspection-verified escrow releases:
                  </p>

                  {/* Milestone breakdown */}
                  <div className="mt-space-md space-y-2 border-t border-outline-variant pt-space-sm font-label-md text-label-md">
                    <div className="flex justify-between text-on-surface">
                      <span>
                        M1: Architecture, DB Schema &amp; Scaffolding (40%)
                      </span>
                      <span className="font-code-sm text-code-sm font-medium">
                        ₹{(m1 * 25).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-on-surface">
                      <span>M2: Core Features &amp; Staging Deploy (40%)</span>
                      <span className="font-code-sm text-code-sm font-medium">
                        ₹{(m2 * 25).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-on-surface">
                      <span>
                        M3: Docs, PPT, Walkthrough &amp; Source Release (20%)
                      </span>
                      <span className="font-code-sm text-code-sm font-medium">
                        ₹{(m3 * 25).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-space-lg pt-space-sm border-t border-outline-variant flex flex-col gap-2">
                  <Link
                    to="/register"
                    className="w-full h-9 bg-primary text-on-primary rounded flex items-center justify-center font-headline-sm text-headline-sm hover:bg-inverse-surface transition-colors"
                  >
                    Lock Estimate &amp; Submit Detailed Spec
                  </Link>
                  <span className="text-center font-code-xs text-code-xs text-on-surface-variant">
                    Quote valid for 14 days · Zero obligation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== REFERRAL & REWARDS PROGRAM ==================== */}
      <section className="pt-space-sm pb-space-sm" id="referrals">
        <div className="bg-surface-container-high border border-outline-variant rounded-xl p-space-lg flex flex-col md:flex-row items-center justify-between gap-space-lg shadow-sm">
          <div className="flex items-start gap-space-md">
            <div className="w-10 h-10 rounded bg-surface-container-lowest border border-outline-variant flex items-center justify-center text-primary flex-shrink-0">
              <span
                className="material-symbols-outlined text-2xl"
                data-icon="card_giftcard"
              >
                card_giftcard
              </span>
            </div>
            <div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container-lowest text-on-surface font-label-sm text-label-sm font-medium border border-outline-variant mb-1">
                DevMatrix Partner Network
              </span>
              <h3 className="font-headline-lg text-headline-lg text-on-surface">
                Earn While You Build
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-1">
                Share your unique client referral code to unlock up to 15%
                discount for your peers and earn direct credit toward your next
                engineering milestone.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0 w-full md:w-auto">
            <div className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded font-code-sm text-code-sm text-on-surface tracking-wider">
              REF-DX-9824
            </div>
            <button
              type="button"
              onClick={handleCopyReferral}
              className="h-9 px-3.5 bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-inverse-surface transition-colors flex items-center gap-1.5"
            >
              <span
                className="material-symbols-outlined text-sm"
                data-icon="content_copy"
              >
                content_copy
              </span>
              <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section
        className="pt-space-lg pb-space-lg max-w-3xl mx-auto w-full"
        id="faq"
      >
        <div className="text-center mb-space-xl">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline mb-1 block">
            Clarifications
          </span>
          <h2 className="font-headline-xl text-headline-xl text-on-surface">
            Frequently Asked Questions
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Everything you need to know regarding intellectual property,
            milestones, and deliverables.
          </p>
        </div>
        <div className="space-y-space-sm">
          {/* FAQ 1 */}
          <details className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md open:border-primary transition-colors shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-headline-md text-on-surface">
              <span>
                Who owns the Intellectual Property (IP) and source code?
              </span>
              <span
                className="material-symbols-outlined transition-transform group-open:rotate-180"
                data-icon="expand_more"
              >
                expand_more
              </span>
            </summary>
            <div className="mt-space-sm pt-space-sm border-t border-outline-variant font-body-sm text-body-sm text-on-surface-variant">
              You own 100% of all intellectual property, source code,
              documentation, and design assets from the instant deliverables are
              released. DevMatrix signs a binding mutual Non-Disclosure
              Agreement (NDA) and IP Assignment deed before milestone execution.
            </div>
          </details>

          {/* FAQ 2 */}
          <details className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md open:border-primary transition-colors shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-headline-md text-on-surface">
              <span>How does the milestone escrow payment mechanism work?</span>
              <span
                className="material-symbols-outlined transition-transform group-open:rotate-180"
                data-icon="expand_more"
              >
                expand_more
              </span>
            </summary>
            <div className="mt-space-sm pt-space-sm border-t border-outline-variant font-body-sm text-body-sm text-on-surface-variant">
              Payments are partitioned across distinct sprints (typically 40%
              kickoff, 40% core staging, 20% final release). Deposited funds are
              held in escrow. They are only disbursed to engineering once you
              inspect the live staging deployment and sign off on acceptance
              criteria.
            </div>
          </details>

          {/* FAQ 3 */}
          <details className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md open:border-primary transition-colors shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-headline-md text-on-surface">
              <span>
                What happens if the live staging build doesn't match my
                specification?
              </span>
              <span
                className="material-symbols-outlined transition-transform group-open:rotate-180"
                data-icon="expand_more"
              >
                expand_more
              </span>
            </summary>
            <div className="mt-space-sm pt-space-sm border-t border-outline-variant font-body-sm text-body-sm text-on-surface-variant">
              Each milestone includes two full revision cycles. You can flag bug
              tickets or discrepancies directly inside the staging overlay
              interface. Sprints do not close until all criteria outlined in the
              Statement of Work are demonstrated.
            </div>
          </details>

          {/* FAQ 4 */}
          <details className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md open:border-primary transition-colors shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-headline-md text-on-surface">
              <span>
                Are the documentation reports compliant with university or IEEE
                standards?
              </span>
              <span
                className="material-symbols-outlined transition-transform group-open:rotate-180"
                data-icon="expand_more"
              >
                expand_more
              </span>
            </summary>
            <div className="mt-space-sm pt-space-sm border-t border-outline-variant font-body-sm text-body-sm text-on-surface-variant">
              Yes. Our technical writers format academic papers and SRS
              specifications strictly according to IEEE 830 standards or your
              university's guidelines (APA/Harvard/IEEE), complete with
              verifiable citations, high-res vector UML schematics, and clean
              LaTeX/Word sources.
            </div>
          </details>

          {/* FAQ 5 */}
          <details className="group bg-surface-container-lowest border border-outline-variant rounded-xl p-space-md open:border-primary transition-colors shadow-sm">
            <summary className="flex justify-between items-center cursor-pointer list-none font-headline-md text-headline-md text-on-surface">
              <span>Can I request custom ML models or niche domains?</span>
              <span
                className="material-symbols-outlined transition-transform group-open:rotate-180"
                data-icon="expand_more"
              >
                expand_more
              </span>
            </summary>
            <div className="mt-space-sm pt-space-sm border-t border-outline-variant font-body-sm text-body-sm text-on-surface-variant">
              Yes. We routinely construct custom transformers, YOLO vision
              models, RAG pipelines, fine-tuned LLM instances, and IoT systems.
              We supply both weights, training checkpoints, data cleaning
              notebooks, and quantized ONNX deployment files.
            </div>
          </details>
        </div>
      </section>

      {/* ==================== FINAL CALL TO ACTION ==================== */}
      <section className="bg-primary text-on-primary rounded-xl p-space-lg lg:p-space-xl text-center relative overflow-hidden shadow-md">
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-space-md relative z-10">
          <span className="px-2 py-0.5 rounded bg-surface-container-highest/20 text-on-primary font-code-xs text-code-xs tracking-wider uppercase border border-white/10">
            Ready to Engineer?
          </span>
          <h2 className="font-headline-xl text-headline-xl sm:text-[32px] sm:leading-[40px] font-semibold tracking-tight text-white">
            Bring your software specification to reality with zero execution
            uncertainty.
          </h2>
          <p className="font-body-md text-body-md text-inverse-primary max-w-lg">
            Join hundreds of technical founders, college students, and
            engineering researchers who rely on DevMatrix for milestone
            certainty and artifact excellence.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-space-sm pt-space-xs">
            <Link
              to="/register"
              className="h-10 px-5 bg-surface-container-lowest text-primary rounded font-headline-sm text-headline-sm hover:bg-surface transition-colors flex items-center gap-2"
            >
              <span>Submit Requirements Now</span>
              <span
                className="material-symbols-outlined text-base"
                data-icon="arrow_forward"
              >
                arrow_forward
              </span>
            </Link>
            <a
              href="#how-it-works"
              className="h-10 px-5 border border-white/20 text-white rounded font-headline-sm text-headline-sm hover:bg-white/10 transition-colors"
            >
              Review 6-Step Process
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
