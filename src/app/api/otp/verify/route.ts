import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Missing email or code." }, { status: 400 });
  }

  const codeHash = createHash("sha256").update(code).digest("hex");

  const otpRecord = await prisma.quizOtp.findFirst({
    where: {
      email,
      codeHash,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    return NextResponse.json({ error: "Invalid or expired code. Please try again." }, { status: 400 });
  }

  await prisma.quizOtp.update({ where: { id: otpRecord.id }, data: { used: true } });

  const fd = otpRecord.formData as {
    fullName: string;
    whatsapp: string;
    quizAnswers: unknown;
    recommendations?: { university: string; major: string }[];
    leadSource: string;
  };

  const recommendedMajors = fd.recommendations?.map(r => r.major) ?? [];
  const recommendedUniversities = fd.recommendations?.map(r => r.university) ?? [];

  await prisma.quizLead.create({
    data: {
      fullName: fd.fullName,
      email,
      whatsapp: fd.whatsapp,
      quizAnswers: fd.quizAnswers as never,
      recommendedMajors,
      recommendedUniversities,
      leadSource: fd.leadSource ?? "quiz",
    },
  });

  getResend().emails.send({
    from: "Bridge4China <onboarding@resend.dev>",
    to: "Antoineformula@gmail.com",
    subject: `New Verified Lead — ${fd.fullName} [${fd.leadSource}]`,
    html: `<h2>New Verified Lead</h2><p><b>Name:</b> ${fd.fullName}</p><p><b>Email:</b> ${email}</p><p><b>WhatsApp:</b> ${fd.whatsapp}</p><p><b>Source:</b> ${fd.leadSource}</p>`,
  }).catch(console.error);

  return NextResponse.json({ success: true });
}
