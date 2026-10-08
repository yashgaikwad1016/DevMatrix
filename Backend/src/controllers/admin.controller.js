import { prisma } from "../config/database.js";
import { hashPassword } from "../utils/hash.js";

export async function getDashboardStats(req, res) {
  try {
    const totalProjects = await prisma.projects.count();
    const activeProjects = await prisma.projects.count({
      where: { status: { in: ["in_development", "advance_paid", "under_client_review"] } },
    });
    const completedProjects = await prisma.projects.count({
      where: { status: { in: ["project_completed", "fully_paid", "delivered"] } },
    });

    const totalClients = await prisma.users.count({ where: { role: "client" } });
    const totalDevelopers = await prisma.users.count({ where: { role: "developer" } });

    // Sum total revenue
    const payments = await prisma.payments.findMany({
      where: { status: "paid" },
      select: { amount: true },
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);

    const recentProjects = await prisma.projects.findMany({
      orderBy: { created_at: "desc" },
      take: 5,
      include: {
        users_projects_client_idTousers: { select: { id: true, name: true, email: true } },
      },
    });

    const recentPayments = await prisma.payments.findMany({
      where: { status: "paid" },
      orderBy: { paid_at: "desc" },
      take: 5,
      include: {
        projects: { select: { project_number: true, project_name: true } },
        users: { select: { name: true, email: true } },
      },
    });

    return res.status(200).json({
      success: true,
      stats: {
        total_projects: totalProjects,
        active_projects: activeProjects,
        completed_projects: completedProjects,
        total_clients: totalClients,
        total_developers: totalDevelopers,
        total_revenue: totalRevenue,
      },
      recent_projects: recentProjects,
      recent_payments: recentPayments,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ success: false, message: "Error fetching admin stats." });
  }
}

export async function getClients(req, res) {
  try {
    const clients = await prisma.users.findMany({
      where: { role: "client" },
      orderBy: { created_at: "desc" },
      include: {
        projects: { select: { id: true, project_number: true, status: true, total_amount: true } },
      },
    });
    return res.status(200).json({ success: true, clients });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching clients." });
  }
}

export async function getDevelopers(req, res) {
  try {
    const developers = await prisma.users.findMany({
      where: { role: "developer" },
      orderBy: { created_at: "desc" },
      include: {
        developer_profiles: true,
      },
    });
    return res.status(200).json({ success: true, developers });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching developers." });
  }
}

export async function getAuditLogs(req, res) {
  try {
    const logs = await prisma.audit_logs.findMany({
      orderBy: { created_at: "desc" },
      take: 50,
      include: {
        users: { select: { name: true, email: true } },
        projects: { select: { project_number: true, project_name: true } },
      },
    });
    return res.status(200).json({ success: true, logs });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching audit logs." });
  }
}

export async function seedInitialAdmin(req, res) {
  try {
    const adminEmail = "admin@devmatrix.com";
    let admin = await prisma.users.findUnique({ where: { email: adminEmail } });

    if (!admin) {
      const passwordHash = await hashPassword("Admin@123456");
      admin = await prisma.users.create({
        data: {
          name: "System Administrator",
          email: adminEmail,
          password_hash: passwordHash,
          role: "admin",
          user_type: "employee",
          is_email_verified: true,
          is_active: true,
          referral_code: "ADMIN001",
        },
      });
      return res.status(201).json({
        success: true,
        message: "Initial Admin created: admin@devmatrix.com / Admin@123456",
        admin: { id: admin.id.toString(), email: admin.email, role: admin.role },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin account already exists.",
      admin: { id: admin.id.toString(), email: admin.email, role: admin.role },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating admin seed.", error: error.message });
  }
}

export default { getDashboardStats, getClients, getDevelopers, getAuditLogs, seedInitialAdmin };
