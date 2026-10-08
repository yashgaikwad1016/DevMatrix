import crypto from "crypto";

export const SERVER_BOOT_ID = crypto.randomUUID();
export const SERVER_BOOT_TIME = new Date();

console.log(`[ServerInstance] Boot ID: ${SERVER_BOOT_ID}`);
