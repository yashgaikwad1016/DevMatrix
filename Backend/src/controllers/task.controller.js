import { prisma } from "../config/database.js";

// ==========================================
// 1. MILESTONES
// ==========================================
export async function getMilestones(req, res) {
  try {
    const { id } = req.params;
    const milestones = await prisma.project_milestones.findMany({
      where: { project_id: BigInt(id) },
      orderBy: { sequence_no: "asc" },
      include: { tasks: true },
    });
    return res.status(200).json({ success: true, milestones });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error loading milestones." });
  }
}

export async function createMilestone(req, res) {
  try {
    const { id } = req.params;
    const { milestone_key, name, sequence_no } = req.body;

    const count = await prisma.project_milestones.count({ where: { project_id: BigInt(id) } });

    const milestone = await prisma.project_milestones.create({
      data: {
        project_id: BigInt(id),
        milestone_key: milestone_key || `milestone_${Date.now()}`,
        name,
        sequence_no: Number(sequence_no || count + 1),
        status: "pending",
      },
    });
    return res.status(201).json({ success: true, milestone });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating milestone." });
  }
}

// ==========================================
// 2. TASKS
// ==========================================
export async function getTasks(req, res) {
  try {
    const { id } = req.params;
    const tasks = await prisma.tasks.findMany({
      where: { project_id: BigInt(id) },
      orderBy: { created_at: "desc" },
      include: {
        users: { select: { id: true, name: true, email: true } },
      },
    });
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error loading tasks." });
  }
}

export async function createTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, milestone_id, assigned_to, priority, estimated_hours, due_date } = req.body;

    const task = await prisma.tasks.create({
      data: {
        project_id: BigInt(id),
        milestone_id: milestone_id ? BigInt(milestone_id) : null,
        title,
        description: description || null,
        assigned_to: assigned_to ? BigInt(assigned_to) : null,
        priority: priority || "medium",
        estimated_hours: estimated_hours ? Number(estimated_hours) : null,
        due_date: due_date ? new Date(due_date) : null,
        status: "todo",
      },
    });
    return res.status(201).json({ success: true, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating task." });
  }
}

export async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const { status, title, description, actual_hours } = req.body;

    const data = {};
    if (status) {
      data.status = status;
      if (status === "completed") data.completed_at = new Date();
    }
    if (title) data.title = title;
    if (description !== undefined) data.description = description;
    if (actual_hours !== undefined) data.actual_hours = Number(actual_hours);

    const updated = await prisma.tasks.update({
      where: { id: BigInt(taskId) },
      data,
    });
    return res.status(200).json({ success: true, task: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating task." });
  }
}

export default { getMilestones, createMilestone, getTasks, createTask, updateTask };
