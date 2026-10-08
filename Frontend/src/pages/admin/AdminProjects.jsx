import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Quick Action Modal state
  const [modalType, setModalType] = useState(null); // 'quote' | 'github' | 'staging'
  const [selectedProject, setSelectedProject] = useState(null);

  // Quotation Builder Form
  const [quoteItems, setQuoteItems] = useState([
    { title: "Frontend UI/UX Architecture & Interface", description: "Responsive Next.js/React interface with theme tokens", unit_price: 8000 },
    { title: "Backend APIs & Database Scaffolding", description: "REST / FastAPI endpoints, auth sessions, and PostgreSQL schemas", unit_price: 9000 },
    { title: "AI / ML Pipeline & Intelligent Services", description: "PyTorch inference model or LangChain RAG pipeline", unit_price: 6000 },
    { title: "Academic IEEE 830 Report & Vector PPT Deck", description: "Standard IEEE documentation, PPTX presentation, and 4K demo", unit_price: 4000 },
  ]);

  // GitHub CI/CD Workspace Form
  const [repoName, setRepoName] = useState("");
  const [repoOwner, setRepoOwner] = useState("devmatrix-engineering");

  // Staging Sandbox Form
  const [previewUrl, setPreviewUrl] = useState("");

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

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleApproveReq = async (proj) => {
    const req = proj.requirements?.[0] || proj.project_requirements?.[0];
    if (!req) return;
    try {
      await api.post(`/api/projects/${proj.id}/requirements/${req.id}/approve`);
      alert(`Requirement approved for ${proj.project_number}`);
      fetchProjects();
    } catch (err) {
      alert("Failed to approve requirement.");
    }
  };

  const handleCreateQuotation = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await api.post(`/api/projects/${selectedProject.id}/quotations`, {
        items: quoteItems.map((item) => ({
          title: item.title,
          description: item.description,
          unit_price: Number(item.unit_price),
          quantity: 1,
        })),
        advance_percentage: 40,
      });
      alert(`Quotation generated and sent to client for ${selectedProject.project_number}`);
      setModalType(null);
      fetchProjects();
    } catch (err) {
      alert("Failed to dispatch quotation.");
    }
  };

  const handleConnectGitHub = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await api.post(`/api/projects/${selectedProject.id}/github/connect`, {
        repository_name: repoName,
        owner: repoOwner,
        default_branch: "main",
        development_branch: "develop",
      });
      alert(`GitHub repository connected for ${selectedProject.project_number}`);
      setModalType(null);
      fetchProjects();
    } catch (err) {
      alert("Failed to connect GitHub.");
    }
  };

  const handleCreatePreview = async (e) => {
    e.preventDefault();
    if (!selectedProject) return;
    try {
      await api.post(`/api/projects/${selectedProject.id}/deployments`, {
        preview_url: previewUrl,
        environment: "staging",
      });
      alert(`Staging URL published for ${selectedProject.project_number}`);
      setModalType(null);
      fetchProjects();
    } catch (err) {
      alert("Failed to deploy preview.");
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.project_name.toLowerCase().includes(search.toLowerCase()) ||
      p.project_number.toLowerCase().includes(search.toLowerCase()) ||
      (p.users?.name && p.users.name.toLowerCase().includes(search.toLowerCase()));

    if (filter === "all") return matchSearch;
    return matchSearch && p.status === filter;
  });

  return (
    <div className="space-y-space-lg">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-space-sm border-b border-outline-variant">
        <div>
          <h1 className="text-headline-xl font-headline-xl text-on-surface tracking-tight">
            Engineering Projects Operations Workspace
          </h1>
          <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
            Review specifications, dispatch formal quotations, link GitHub repositories, and publish live staging links.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects, client names, ID..."
            className="w-full h-8 pl-8 pr-3 text-body-sm font-body-sm bg-surface-container-low border border-outline-variant rounded focus:border-primary focus:outline-none text-on-surface"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {["all", "requirements_submitted", "quotation_sent", "in_development", "fully_paid"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded text-label-sm font-label-sm transition-colors capitalize ${
                filter === st
                  ? "bg-primary text-on-primary font-semibold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">
                <th className="py-2.5 px-space-md">Project Identifier</th>
                <th className="py-2.5 px-space-md">Client / Institution</th>
                <th className="py-2.5 px-space-md">Pipeline Status</th>
                <th className="py-2.5 px-space-md">Escrow Amount</th>
                <th className="py-2.5 px-space-md text-right">Ops Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {filtered.map((proj) => (
                <tr key={proj.id} className="hover:bg-surface-container-low/40 transition-colors">
                  <td className="py-3 px-space-md">
                    <div className="flex items-center gap-2">
                      <span className="font-code-xs text-code-xs font-semibold px-1.5 py-0.5 rounded bg-surface-container">
                        {proj.project_number}
                      </span>
                      <div>
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface block">
                          {proj.project_name}
                        </span>
                        <span className="text-body-sm font-body-sm text-on-surface-variant">
                          {proj.domain || "Custom"} · {proj.project_type || "Web App"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="font-headline-sm text-headline-sm text-on-surface block">
                      {proj.users?.name || "Client"}
                    </span>
                    <span className="text-label-sm font-label-sm text-on-surface-variant">
                      {proj.users?.college || "College"}
                    </span>
                  </td>
                  <td className="py-3 px-space-md">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-label-sm font-label-sm font-semibold bg-secondary-container text-on-secondary-container uppercase">
                      {proj.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-3 px-space-md font-code-sm text-code-sm text-on-surface">
                    <span>₹{Number(proj.total_paid).toLocaleString("en-IN")}</span>
                    <span className="text-outline text-xs"> / ₹{Number(proj.total_amount).toLocaleString("en-IN")}</span>
                  </td>
                  <td className="py-3 px-space-md text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Quotation Builder Trigger */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(proj);
                          setModalType("quote");
                        }}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-label-sm font-label-sm text-on-surface transition-colors"
                        title="Generate Quotation"
                      >
                        Quote
                      </button>

                      {/* Staging URL Link */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(proj);
                          setPreviewUrl(proj.staging_url || `https://staging-${proj.project_number.toLowerCase()}.devmatrix.run`);
                          setModalType("staging");
                        }}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-outline-variant text-label-sm font-label-sm text-on-surface transition-colors"
                        title="Publish Staging Sandbox"
                      >
                        Staging
                      </button>

                      {/* View Workspace */}
                      <Link
                        to={`/client/projects/${proj.id}`}
                        className="p-1 rounded bg-primary text-on-primary hover:bg-[#1E293B] transition-colors"
                        title="View Client Workspace"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ==================== QUOTATION BUILDER MODAL ==================== */}
      {modalType === "quote" && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg max-w-2xl w-full shadow-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
              <div>
                <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
                  Quotation Builder &amp; Pricing Engine
                </h3>
                <span className="text-label-sm font-label-sm text-on-surface-variant font-mono">
                  {selectedProject.project_number} · {selectedProject.project_name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4">
              <div className="space-y-2">
                <span className="text-label-md font-label-md text-on-surface block">Itemized Scope Deliverables</span>
                {quoteItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded bg-surface-container-low border border-outline-variant space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                          const updated = [...quoteItems];
                          updated[idx].title = e.target.value;
                          setQuoteItems(updated);
                        }}
                        className="w-2/3 h-8 px-2 bg-surface border border-outline-variant rounded text-body-sm text-on-surface"
                      />
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => {
                          const updated = [...quoteItems];
                          updated[idx].unit_price = Number(e.target.value);
                          setQuoteItems(updated);
                        }}
                        className="w-1/3 h-8 px-2 bg-surface border border-outline-variant rounded text-body-sm font-code-sm text-on-surface text-right"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const updated = [...quoteItems];
                        updated[idx].description = e.target.value;
                        setQuoteItems(updated);
                      }}
                      className="w-full h-7 px-2 bg-surface border border-outline-variant rounded text-xs text-on-surface-variant"
                    />
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="p-3 bg-surface-container rounded-lg flex items-center justify-between text-body-sm font-body-sm">
                <span>Calculated Gross SOW:</span>
                <span className="font-code-sm font-bold text-headline-sm text-on-surface">
                  ₹{quoteItems.reduce((acc, it) => acc + Number(it.unit_price || 0), 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-3.5 py-1.5 border border-outline-variant rounded text-label-md font-label-md hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-on-primary rounded text-label-md font-label-md font-medium hover:bg-[#1E293B] shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">send</span>
                  <span>Dispatch Binding Quote (40% Advance)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== STAGING SANDBOX MODAL ==================== */}
      {modalType === "staging" && selectedProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg max-w-md w-full shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant">
              <div>
                <h3 className="text-headline-md font-headline-md font-bold text-on-surface">
                  Publish Staging Sandbox URL
                </h3>
                <span className="text-label-sm font-label-sm text-on-surface-variant font-mono">
                  {selectedProject.project_number}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePreview} className="space-y-3">
              <div>
                <label className="block text-label-md font-label-md text-on-surface mb-1">
                  Staging Sandbox URL
                </label>
                <input
                  type="url"
                  required
                  value={previewUrl}
                  onChange={(e) => setPreviewUrl(e.target.value)}
                  placeholder="https://staging-dx88.devmatrix.run"
                  className="w-full h-9 px-3 bg-surface border border-outline-variant rounded text-body-sm font-body-sm text-on-surface focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-3.5 py-1.5 border border-outline-variant rounded text-label-md font-label-md hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-secondary text-white rounded text-label-md font-label-md font-medium hover:opacity-90 shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span>Publish Staging Container</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
