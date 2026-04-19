// src/app/api/iq-leads/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, whatsapp, iqScore, percentile, versionNumber, totalTimeMs } = body;

    if (!fullName || !email || !whatsapp || iqScore == null || versionNumber == null) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, email, whatsapp, iqScore, versionNumber" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const result = await prisma.iqTestResult.create({
      data: {
        fullName,
        email,
        whatsapp,
        iqScore,
        percentile: percentile ?? 50,
        versionNumber,
        totalTimeMs: totalTimeMs ?? 0,
      },
    });

    getResend().emails.send({
      from: "Bridge4China <onboarding@resend.dev>",
      to: "Antoineformula@gmail.com",
      subject: `New IQ Test Lead — ${fullName} (IQ ${iqScore})`,
      html: `<h2>New IQ Test Lead</h2>
        <p><b>Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>WhatsApp:</b> ${whatsapp}</p>
        <p><b>IQ Score:</b> ${iqScore} (${percentile}th percentile)</p>
        <p><b>Version:</b> ${versionNumber}</p>
        <p><b>Total Time:</b> ${Math.round(totalTimeMs / 1000)}s</p>`,
    }).catch(console.error);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("[iq-leads POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
