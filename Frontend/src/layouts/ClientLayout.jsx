import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard",        path: "/client/dashboard",     icon: "dashboard" },
    { name: "Projects",         path: "/client/projects",      icon: "folder_managed" },
    { name: "Requirements",     path: "/client/projects/new",  icon: "assignment" },
    { name: "Quotations",       path: "/client/quotations",    icon: "receipt_long" },
    { name: "Payments",         path: "/client/payments",      icon: "account_balance_wallet" },
    { name: "Deliverables",     path: "/client/deliverables",  icon: "inventory_2" },
    { name: "Referral Rewards", path: "/client/referrals",     icon: "card_giftcard" },
    { name: "Settings",         path: "/client/settings",      icon: "settings" },
  ];

  const isActive = (path) => {
    if (path === "/client/projects" && location.pathname.startsWith("/client/projects/")) {
      // Don't mark Projects active when on sub-routes like /new
      return location.pathname === "/client/projects";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-surface text-on-surface antialiased font-body-md text-body-md min-h-screen flex flex-col md:flex-row">
      {/* ========================================================================= */}
      {/* PERSISTENT DESKTOP SIDE NAVIGATION RAIL (SideNavBar)                     */}
      {/* ========================================================================= */}
      <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col justify-between py-space-md bg-surface-container-low border-r border-outline-variant z-30 select-none hidden md:flex">
        {/* Sidebar Header: Organization Identifier */}
        <div className="px-space-md flex flex-col gap-space-md">
          <Link to="/" className="flex items-center space-x-3 pb-space-sm border-b border-outline-variant">
            <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-headline-sm font-semibold tracking-tight shadow-sm text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-headline-sm font-headline-sm font-bold text-on-surface truncate">
                {user?.name || "Client Workspace"}
              </span>
              <span className="text-label-sm font-label-sm text-on-surface-variant truncate">
                {user?.college ? "Academic Tier" : "Enterprise Tier"}
              </span>
            </div>
          </Link>

          {/* Quick Action CTA */}
          <Link
            to="/client/projects"
            className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-space-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-label-md font-label-md text-on-surface hover:bg-surface-container-high transition-colors duration-150 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">visibility</span>
            <span className="font-medium text-xs">Inspect Live Previews</span>
          </Link>

          {/* Primary Navigation Tabs */}
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-label-md font-label-md transition-colors duration-150 ${
                    active
                      ? "bg-surface-container-highest text-on-surface font-semibold border-l-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-space-md pt-space-md border-t border-outline-variant space-y-1">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-on-surface-variant text-label-sm font-label-sm">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span>Escrow &amp; Sandbox Operational</span>
          </div>
          <a
            href="#"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors text-label-sm font-label-sm"
          >
            <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
            <span>System Health</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors text-label-sm font-label-sm"
          >
            <span className="material-symbols-outlined text-[16px]">history</span>
            <span>Audit Log</span>
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-error hover:bg-error-container/30 text-label-sm font-label-sm transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN LAYOUT CANVAS (Offset by Left Rail: 240px)                           */}
      {/* ========================================================================= */}
      <div className="md:ml-60 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TopNavBar Component */}
        <header className="w-full h-14 px-gutter flex items-center justify-between sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-20 select-none shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          {/* Left: Brand / Title Breadcrumb */}
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="font-headline-md text-headline-md font-semibold tracking-tight text-on-surface">DevMatrix Client Portal</span>
              <span className="text-outline-variant">/</span>
              <span className="font-label-md text-label-md text-on-surface-variant capitalize">
                {location.pathname.split("/")[2]?.replace(/-/g, " ") || "Dashboard"}
              </span>
            </div>
            <nav className="hidden lg:flex items-center gap-space-md ml-space-md text-label-md font-label-md border-l border-outline-variant pl-space-md">
              <a className="text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="/#how-it-works">Docs</a>
              <a className="text-on-surface-variant hover:text-on-surface transition-colors duration-150" href="/#faq">Support</a>
              <div className="text-on-surface-variant flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                <span>API Status</span>
              </div>
            </nav>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-space-sm">
            <button className="h-8 px-2.5 text-label-md font-label-md border border-outline-variant rounded-md bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-on-surface hidden sm:flex items-center space-x-1">
              <span>Switch Org</span>
              <span className="material-symbols-outlined text-[14px]">unfold_more</span>
            </button>
            <Link
              to="/client/projects/new"
              className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-on-primary hover:bg-[#1E293B] text-label-sm font-label-sm font-medium transition-colors duration-150 shadow-sm"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>Create Request</span>
            </Link>
            <button className="w-8 h-8 rounded-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors relative" title="Notifications">
              <span className="material-symbols-outlined text-[18px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
            </button>
            <div
              className="w-7 h-7 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center font-label-sm text-label-sm font-semibold text-on-surface ml-1 cursor-pointer"
              title="Client Organization Avatar and Menu"
            >
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "CU"}
            </div>
          </div>
        </header>

        {/* Child Outlet */}
        <main className="flex-1 p-space-md sm:p-gutter max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
