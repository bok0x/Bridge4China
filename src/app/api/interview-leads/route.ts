import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, whatsapp, serviceType } = body;

    if (!fullName || !email || !whatsapp || !serviceType) {
      return NextResponse.json(
        { error: "Missing required fields: fullName, email, whatsapp, serviceType" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const lead = await prisma.interviewLead.create({
      data: {
        fullName,
        email,
        whatsapp,
        serviceType,
      },
    });

    // Non-blocking email notification
    getResend().emails.send({
      from: 'Bridge4China <onboarding@resend.dev>',
      to: 'Antoineformula@gmail.com',
      subject: `New ${serviceType === 'interview_prep' ? 'Interview Prep' : 'CSCA'} Lead — ${fullName}`,
      html: `<h2>New Service Lead</h2><p><b>Service:</b> ${serviceType}</p><p><b>Name:</b> ${fullName}</p><p><b>Email:</b> ${email}</p><p><b>WhatsApp:</b> ${whatsapp}</p>`,
    }).catch(console.error)

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[interview-leads POST]", error);
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
    const leads = await prisma.interviewLead.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(leads);
  } catch (error) {
    console.error("[interview-leads GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
