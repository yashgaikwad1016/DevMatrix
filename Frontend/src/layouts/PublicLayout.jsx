import React from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicLayout() {
  const { user } = useAuth();

  return (
    <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col selection:bg-surface-container-highest selection:text-on-surface">
      {/* ==================== TOP NAVIGATION BAR ==================== */}
      <header className="w-full h-14 px-gutter flex items-center justify-between sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-40 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        {/* Brand Mark */}
        <div className="flex items-center gap-space-md">
          <Link
            to="/"
            className="flex items-center gap-space-xs text-on-surface hover:opacity-90 transition-opacity"
          >
            <span
              className="material-symbols-outlined text-primary"
              data-icon="terminal"
            >
              terminal
            </span>
            <div className="flex flex-col">
              <span className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight leading-none">
                DevMatrix
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant leading-none mt-0.5 hidden sm:inline">
                Engineering &amp; Milestone Platform
              </span>
            </div>
          </Link>
          <span className="hidden lg:inline-block w-px h-4 bg-outline-variant"></span>
          <span className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-sm bg-surface-container-high text-on-surface-variant font-code-xs text-code-xs border border-outline-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block"></span>
            v4.2 Production Ready
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-space-lg">
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
            href="/#how-it-works"
          >
            How It Works
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
            href="/#deliverables"
          >
            Deliverables
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
            href="/#problem-solution"
          >
            Architecture
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
            href="/#calculator"
          >
            Quotation
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
            href="/#referrals"
          >
            Referral Program
          </a>
          <a
            className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high px-2 py-1 rounded transition-colors"
            href="/#faq"
          >
            FAQs
          </a>
        </nav>

        {/* Trailing Actions */}
        <div className="flex items-center gap-space-sm">
          {user ? (
            <Link
              to={
                user.role === "admin" ? "/admin/dashboard" : "/client/dashboard"
              }
              className="h-9 px-3.5 bg-primary text-on-primary border border-transparent rounded hover:bg-inverse-surface transition-colors flex items-center gap-1.5 font-headline-sm text-headline-sm shadow-sm"
            >
              <span
                className="material-symbols-outlined text-base"
                data-icon="dashboard"
              >
                dashboard
              </span>
              <span>Go to Portal</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface px-2.5 py-1.5 rounded transition-colors flex items-center gap-1"
              >
                <span>Client Login</span>
              </Link>
              <Link
                to="/register"
                className="h-9 px-3.5 bg-primary text-on-primary border border-transparent rounded hover:bg-inverse-surface transition-colors flex items-center gap-1.5 font-headline-sm text-headline-sm shadow-sm"
              >
                <span
                  className="material-symbols-outlined text-base"
                  data-icon="add_circle"
                >
                  add_circle
                </span>
                <span>Start Your Project</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Page Slot */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-space-xl flex flex-col gap-space-xl">
        <Outlet />
      </main>

      {/* ==================== COMPREHENSIVE FOOTER ==================== */}
      <footer className="w-full border-t border-outline-variant bg-surface-container-lowest py-space-xl mt-space-xl">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-5 gap-space-lg">
          {/* Col 1: Brand & Details */}
          <div className="col-span-2 flex flex-col gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span
                className="material-symbols-outlined text-primary"
                data-icon="terminal"
              >
                terminal
              </span>
              <span className="font-headline-md text-headline-md font-semibold text-on-surface">
                DevMatrix
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-sm">
              High-trust custom software engineering, milestone escrow
              settlement, and academic documentation delivery platform.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                All Core Systems Operational
              </span>
            </div>
            <span className="font-code-xs text-code-xs text-outline mt-2">
              &copy; {new Date().getFullYear()} DevMatrix Engineering Corp. All
              rights reserved.
            </span>
          </div>

          {/* Col 2: Platform Links */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-1">
              Platform
            </span>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#how-it-works"
            >
              How It Works
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#deliverables"
            >
              Deliverables Manifest
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#calculator"
            >
              Budget Calculator
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#referrals"
            >
              Partner Program
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#live-preview-section"
            >
              Live Staging Sandbox
            </a>
          </div>

          {/* Col 3: Deliverables & Specs */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-1">
              Artifacts
            </span>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#deliverables"
            >
              IEEE 830 Templates
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#deliverables"
            >
              Docker Base Builds
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#deliverables"
            >
              Slide Deck Themes
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#deliverables"
            >
              Postman Schema
            </a>
            <a
              className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface"
              href="/#deliverables"
            >
              Artifact Checksum Tool
            </a>
          </div>

          {/* Col 4: Legal & Policies */}
          <div className="flex flex-col gap-space-xs">
            <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider mb-1">
              Trust &amp; Legal
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Mutual NDA Policy
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Milestone Escrow Terms
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              IP Assignment Deed
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Razorpay Escrow Secure
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Dispute Mediation
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
