import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      whatsapp,
      country,
      quizAnswers,
      recommendedMajors,
      recommendedUniversities,
      leadSource,
    } = body;

    if (!fullName || !email || !whatsapp || !quizAnswers) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, email, whatsapp, quizAnswers" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const lead = await prisma.quizLead.create({
      data: {
        fullName,
        email,
        whatsapp,
        country: country ?? null,
        quizAnswers,
        recommendedMajors: recommendedMajors ?? [],
        recommendedUniversities: recommendedUniversities ?? [],
        leadSource: leadSource ?? "quiz",
      },
    });

    // Non-blocking email notification
    getResend().emails.send({
      from: 'Bridge4China <onboarding@resend.dev>',
      to: 'Antoineformula@gmail.com',
      subject: `New Quiz Lead — ${fullName}`,
      html: `<h2>New Quiz Lead</h2><p><b>Name:</b> ${fullName}</p><p><b>Email:</b> ${email}</p><p><b>WhatsApp:</b> ${whatsapp}</p><p><b>Country:</b> ${country || 'N/A'}</p>`,
    }).catch(console.error)

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[quiz-leads POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== `Bearer ${adminSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await prisma.quizLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("[quiz-leads GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
