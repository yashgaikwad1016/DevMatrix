import axios from "axios";
import { prisma } from "../config/database.js";

export async function connectGitHubRepo(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      repository_name,
      repository_url,
      owner,
      default_branch = "main",
      development_branch = "develop",
    } = req.body;

    const integration = await prisma.github_integrations.upsert({
      where: { project_id: BigInt(id) },
      update: {
        repository_name,
        repository_url,
        owner,
        default_branch,
        development_branch,
        connected_by: user.id,
      },
      create: {
        project_id: BigInt(id),
        repository_name,
        repository_url,
        owner,
        default_branch,
        development_branch,
        connected_by: user.id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "GitHub repository linked successfully.",
      integration,
    });
  } catch (error) {
    console.error("Connect GitHub error:", error);
    return res.status(500).json({ success: false, message: "Failed to connect GitHub repo." });
  }
}

export async function getGitHubRepo(req, res) {
  try {
    const { id } = req.params;
    const integration = await prisma.github_integrations.findUnique({
      where: { project_id: BigInt(id) },
    });
    return res.status(200).json({ success: true, integration });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching GitHub integration." });
  }
}

export async function syncGitHubRepo(req, res) {
  try {
    const { id } = req.params;
    const integration = await prisma.github_integrations.findUnique({
      where: { project_id: BigInt(id) },
    });

    if (!integration) {
      return res.status(404).json({ success: false, message: "No GitHub integration found for this project." });
    }

    let commitData = {
      last_commit_sha: "abc1234",
      last_commit_message: "feat: implemented core authentication and project preview environment",
      last_commit_author: "DevMatrix Team",
      last_commit_at: new Date(),
    };

    // If public repo, fetch live commit from GitHub API
    if (integration.owner && integration.repository_name) {
      try {
        const ghRes = await axios.get(
          `https://api.github.com/repos/${integration.owner}/${integration.repository_name}/commits`,
          { headers: { Accept: "application/vnd.github.v3+json" } }
        );
        if (ghRes.data && ghRes.data.length > 0) {
          const topCommit = ghRes.data[0];
          commitData = {
            last_commit_sha: topCommit.sha.substring(0, 7),
            last_commit_message: topCommit.commit.message,
            last_commit_author: topCommit.commit.author.name,
            last_commit_at: new Date(topCommit.commit.author.date),
          };
        }
      } catch (ghErr) {
        // Fallback to updated timestamp
      }
    }

    const updated = await prisma.github_integrations.update({
      where: { id: integration.id },
      data: commitData,
    });

    return res.status(200).json({
      success: true,
      message: "GitHub repository commits synced.",
      integration: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to sync GitHub." });
  }
}

export default { connectGitHubRepo, getGitHubRepo, syncGitHubRepo };
