import { prisma } from "../config/database.js";

export async function getChangeRequests(req, res) {
  try {
    const { id } = req.params;
    const crs = await prisma.change_requests.findMany({
      where: { project_id: BigInt(id) },
      orderBy: { created_at: "desc" },
      include: {
        users_change_requests_requested_byTousers: { select: { id: true, name: true, email: true } },
      },
    });
    return res.status(200).json({ success: true, change_requests: crs });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error loading change requests." });
  }
}

export async function createChangeRequest(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const { title, description } = req.body;

    const cr = await prisma.change_requests.create({
      data: {
        project_id: BigInt(id),
        requested_by: user.id,
        title,
        description,
        status: "submitted",
      },
    });

    await prisma.projects.update({
      where: { id: BigInt(id) },
      data: { status: "changes_requested" },
    });

    return res.status(201).json({ success: true, message: "Change request submitted.", change_request: cr });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error submitting change request." });
  }
}

export async function approveChangeRequest(req, res) {
  try {
    const { id } = req.params; // CR ID
    const user = req.user;
    const { estimated_cost, estimated_days } = req.body;

    const updated = await prisma.change_requests.update({
      where: { id: BigInt(id) },
      data: {
        status: "approved",
        approved_by: user.id,
        approved_at: new Date(),
        estimated_cost: estimated_cost ? Number(estimated_cost) : 0,
        estimated_days: estimated_days ? Number(estimated_days) : 0,
      },
    });
    return res.status(200).json({ success: true, message: "Change request approved.", change_request: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error approving change request." });
  }
}

export default { getChangeRequests, createChangeRequest, approveChangeRequest };
