import { prisma } from "../config/database.js";

export async function createDeployment(req, res) {
  try {
    const { id } = req.params;
    const {
      branch = "main",
      commit_sha,
      environment = "staging",
      deployment_provider = "Vercel / Local Preview Sandbox",
      preview_url,
    } = req.body;

    const deployment = await prisma.deployments.create({
      data: {
        project_id: BigInt(id),
        branch,
        commit_sha: commit_sha || "live-preview",
        environment,
        deployment_provider,
        preview_url: preview_url || `https://preview.devmatrix.local/demo/${id}`,
        status: "ready",
        started_at: new Date(),
        finished_at: new Date(),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Virtual environment & live preview link deployed.",
      deployment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error launching preview deployment." });
  }
}

export async function getDeployments(req, res) {
  try {
    const { id } = req.params;
    const deployments = await prisma.deployments.findMany({
      where: { project_id: BigInt(id) },
      orderBy: { created_at: "desc" },
    });
    return res.status(200).json({ success: true, deployments });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching deployments." });
  }
}

export default { createDeployment, getDeployments };
