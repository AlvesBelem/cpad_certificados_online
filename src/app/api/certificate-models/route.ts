import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const certificateSlug = searchParams.get("certificateSlug");

  if (!certificateSlug) {
    return NextResponse.json({ message: "Informe o certificado." }, { status: 400 });
  }

  const models = await prisma.certificateModel.findMany({
    where: {
      certificateSlug,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    models: models.map((model) => ({
      id: model.id,
      name: model.name,
      slug: model.slug,
      previewImage: model.previewImage,
      backgroundImage: model.backgroundImage,
      topBorderImage: model.topBorderImage,
      bottomBorderImage: model.bottomBorderImage,
      accentColor: model.accentColor,
      certificateSlug: model.certificateSlug,
      createdAt: model.createdAt.toISOString(),
    })),
  });
}
