import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("[quiz-leads POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
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
