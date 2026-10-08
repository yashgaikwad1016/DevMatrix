import { prisma } from "../config/database.js";
import { generateRequirementPDF } from "../services/pdf.service.js";

// ==========================================
// 1. GET PROJECT REQUIREMENTS
// ==========================================
export async function getRequirements(req, res) {
  try {
    const { id } = req.params;
    const projectId = BigInt(id);

    const requirements = await prisma.project_requirements.findMany({
      where: { project_id: projectId },
      orderBy: { version: "desc" },
      include: {
        project_technologies: true,
        functional_requirements: true,
        project_ai_features: true,
        project_designs: true,
      },
    });

    return res.status(200).json({ success: true, requirements });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching requirements." });
  }
}

// ==========================================
// 2. SAVE REQUIREMENTS (DRAFT OR UPDATE)
// ==========================================
export async function saveRequirements(req, res) {
  try {
    const { id } = req.params;
    const projectId = BigInt(id);
    const user = req.user;

    const {
      description,
      client_deadline,
      additional_requirements,
      client_wants_tech_recommendation = false,
      technologies = [],
      functional_requirements = [],
      ai_features = [],
      ai_feature,
      design = {},
    } = req.body;

    // Get current active or draft requirement version
    let activeReq = await prisma.project_requirements.findFirst({
      where: { project_id: projectId },
      orderBy: { version: "desc" },
    });

    if (!activeReq || activeReq.status === "approved") {
      const nextVersion = activeReq ? activeReq.version + 1 : 1;
      activeReq = await prisma.project_requirements.create({
        data: {
          project_id: projectId,
          version: nextVersion,
          status: "draft",
          submitted_by: user.id,
        },
      });
    }

    let parsedDeadline = null;
    if (client_deadline) {
      const cd = new Date(client_deadline);
      if (!isNaN(cd.getTime())) parsedDeadline = cd;
    }

    // Update main requirement fields
    await prisma.project_requirements.update({
      where: { id: activeReq.id },
      data: {
        description: description || null,
        client_deadline: parsedDeadline,
        additional_requirements: additional_requirements || null,
        client_wants_tech_recommendation: Boolean(client_wants_tech_recommendation),
      },
    });

    // Update technologies
    const techList = Array.isArray(technologies) ? technologies : [];
    if (techList.length > 0) {
      await prisma.project_technologies.deleteMany({
        where: { project_requirement_id: activeReq.id },
      });

      const validCategories = ["frontend", "backend", "database", "language", "framework", "devops", "other"];

      const techData = techList
        .filter((t) => t && (t.technology_name || t.tech_name || t.name))
        .map((t) => {
          let cat = String(t.category || "other").toLowerCase().trim();
          if (!validCategories.includes(cat)) {
            if (cat.includes("front") || cat.includes("ui") || cat.includes("client")) cat = "frontend";
            else if (cat.includes("back") || cat.includes("server") || cat.includes("api")) cat = "backend";
            else if (cat.includes("data") || cat.includes("db") || cat.includes("sql")) cat = "database";
            else if (cat.includes("lang")) cat = "language";
            else if (cat.includes("frame")) cat = "framework";
            else if (cat.includes("cloud") || cat.includes("ops") || cat.includes("docker")) cat = "devops";
            else cat = "other";
          }

          const name = String(t.technology_name || t.tech_name || t.name || "").trim().slice(0, 120);

          return {
            project_requirement_id: activeReq.id,
            category: cat,
            technology_name: name || "Not Specified",
            is_client_requested: t.is_client_requested !== undefined ? Boolean(t.is_client_requested) : true,
            recommendation_note: t.recommendation_note ? String(t.recommendation_note).slice(0, 500) : null,
          };
        });

      if (techData.length > 0) {
        await prisma.project_technologies.createMany({
          data: techData,
        });
      }
    }

    // Update functional requirements
    const frList = Array.isArray(functional_requirements) ? functional_requirements : [];
    if (frList.length > 0) {
      await prisma.functional_requirements.deleteMany({
        where: { project_requirement_id: activeReq.id },
      });
      await prisma.functional_requirements.createMany({
        data: frList.map((fr, idx) => ({
          project_requirement_id: activeReq.id,
          requirement_code: fr.requirement_code || `FR-${String(idx + 1).padStart(3, "0")}`,
          title: String(fr.title || `Requirement ${idx + 1}`).slice(0, 200),
          description: fr.description || null,
          priority: ["low", "medium", "high", "critical"].includes(fr.priority) ? fr.priority : "medium",
          acceptance_criteria: fr.acceptance_criteria || null,
        })),
      });
    }

    // Update AI Features
    let finalAiFeatures = Array.isArray(ai_features) ? [...ai_features] : [];
    if (finalAiFeatures.length === 0 && ai_feature && ai_feature.feature_name) {
      finalAiFeatures = [ai_feature];
    }

    if (finalAiFeatures.length > 0) {
      await prisma.project_ai_features.deleteMany({
        where: { project_requirement_id: activeReq.id },
      });
      await prisma.project_ai_features.createMany({
        data: finalAiFeatures.map((ai) => ({
          project_requirement_id: activeReq.id,
          feature_name: String(ai.feature_name || "AI Module").slice(0, 180),
          description: ai.description || null,
          is_required: ai.is_required !== undefined ? Boolean(ai.is_required) : true,
        })),
      });
    }

    // Update Design Preferences
    if (design && typeof design === "object" && Object.keys(design).length > 0) {
      const validStyles = ["modern", "minimal", "professional", "corporate", "dark", "glassmorphism", "academic", "custom"];
      let style = String(design.design_style || "").toLowerCase().trim();
      if (!validStyles.includes(style)) {
        if (style.includes("dark")) style = "dark";
        else if (style.includes("glass")) style = "glassmorphism";
        else if (style.includes("min")) style = "minimal";
        else if (style.includes("prof")) style = "professional";
        else if (style.includes("corp")) style = "corporate";
        else if (style.includes("acad") || style.includes("college") || style.includes("school")) style = "academic";
        else if (style.includes("custom")) style = "custom";
        else style = "modern";
      }

      await prisma.project_designs.upsert({
        where: { project_requirement_id: activeReq.id },
        update: {
          font_family: design.font_family ? String(design.font_family).slice(0, 120) : null,
          primary_color: design.primary_color ? String(design.primary_color).slice(0, 20) : null,
          secondary_color: design.secondary_color ? String(design.secondary_color).slice(0, 20) : null,
          accent_color: design.accent_color ? String(design.accent_color).slice(0, 20) : null,
          background_color: design.background_color ? String(design.background_color).slice(0, 20) : null,
          text_color: design.text_color ? String(design.text_color).slice(0, 20) : null,
          design_style: style,
          reference_url: design.reference_url ? String(design.reference_url).slice(0, 500) : null,
          custom_instructions: design.custom_instructions || null,
        },
        create: {
          project_requirement_id: activeReq.id,
          font_family: design.font_family ? String(design.font_family).slice(0, 120) : null,
          primary_color: design.primary_color ? String(design.primary_color).slice(0, 20) : null,
          secondary_color: design.secondary_color ? String(design.secondary_color).slice(0, 20) : null,
          accent_color: design.accent_color ? String(design.accent_color).slice(0, 20) : null,
          background_color: design.background_color ? String(design.background_color).slice(0, 20) : null,
          text_color: design.text_color ? String(design.text_color).slice(0, 20) : null,
          design_style: style,
          reference_url: design.reference_url ? String(design.reference_url).slice(0, 500) : null,
          custom_instructions: design.custom_instructions || null,
        },
      });
    }

    const saved = await prisma.project_requirements.findUnique({
      where: { id: activeReq.id },
      include: {
        project_technologies: true,
        functional_requirements: true,
        project_ai_features: true,
        project_designs: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Requirements saved successfully.",
      requirement: saved,
    });
  } catch (error) {
    console.error("Save Requirements Error:", error);
    return res.status(500).json({ success: false, message: "Failed to save requirements.", error: error.message });
  }
}

// ==========================================
// 3. SUBMIT REQUIREMENT FOR REVIEW
// ==========================================
export async function submitRequirement(req, res) {
  try {
    const { id, requirementId } = req.params;
    const projectId = BigInt(id);
    const reqId = BigInt(requirementId);
    const user = req.user;

    const requirement = await prisma.project_requirements.update({
      where: { id: reqId },
      data: {
        status: "submitted",
        submitted_at: new Date(),
        submitted_by: user.id,
      },
    });

    await prisma.projects.update({
      where: { id: projectId },
      data: { status: "requirements_submitted" },
    });

    await prisma.audit_logs.create({
      data: {
        actor_id: user.id,
        project_id: projectId,
        action: "REQUIREMENT_SUBMITTED",
        entity_type: "project_requirement",
        entity_id: reqId,
        description: `Requirements version ${requirement.version} submitted for admin review`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Requirements submitted for admin review.",
      requirement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to submit requirements." });
  }
}

// ==========================================
// 4. ADMIN APPROVE REQUIREMENT
// ==========================================
export async function approveRequirement(req, res) {
  try {
    const { id, requirementId } = req.params;
    const projectId = BigInt(id);
    const reqId = BigInt(requirementId);
    const user = req.user;

    const requirement = await prisma.project_requirements.update({
      where: { id: reqId },
      data: {
        status: "approved",
        approved_at: new Date(),
        approved_by: user.id,
      },
    });

    await prisma.projects.update({
      where: { id: projectId },
      data: { status: "under_review" },
    });

    await prisma.audit_logs.create({
      data: {
        actor_id: user.id,
        project_id: projectId,
        action: "REQUIREMENT_APPROVED",
        entity_type: "project_requirement",
        entity_id: reqId,
        description: `Requirements version ${requirement.version} approved by admin`,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Requirements approved. You can now prepare quotation.",
      requirement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to approve requirements." });
  }
}

// ==========================================
// 5. EXPORT REQUIREMENT PDF (ADMIN / CLIENT)
// ==========================================
export async function exportRequirementPDF(req, res) {
  try {
    const { id, requirementId } = req.params;
    const projectId = BigInt(id);
    const reqId = BigInt(requirementId);

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: { users_projects_client_idTousers: true },
    });

    const requirement = await prisma.project_requirements.findUnique({
      where: { id: reqId },
      include: {
        project_technologies: true,
        functional_requirements: true,
        project_ai_features: true,
        project_designs: true,
      },
    });

    if (!project || !requirement) {
      return res.status(404).json({ success: false, message: "Project or requirement not found." });
    }

    const pdfBuffer = await generateRequirementPDF(project, requirement);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Requirements-${project.project_number}-v${requirement.version}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Export PDF Error:", error);
    return res.status(500).json({ success: false, message: "Failed to export PDF." });
  }
}

export default {
  getRequirements,
  saveRequirements,
  submitRequirement,
  approveRequirement,
  exportRequirementPDF,
};
