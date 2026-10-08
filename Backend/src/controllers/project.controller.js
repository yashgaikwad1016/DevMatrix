import { prisma } from "../config/database.js";
import { generateProjectNumber } from "../utils/numberGenerators.js";

// ==========================================
// 1. LIST PROJECTS
// ==========================================
export async function getProjects(req, res) {
  try {
    const user = req.user;
    let where = {};

    if (user.role === "client") {
      where = { client_id: user.id };
    } else if (user.role === "developer") {
      where = { assigned_developer_id: user.id };
    }
    // Admin sees all

    const projects = await prisma.projects.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        users_projects_client_idTousers: {
          select: { id: true, name: true, email: true, college: true, university: true },
        },
        users_projects_assigned_developer_idTousers: {
          select: { id: true, name: true, email: true },
        },
        project_requirements: {
          orderBy: { version: "desc" },
          take: 1,
        },
      },
    });

    const formattedProjects = projects.map((p) => ({
      ...p,
      requirements: p.project_requirements || [],
    }));

    return res.status(200).json({
      success: true,
      count: formattedProjects.length,
      projects: formattedProjects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching projects.", error: error.message });
  }
}

// ==========================================
// 2. GET SINGLE PROJECT DETAILS
// ==========================================
export async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const projectId = BigInt(id);

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: {
        users_projects_client_idTousers: {
          select: { id: true, name: true, email: true, mobile: true, college: true, university: true },
        },
        users_projects_assigned_developer_idTousers: {
          select: { id: true, name: true, email: true },
        },
        project_requirements: {
          orderBy: { version: "desc" },
          include: {
            project_technologies: true,
            functional_requirements: true,
            project_ai_features: true,
            project_designs: true,
          },
        },
        quotations: {
          orderBy: { created_at: "desc" },
          include: { quotation_items: true },
        },
        payments: {
          orderBy: { created_at: "desc" },
          include: { receipts: true },
        },
        project_milestones: {
          orderBy: { sequence_no: "asc" },
          include: { tasks: true },
        },
        tasks: {
          orderBy: { created_at: "desc" },
        },
        change_requests: {
          orderBy: { created_at: "desc" },
        },
        github_integrations: true,
        deployments: {
          orderBy: { created_at: "desc" },
        },
        deliverables: {
          orderBy: { created_at: "desc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Authorization check
    if (user.role === "client" && String(project.client_id) !== String(user.id)) {
      return res.status(403).json({ success: false, message: "Access forbidden." });
    }
    if (user.role === "developer" && String(project.assigned_developer_id) !== String(user.id)) {
      return res.status(403).json({ success: false, message: "Access forbidden." });
    }

    // Prepare compatibility aliases
    const formattedProject = {
      ...project,
      requirements: (project.project_requirements || []).map((req) => ({
        ...req,
        technologies: req.project_technologies || [],
        ai_features: req.project_ai_features || [],
        design: req.project_designs || null,
        design_choices: req.project_designs ? [req.project_designs] : [],
      })),
      quotations: (project.quotations || []).map((q) => ({
        ...q,
        line_items: q.quotation_items || [],
        items: q.quotation_items || [],
      })),
    };

    return res.status(200).json({
      success: true,
      project: formattedProject,
    });
  } catch (error) {
    console.error("Get Project Details Error:", error);
    return res.status(500).json({ success: false, message: "Failed to retrieve project.", error: error.message });
  }
}

function normalizeProjectType(val) {
  if (!val) return "web";
  const s = String(val).toLowerCase().trim();
  if (s.includes("mobile") || s.includes("android") || s.includes("ios") || s.includes("flutter")) return "mobile";
  if (s.includes("ai") || s.includes("ml") || s.includes("machine") || s.includes("neural") || s.includes("pipeline") || s.includes("deep")) return "ai_ml";
  if (s.includes("data") || s.includes("science") || s.includes("analytics")) return "data_science";
  if (s.includes("desktop") || s.includes("electron") || s.includes("tauri")) return "desktop";
  if (s.includes("iot") || s.includes("hardware") || s.includes("sensor")) return "iot";
  if (s.includes("block") || s.includes("crypto") || s.includes("web3")) return "blockchain";
  if (s.includes("cyber") || s.includes("security")) return "cybersecurity";
  if (s.includes("web") || s.includes("stack") || s.includes("cloud") || s.includes("microservice") || s.includes("site") || s.includes("portal")) return "web";

  const valid = ["web", "mobile", "desktop", "ai_ml", "data_science", "iot", "blockchain", "cybersecurity", "other"];
  if (valid.includes(s)) return s;
  return "web";
}

// ==========================================
// 3. CREATE PROJECT
// ==========================================
export async function createProject(req, res) {
  try {
    const user = req.user;
    const {
      project_name,
      short_description,
      domain,
      project_type,
      priority = "normal",
      deadline,
    } = req.body;

    if (!project_name) {
      return res.status(400).json({ success: false, message: "Project name is required." });
    }

    const projectNumber = await generateProjectNumber();

    let parsedDeadline = null;
    if (deadline) {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        parsedDeadline = d;
      }
    }

    const normalizedType = normalizeProjectType(project_type);

    const newProject = await prisma.projects.create({
      data: {
        project_number: projectNumber,
        client_id: user.id,
        project_name: project_name.trim(),
        short_description: short_description || null,
        domain: domain ? String(domain).slice(0, 120) : null,
        project_type: normalizedType,
        priority: priority === "urgent" ? "urgent" : "normal",
        deadline: parsedDeadline,
        status: "draft",
        payment_status: "unpaid",
        progress: 0,
      },
    });

    // Automatically create initial Requirement Version 1
    const initialRequirement = await prisma.project_requirements.create({
      data: {
        project_id: newProject.id,
        version: 1,
        description: short_description || null,
        client_deadline: parsedDeadline,
        status: "draft",
        submitted_by: user.id,
      },
    });

    // Create Audit Log
    try {
      await prisma.audit_logs.create({
        data: {
          actor_id: user.id,
          project_id: newProject.id,
          action: "PROJECT_CREATED",
          entity_type: "project",
          entity_id: newProject.id,
          description: `Project ${newProject.project_number} created in draft state`,
        },
      });
    } catch (auditErr) {
      console.warn("Audit log creation warning:", auditErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Project created successfully. You can now fill in detailed requirements.",
      project: newProject,
      requirement: initialRequirement,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    return res.status(500).json({ success: false, message: "Failed to create project.", error: error.message });
  }
}

// ==========================================
// 4. UPDATE PROJECT
// ==========================================
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const projectId = BigInt(id);

    const existing = await prisma.projects.findUnique({ where: { id: projectId } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    if (user.role === "client" && existing.client_id !== user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized." });
    }

    const {
      project_name,
      short_description,
      domain,
      project_type,
      priority,
      deadline,
      status,
      assigned_developer_id,
      progress,
    } = req.body;

    const updateData = {};
    if (project_name) updateData.project_name = project_name.trim();
    if (short_description !== undefined) updateData.short_description = short_description;
    if (domain !== undefined) updateData.domain = domain;
    if (project_type !== undefined) updateData.project_type = project_type;
    if (priority !== undefined) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = deadline ? new Date(deadline) : null;

    // Admin-only updates
    if (user.role === "admin") {
      if (status !== undefined) updateData.status = status;
      if (progress !== undefined) updateData.progress = Number(progress);
      if (assigned_developer_id !== undefined) {
        updateData.assigned_developer_id = assigned_developer_id ? BigInt(assigned_developer_id) : null;
      }
    }

    const updated = await prisma.projects.update({
      where: { id: projectId },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project: updated,
    });
  } catch (error) {
    console.error("Update Project Error:", error);
    return res.status(500).json({ success: false, message: "Failed to update project.", error: error.message });
  }
}

export default { getProjects, getProjectById, createProject, updateProject };
