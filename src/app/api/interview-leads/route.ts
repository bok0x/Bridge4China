import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    const lead = await prisma.interviewLead.create({
      data: {
        fullName,
        email,
        whatsapp,
        serviceType,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[interview-leads POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
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
