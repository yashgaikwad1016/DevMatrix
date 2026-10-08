import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Code2, ArrowRight, LayoutDashboard, LogOut, Shield } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-xl text-slate-900 tracking-tight">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-black shadow-sm">
            <Code2 className="w-5 h-5 text-blue-400" />
          </div>
          <span>DEV<span className="text-blue-600">MATRIX</span></span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="/#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          <a href="/#deliverables" className="hover:text-slate-900 transition-colors">Deliverables</a>
          <a href="/#problem-solution" className="hover:text-slate-900 transition-colors">Why DevMatrix</a>
          <a href="/#faqs" className="hover:text-slate-900 transition-colors">FAQs</a>
          <a href="/#referrals" className="hover:text-slate-900 transition-colors">Rewards</a>
        </nav>

        {/* Right CTA / Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={user?.role === "admin" ? "/admin/dashboard" : "/client/dashboard"}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-medium transition-colors"
              >
                {user?.role === "admin" ? <Shield className="w-4 h-4 text-blue-600" /> : <LayoutDashboard className="w-4 h-4 text-slate-600" />}
                <span>{user?.role === "admin" ? "Admin Portal" : "Dashboard"}</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition-colors"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
