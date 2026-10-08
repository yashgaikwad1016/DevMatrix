import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "dashboard" },
    { name: "Projects Workspace", path: "/admin/projects", icon: "folder_managed" },
    { name: "Client Directory", path: "/admin/clients", icon: "group" },
    { name: "Audit Trail", path: "/admin/audit-logs", icon: "history" },
  ];

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-surface text-on-surface antialiased font-body-sm text-body-sm min-h-screen flex flex-col md:flex-row">
      {/* DESKTOP RAIL / SIDEBAR (w-60) */}
      <aside className="w-60 shrink-0 bg-surface-container-low border-r border-outline-variant flex flex-col justify-between py-space-sm z-30 select-none hidden md:flex">
        {/* Top Brand / Org Block */}
        <div>
          <div className="px-space-md py-space-sm mb-2 border-b border-outline-variant/60 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center font-bold text-label-sm text-white">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </div>
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm font-bold text-on-surface tracking-tight leading-snug">
                  DevMatrix Ops
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant leading-none">
                  Admin Command Center
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Tab Items */}
          <nav className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-label-md font-label-md transition-colors duration-150 ${
                    isActive
                      ? "bg-surface-container-highest text-on-surface font-semibold border-l-2 border-primary"
                      : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="material-symbols-outlined text-[18px]"
                      style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="px-space-md pt-space-sm border-t border-outline-variant space-y-1">
          <Link
            to="/client/dashboard"
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-high text-label-sm font-label-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            <span>Switch to Client Portal</span>
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-error hover:bg-error-container/30 text-label-sm font-label-sm transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Canvas */}
      <div className="md:ml-60 flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP APP BAR */}
        <header className="w-full h-14 px-gutter flex items-center justify-between sticky top-0 bg-surface-container-lowest border-b border-outline-variant z-40 shrink-0 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
          {/* Left: Brand / System Context */}
          <div className="flex items-center gap-space-lg">
            <div className="flex items-center gap-space-xs text-on-surface">
              <span className="font-headline-md text-headline-md font-semibold tracking-tight text-on-surface">
                DevMatrix Operations
              </span>
              <span className="text-outline-variant">/</span>
              <span className="font-label-md text-label-md text-on-surface-variant capitalize">
                {location.pathname.split("/")[2]?.replace("-", " ") || "Dashboard"}
              </span>
            </div>
            <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
            {/* Health Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-secondary/20 bg-secondary-container/20 text-on-secondary-container">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
              <span className="font-label-sm text-label-sm font-medium">Production Node 99.98%</span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-space-sm">
            <Link
              to="/client/dashboard"
              className="px-2.5 h-8 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-high transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              <span>Client View</span>
            </Link>
            <div className="w-7 h-7 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface font-label-sm font-semibold">
              AD
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-space-md sm:p-gutter max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
