import { prisma } from "../config/database.js";

export async function getReferralStats(req, res) {
  try {
    const user = req.user;

    const referrals = await prisma.referrals.findMany({
      where: { referrer_id: user.id },
      include: {
        users_referrals_referred_user_idTousers: {
          select: { id: true, name: true, email: true, created_at: true },
        },
      },
    });

    const settings = await prisma.referral_settings.findFirst({
      where: { enabled: true },
    });

    const totalSuccessful = referrals.filter((r) => r.status === "payment_completed" || r.status === "rewarded").length;
    const totalDiscountGenerated = referrals.reduce((acc, curr) => acc + Number(curr.discount_amount || 0), 0);

    return res.status(200).json({
      success: true,
      referral_code: user.referral_code,
      total_referred: referrals.length,
      successful_referrals: totalSuccessful,
      total_savings_generated: totalDiscountGenerated,
      settings: settings || { discount_value: 10, discount_type: "percentage" },
      referrals: referrals.map((r) => ({
        id: r.id.toString(),
        referred_user: r.users_referrals_referred_user_idTousers.name,
        email: r.users_referrals_referred_user_idTousers.email,
        status: r.status,
        discount_amount: Number(r.discount_amount || 0),
        created_at: r.created_at,
      })),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching referral details." });
  }
}

export async function checkReferralCode(req, res) {
  try {
    const { code } = req.query;
    if (!code) {
      return res.status(400).json({ success: false, message: "Referral code required." });
    }

    const referrer = await prisma.users.findUnique({
      where: { referral_code: code.trim().toUpperCase() },
      select: { id: true, name: true },
    });

    if (!referrer) {
      return res.status(404).json({ success: false, message: "Invalid referral code." });
    }

    const settings = await prisma.referral_settings.findFirst({ where: { enabled: true } });

    return res.status(200).json({
      success: true,
      valid: true,
      referrer_name: referrer.name,
      discount_type: settings?.discount_type || "percentage",
      discount_value: settings?.discount_value || 10,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error validating referral code." });
  }
}

export default { getReferralStats, checkReferralCode };
