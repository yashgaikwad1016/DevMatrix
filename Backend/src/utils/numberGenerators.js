import { prisma } from "../config/database.js";

export const generateProjectNumber = async () => {
  let count = await prisma.projects.count();
  let candidate = "";
  let exists = true;
  while (exists) {
    count++;
    candidate = `DM-PRJ-${count.toString().padStart(6, "0")}`;
    const found = await prisma.projects.findUnique({
      where: { project_number: candidate },
    });
    if (!found) exists = false;
  }
  return candidate;
};

export const generateQuotationNumber = async () => {
  const year = new Date().getFullYear();
  let count = await prisma.quotations.count();
  let candidate = "";
  let exists = true;
  while (exists) {
    count++;
    candidate = `QTN-${year}-${count.toString().padStart(5, "0")}`;
    const found = await prisma.quotations.findUnique({
      where: { quotation_number: candidate },
    });
    if (!found) exists = false;
  }
  return candidate;
};

export const generateReceiptNumber = async () => {
  const year = new Date().getFullYear();
  let count = await prisma.receipts.count();
  let candidate = "";
  let exists = true;
  while (exists) {
    count++;
    candidate = `REC-${year}-${count.toString().padStart(5, "0")}`;
    const found = await prisma.receipts.findUnique({
      where: { receipt_number: candidate },
    });
    if (!found) exists = false;
  }
  return candidate;
};

export const generateReferralCode = (name = "USER") => {
  const clean = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4) || "DEVM";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${clean}${rand}`;
};
