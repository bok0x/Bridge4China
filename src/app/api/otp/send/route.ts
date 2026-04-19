import { NextRequest, NextResponse } from "next/server";
import { createHash, randomInt } from "crypto";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, fullName, whatsapp, quizAnswers, recommendations, leadSource } = body;

  if (!email || !fullName || !whatsapp) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const code = String(randomInt(100000, 999999));
  const codeHash = createHash("sha256").update(code).digest("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.quizOtp.deleteMany({ where: { email, used: false } });

  await prisma.quizOtp.create({
    data: {
      email,
      codeHash,
      expiresAt,
      formData: { fullName, whatsapp, quizAnswers, recommendations, leadSource },
    },
  });

  getResend().emails.send({
    from: "Bridge4China <onboarding@resend.dev>",
    to: email,
    subject: "Your verification code — Bridge4China",
    html: `
      <div style="background:#030806;color:#e8f5f1;font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:48px 24px;">
        <div style="font-size:20px;font-weight:900;color:#48C59C;margin-bottom:32px;">Bridge4China</div>
        <p style="font-size:16px;margin-bottom:8px;">Hi ${fullName},</p>
        <p style="color:rgba(232,245,241,0.7);font-size:14px;line-height:1.6;margin-bottom:32px;">
          Enter this 6-digit code to verify your email and unlock your results:
        </p>
        <div style="background:rgba(72,197,156,0.1);border:1px solid rgba(72,197,156,0.3);border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;">
          <div style="font-size:48px;font-weight:900;color:#48C59C;letter-spacing:12px;">${code}</div>
          <div style="font-size:13px;color:rgba(232,245,241,0.5);margin-top:8px;">Expires in 10 minutes</div>
        </div>
        <p style="font-size:12px;color:rgba(232,245,241,0.3);">If you didn't request this, ignore this email.</p>
      </div>
    `,
  }).catch(console.error);

  return NextResponse.json({ success: true });
}
