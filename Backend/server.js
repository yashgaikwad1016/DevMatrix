import app from "./src/app.js";
import config from "./src/config/env.js";
import { connectDatabases, prisma } from "./src/config/database.js";
import { SERVER_BOOT_ID } from "./src/config/serverInstance.js";

const PORT = config.PORT || 5000;

async function startServer() {
  await connectDatabases();

  // Invalidate any sessions from before this server run
  try {
    await prisma.user_sessions.updateMany({
      where: { revoked_at: null },
      data: { revoked_at: new Date() },
    });
  } catch (err) {
    // ignore if table empty or error
  }

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 DEVMATRIX Backend API running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🛡️  Environment: ${config.NODE_ENV}`);
    console.log(`🔑 Server Boot ID: ${SERVER_BOOT_ID}`);
    console.log(`===============================================`);
  });
}

startServer();
