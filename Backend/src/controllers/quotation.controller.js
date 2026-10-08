import { prisma } from "../config/database.js";
import { generateQuotationNumber } from "../utils/numberGenerators.js";
import { generateQuotationPDF } from "../services/pdf.service.js";

// ==========================================
// 1. CREATE QUOTATION (ADMIN)
// ==========================================
export async function createQuotation(req, res) {
  try {
    const { id } = req.params;
    const projectId = BigInt(id);
    const user = req.user;

    const {
      items = [], // [{ item_name, description, quantity, unit_price }]
      advance_percentage = 40.0,
      urgent_fee = 0.0,
      tax = 0.0,
      notes,
      terms,
      valid_until,
    } = req.body;

    const project = await prisma.projects.findUnique({
      where: { id: projectId },
      include: { users_projects_client_idTousers: true },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    // Calculate subtotal from items
    let subtotal = 0;
    const computedItems = items.map((it, idx) => {
      const qty = Number(it.quantity || 1);
      const price = Number(it.unit_price || 0);
      const amount = qty * price;
      subtotal += amount;
      return {
        item_name: it.item_name,
        description: it.description || null,
        quantity: qty,
        unit_price: price,
        amount,
        sort_order: idx + 1,
      };
    });

    // Check referral discount
    let referralDiscount = 0;
    const referral = await prisma.referrals.findFirst({
      where: { referred_user_id: project.client_id, status: { in: ["registered", "project_created"] } },
    });

    if (referral) {
      const refSetting = await prisma.referral_settings.findFirst({ where: { enabled: true } });
      if (refSetting) {
        if (refSetting.discount_type === "percentage") {
          const discountPct = Number(refSetting.discount_value);
          referralDiscount = (subtotal * discountPct) / 100;
          if (refSetting.maximum_discount && referralDiscount > Number(refSetting.maximum_discount)) {
            referralDiscount = Number(refSetting.maximum_discount);
          }
        } else {
          referralDiscount = Number(refSetting.discount_value);
        }
      }
    }

    const totalAmount = Math.max(0, subtotal - referralDiscount + Number(urgent_fee) + Number(tax));
    const advanceAmount = (totalAmount * Number(advance_percentage)) / 100;
    const remainingAmount = totalAmount - advanceAmount;

    const quotationNumber = await generateQuotationNumber();

    const newQuotation = await prisma.quotations.create({
      data: {
        project_id: projectId,
        quotation_number: quotationNumber,
        quotation_type: "initial",
        subtotal,
        discount: 0,
        referral_discount: referralDiscount,
        urgent_fee: Number(urgent_fee),
        tax: Number(tax),
        total_amount: totalAmount,
        advance_percentage: Number(advance_percentage),
        advance_amount: advanceAmount,
        remaining_amount: remainingAmount,
        currency: "INR",
        valid_until: valid_until ? new Date(valid_until) : null,
        notes: notes || null,
        terms: terms || "40% advance required to initiate sprint work. Remaining balance payable upon code completion.",
        status: "sent",
        created_by: user.id,
        quotation_items: {
          create: computedItems,
        },
      },
      include: { quotation_items: true },
    });

    // Update project financials and status
    await prisma.projects.update({
      where: { id: projectId },
      data: {
        status: "quotation_sent",
        total_amount: totalAmount,
        advance_amount: advanceAmount,
        remaining_amount: remainingAmount,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Quotation created and delivered to client.",
      quotation: newQuotation,
    });
  } catch (error) {
    console.error("Create Quotation Error:", error);
    return res.status(500).json({ success: false, message: "Failed to generate quotation.", error: error.message });
  }
}

// ==========================================
// 2. GET PROJECT QUOTATIONS
// ==========================================
export async function getQuotations(req, res) {
  try {
    const { id } = req.params;
    const projectId = BigInt(id);

    const quotations = await prisma.quotations.findMany({
      where: { project_id: projectId },
      orderBy: { created_at: "desc" },
      include: { quotation_items: true },
    });

    return res.status(200).json({ success: true, quotations });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load quotations." });
  }
}

// ==========================================
// 3. ACCEPT QUOTATION (CLIENT)
// ==========================================
export async function acceptQuotation(req, res) {
  try {
    const { quotationId } = req.params;
    const qId = BigInt(quotationId);
    const user = req.user;

    const quotation = await prisma.quotations.findUnique({
      where: { id: qId },
      include: { projects: true },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found." });
    }

    await prisma.quotations.update({
      where: { id: qId },
      data: {
        status: "accepted",
        accepted_by: user.id,
        accepted_at: new Date(),
      },
    });

    await prisma.projects.update({
      where: { id: quotation.project_id },
      data: {
        status: "awaiting_advance",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Quotation accepted! Proceed to advance payment to begin development.",
      quotation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to accept quotation." });
  }
}

// ==========================================
// 4. DOWNLOAD QUOTATION PDF
// ==========================================
export async function downloadQuotationPDF(req, res) {
  try {
    const { quotationId } = req.params;
    const qId = BigInt(quotationId);

    const quotation = await prisma.quotations.findUnique({
      where: { id: qId },
      include: {
        quotation_items: true,
        projects: {
          include: { users_projects_client_idTousers: true },
        },
      },
    });

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found." });
    }

    const pdfBuffer = await generateQuotationPDF(quotation, quotation.projects);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${quotation.quotation_number}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to download quotation PDF." });
  }
}

export default { createQuotation, getQuotations, acceptQuotation, downloadQuotationPDF };
