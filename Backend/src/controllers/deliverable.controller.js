import path from "path";
import fs from "fs";
import { prisma } from "../config/database.js";

// ==========================================
// 1. LIST DELIVERABLES FOR PROJECT
// ==========================================
export async function getDeliverables(req, res) {
  try {
    const { id } = req.params;
    const projectId = BigInt(id);

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      select: { payment_status: true, status: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    const deliverables = await prisma.deliverables.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: "desc" },
    });

    const isFullyPaid = project.payment_status === "fully_paid";

    // Format list, hiding direct links if not fully paid
    const sanitized = deliverables.map((d) => ({
      id: d.id.toString(),
      name: d.name,
      type: d.type,
      file_size: d.file_size ? d.file_size.toString() : null,
      version: d.version,
      is_final: d.is_final,
      requires_full_payment: d.requires_full_payment,
      is_unlocked: isFullyPaid || !d.requires_full_payment,
      created_at: d.created_at,
    }));

    return res.status(200).json({
      success: true,
      is_fully_paid: isFullyPaid,
      deliverables: sanitized,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching deliverables." });
  }
}

// ==========================================
// 2. CREATE / UPLOAD DELIVERABLE (ADMIN / DEV)
// ==========================================
export async function createDeliverable(req, res) {
  try {
    const { id } = req.params;
    const projectId = BigInt(id);
    const user = req.user;

    const { name, type, file_url, storage_key, file_size, version = "1.0", is_final = true } = req.body;

    if (!name || !type) {
      return res.status(400).json({ success: false, message: "Deliverable name and type are required." });
    }

    const deliverable = await prisma.deliverables.create({
      data: {
        project_id: projectId,
        uploaded_by: user.id,
        name,
        type,
        storage_key: storage_key || `deliverable_${Date.now()}_${name}`,
        file_url: file_url || `/uploads/deliverables/${name}`,
        file_size: file_size ? BigInt(file_size) : null,
        version,
        is_final: Boolean(is_final),
        requires_full_payment: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Deliverable registered successfully.",
      deliverable,
    });
  } catch (error) {
    console.error("Create deliverable error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload deliverable." });
  }
}

// ==========================================
// 3. DOWNLOAD DELIVERABLE (ENFORCES FULLY PAID)
// ==========================================
export async function downloadDeliverable(req, res) {
  try {
    const { deliverableId } = req.params;
    const dId = BigInt(deliverableId);

    const deliverable = await prisma.deliverables.findUnique({
      where: { id: dId },
      include: { projects: true },
    });

    if (!deliverable) {
      return res.status(404).json({ success: false, message: "Deliverable asset not found." });
    }

    const project = deliverable.projects;

    // STRICT PAYMENT CHECK: Check that project is fully paid before granting download
    if (deliverable.requires_full_payment && project.payment_status !== "fully_paid") {
      return res.status(403).json({
        success: false,
        payment_required: true,
        message: "Access restricted: Final payment of remaining balance is required to unlock this deliverable asset.",
        project_number: project.project_number,
        remaining_amount: project.remaining_amount,
      });
    }

    // If file exists on disk
    if (deliverable.file_url && fs.existsSync(deliverable.file_url)) {
      return res.download(deliverable.file_url, deliverable.name);
    }

    // Or return authorized package bundle
    return res.status(200).json({
      success: true,
      message: "Deliverable authorized for download.",
      download_url: deliverable.file_url,
      deliverable_name: deliverable.name,
      deliverable_type: deliverable.type,
      file_size: deliverable.file_size ? deliverable.file_size.toString() : null,
    });
  } catch (error) {
    console.error("Download deliverable error:", error);
    return res.status(500).json({ success: false, message: "Failed to process download request." });
  }
}

export default { getDeliverables, createDeliverable, downloadDeliverable };
