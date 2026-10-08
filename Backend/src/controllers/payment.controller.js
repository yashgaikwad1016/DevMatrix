import crypto from "crypto";
import razorpayInstance from "../config/razorpay.js";
import config from "../config/env.js";
import { prisma } from "../config/database.js";
import { generateReceiptNumber } from "../utils/numberGenerators.js";
import { generateReceiptPDF } from "../services/pdf.service.js";

// ==========================================
// 1. CREATE PAYMENT ORDER (RAZORPAY)
// ==========================================
export async function createPaymentOrder(req, res) {
  try {
    const { projectId, paymentType = "advance" } = req.body;
    const user = req.user;

    const project = await prisma.projects.findUnique({
      where: { id: BigInt(projectId) },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found." });
    }

    let amount = 0;
    if (paymentType === "advance") {
      amount = Number(project.advance_amount);
    } else if (paymentType === "final") {
      amount = Number(project.remaining_amount);
    } else {
      amount = Number(req.body.amount || 0);
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid payment amount calculated." });
    }

    const paymentNumber = `PAY-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    let razorpayOrderId = null;

    if (razorpayInstance) {
      const order = await razorpayInstance.orders.create({
        amount: Math.round(amount * 100), // amount in paise
        currency: "INR",
        receipt: paymentNumber,
        notes: {
          project_id: String(project.id),
          payment_type: paymentType,
          client_id: String(user.id),
        },
      });
      razorpayOrderId = order.id;
    } else {
      // Mock / Offline order ID for development testing
      razorpayOrderId = `order_mock_${Date.now()}`;
    }

    const paymentRecord = await prisma.payments.create({
      data: {
        project_id: project.id,
        client_id: user.id,
        payment_number: paymentNumber,
        payment_type: paymentType,
        amount,
        currency: "INR",
        razorpay_order_id: razorpayOrderId,
        status: "created",
      },
    });

    return res.status(200).json({
      success: true,
      order: {
        id: razorpayOrderId,
        amount: Math.round(amount * 100),
        currency: "INR",
        key: config.RAZORPAY_KEY_ID || "rzp_test_Tju7lur4qUuWSp",
      },
      paymentRecord,
    });
  } catch (error) {
    console.error("Create Payment Order Error:", error);
    return res.status(500).json({ success: false, message: "Could not create payment order.", error: error.message });
  }
}

// ==========================================
// 2. VERIFY PAYMENT (SIGNATURE)
// ==========================================
export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const paymentRecord = await prisma.payments.findFirst({
      where: { razorpay_order_id },
      include: { projects: true },
    });

    if (!paymentRecord) {
      return res.status(404).json({ success: false, message: "Payment transaction record not found." });
    }

    // Verify signature if secret configured
    if (config.RAZORPAY_KEY_SECRET && razorpay_signature) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      if (expectedSignature !== razorpay_signature && !razorpay_order_id.startsWith("order_mock_")) {
        await prisma.payments.update({
          where: { id: paymentRecord.id },
          data: { status: "failed", failure_reason: "Signature mismatch" },
        });
        return res.status(400).json({ success: false, message: "Invalid payment signature." });
      }
    }

    // Update payment record to PAID
    const updatedPayment = await prisma.payments.update({
      where: { id: paymentRecord.id },
      data: {
        status: "paid",
        razorpay_payment_id: razorpay_payment_id || `pay_mock_${Date.now()}`,
        razorpay_signature: razorpay_signature || "verified_mock_sig",
        paid_at: new Date(),
      },
    });

    // Generate electronic receipt
    const receiptNumber = await generateReceiptNumber();
    const receipt = await prisma.receipts.create({
      data: {
        payment_id: updatedPayment.id,
        receipt_number: receiptNumber,
        receipt_type: updatedPayment.payment_type,
        amount: updatedPayment.amount,
      },
    });

    // Update Project Status & Paid balances
    const project = paymentRecord.projects;
    const newTotalPaid = Number(project.total_paid) + Number(updatedPayment.amount);
    const newRemaining = Math.max(0, Number(project.total_amount) - newTotalPaid);

    let newStatus = project.status;
    let newPaymentStatus = "partially_paid";

    if (updatedPayment.payment_type === "advance") {
      newStatus = "advance_paid";
      newPaymentStatus = "partially_paid";
    } else if (updatedPayment.payment_type === "final" || newRemaining === 0) {
      newStatus = "fully_paid";
      newPaymentStatus = "fully_paid";
    }

    await prisma.projects.update({
      where: { id: project.id },
      data: {
        total_paid: newTotalPaid,
        remaining_amount: newRemaining,
        status: newStatus,
        payment_status: newPaymentStatus,
      },
    });

    // If referral exists, update status
    await prisma.referrals.updateMany({
      where: { referred_user_id: project.client_id },
      data: { status: "payment_completed" },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully!",
      payment: updatedPayment,
      receipt,
      projectStatus: newStatus,
      paymentStatus: newPaymentStatus,
    });
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ success: false, message: "Verification failed.", error: error.message });
  }
}

// ==========================================
// 3. RAZORPAY WEBHOOK (WITH IDEMPOTENCY)
// ==========================================
export async function razorpayWebhook(req, res) {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const event = req.body;
    const eventId = event.event_id || req.headers["x-razorpay-event-id"] || `evt_${Date.now()}`;

    // Webhook Idempotency Check
    const existingEvent = await prisma.payment_webhook_events.findUnique({
      where: { event_id: eventId },
    });

    if (existingEvent) {
      console.log(`Webhook event ${eventId} already processed, ignoring duplicate.`);
      return res.status(200).json({ status: "ignored_duplicate" });
    }

    // Save event record
    await prisma.payment_webhook_events.create({
      data: {
        event_id: eventId,
        event_type: event.event || "payment.captured",
        payload: event,
        signature: signature || null,
        status: "processed",
        processed_at: new Date(),
      },
    });

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return res.status(500).json({ status: "error" });
  }
}

// ==========================================
// 4. DOWNLOAD RECEIPT PDF
// ==========================================
export async function downloadReceipt(req, res) {
  try {
    const { id } = req.params; // payment ID
    const payment = await prisma.payments.findUnique({
      where: { id: BigInt(id) },
      include: {
        receipts: true,
        projects: true,
      },
    });

    if (!payment || !payment.receipts) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }

    const pdfBuffer = await generateReceiptPDF(payment.receipts, payment, payment.projects);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${payment.receipts.receipt_number}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("Download Receipt Error:", error);
    return res.status(500).json({ success: false, message: "Failed to download receipt." });
  }
}

export default { createPaymentOrder, verifyPayment, razorpayWebhook, downloadReceipt };
