import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { NextResponse, type NextRequest } from "next/server";
import sharp from "sharp";
import { CERTIFICATE_TEMPLATES } from "@/constants/certificates";
import { prisma } from "@/lib/prisma";
import { normalizeRole, UserRole } from "@/lib/roles";
import { requireSessionForAction } from "@/lib/session";
import { slugify } from "@/lib/slugify";

type BinaryBuffer = Buffer<ArrayBufferLike>;

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function resolveTenantSlug(raw: FormDataEntryValue | null) {
  const rawValue = typeof raw === "string" ? raw.trim() : "";
  return rawValue ? slugify(rawValue) : "default";
}

async function persistFile(file: File, subFolder: string, tenantSlug: string) {
  const arrayBuffer = await file.arrayBuffer();
  let buffer = Buffer.from(arrayBuffer) as BinaryBuffer;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "tenants", tenantSlug, subFolder);
  await fs.mkdir(uploadDir, { recursive: true });

  const extensionFromName = path.extname(file.name) || "";
  const extensionFromType = file.type?.split("/").pop();
  let extension = (extensionFromName || (extensionFromType ? `.${extensionFromType}` : "")).replace(/[^.\w]/g, "");

  const isImage = (file.type || "").startsWith("image/");
  if (isImage) {
    try {
      const optimized = await optimizeImage(buffer);
      buffer = optimized.buffer;
      extension = optimized.extension;
    } catch (error) {
      console.warn("Falha ao otimizar imagem, usando original:", error);
    }
  }

  const fileName = `${Date.now()}-${randomUUID()}${extension || ""}`;
  const filePath = path.join(uploadDir, fileName);
  await fs.writeFile(filePath, buffer);

  return `/uploads/tenants/${tenantSlug}/${subFolder}/${fileName}`;
}

async function deleteStaticFile(filePath: string | null | undefined) {
  if (!filePath) {
    return;
  }
  const normalizedPath = filePath.replace(/^[/\\]+/, "");
  const absolutePath = path.join(process.cwd(), "public", normalizedPath);
  await fs.unlink(absolutePath).catch(() => undefined);
}

const MAX_IMAGE_WIDTH = 3508;
const MAX_IMAGE_HEIGHT = 2480;

async function optimizeImage(buffer: BinaryBuffer): Promise<{ buffer: BinaryBuffer; extension: string }> {
  const pipeline = sharp(buffer, { failOnError: false }).rotate();
  const metadata = await pipeline.metadata();

  let resized = pipeline;
  if (
    (metadata.width && metadata.width > MAX_IMAGE_WIDTH) ||
    (metadata.height && metadata.height > MAX_IMAGE_HEIGHT)
  ) {
    resized = resized.resize({
      width: MAX_IMAGE_WIDTH,
      height: MAX_IMAGE_HEIGHT,
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  const hasAlpha = Boolean(metadata.hasAlpha ?? (metadata.channels && metadata.channels > 3));
  const format = hasAlpha ? "png" : "jpeg";
  const optimizedBuffer =
    format === "png"
      ? ((await resized.png({ compressionLevel: 9, quality: 80 }).toBuffer()) as BinaryBuffer)
      : ((await resized.jpeg({ quality: 82 }).toBuffer()) as BinaryBuffer);

  return {
    buffer: optimizedBuffer,
    extension: format === "png" ? ".png" : ".jpg",
  };
}

export async function POST(request: NextRequest) {
  const session = await requireSessionForAction();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const rawName = formData.get("name");
    const rawSlug = formData.get("slug");
    const description = formData.get("description");
    const category = formData.get("category");
    const accentColor = formData.get("accentColor");
    const certificateSlug = formData.get("certificateSlug");

    if (typeof certificateSlug !== "string" || !certificateSlug.trim()) {
      return NextResponse.json({ message: "Informe o certificado base." }, { status: 400 });
    }

    const trimmedCertificateSlug = certificateSlug.trim();
    const templateDefinition = CERTIFICATE_TEMPLATES.find((template) => template.slug === trimmedCertificateSlug);

    const name =
      typeof rawName === "string" && rawName.trim()
        ? rawName.trim()
        : templateDefinition?.title || trimmedCertificateSlug;

    if (!name) {
      return NextResponse.json({ message: "Informe o nome do modelo." }, { status: 400 });
    }

    const providedSlug = typeof rawSlug === "string" ? rawSlug.trim() : "";
    const slugBase =
      providedSlug || `${templateDefinition?.slug || trimmedCertificateSlug}-${Date.now().toString(36)}`;
    const computedSlug = slugify(slugBase);

    const existing = await prisma.certificateModel.findUnique({
      where: { slug: computedSlug },
    });

    if (existing) {
      return NextResponse.json({ message: "Ja existe um modelo com esse slug." }, { status: 409 });
    }

    const tenantSlug = resolveTenantSlug(formData.get("tenant"));

    const previewFile = isFile(formData.get("previewImage")) ? (formData.get("previewImage") as File) : null;
    const backgroundFile = isFile(formData.get("backgroundImage"))
      ? (formData.get("backgroundImage") as File)
      : null;
    const topBorderFile = isFile(formData.get("topBorderImage")) ? (formData.get("topBorderImage") as File) : null;
    const bottomBorderFile = isFile(formData.get("bottomBorderImage"))
      ? (formData.get("bottomBorderImage") as File)
      : null;

    if (!backgroundFile) {
      return NextResponse.json({ message: "Envie o fundo do certificado." }, { status: 400 });
    }

    const uploadsDir = "models";
    const [previewImage, backgroundImage, topBorderImage, bottomBorderImage] = await Promise.all([
      previewFile ? persistFile(previewFile, uploadsDir, tenantSlug) : Promise.resolve<string | null>(null),
      backgroundFile ? persistFile(backgroundFile, uploadsDir, tenantSlug) : Promise.resolve<string | null>(null),
      topBorderFile ? persistFile(topBorderFile, uploadsDir, tenantSlug) : Promise.resolve<string | null>(null),
      bottomBorderFile ? persistFile(bottomBorderFile, uploadsDir, tenantSlug) : Promise.resolve<string | null>(null),
    ]);

    const model = await prisma.certificateModel.create({
      data: {
        name,
        slug: computedSlug,
        certificateSlug: trimmedCertificateSlug,
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        category: typeof category === "string" && category.trim() ? category.trim() : null,
        accentColor: typeof accentColor === "string" && accentColor.trim() ? accentColor.trim() : null,
        previewImage,
        backgroundImage,
        topBorderImage,
        bottomBorderImage,
      },
    });

    return NextResponse.json({
      model: {
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao criar modelo:", error);
    return NextResponse.json({ message: "Nao foi possivel criar o modelo." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await requireSessionForAction();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const modelId = formData.get("modelId");
    const tenantSlug = resolveTenantSlug(formData.get("tenant"));
    const backgroundFile = isFile(formData.get("backgroundImage"))
      ? (formData.get("backgroundImage") as File)
      : null;

    if (typeof modelId !== "string" || !modelId.trim()) {
      return NextResponse.json({ message: "Informe o modelo que deseja atualizar." }, { status: 400 });
    }

    const existing = await prisma.certificateModel.findUnique({
      where: { id: modelId.trim() },
    });

    if (!existing) {
      return NextResponse.json({ message: "Modelo nao encontrado." }, { status: 404 });
    }

    if (!backgroundFile) {
      return NextResponse.json({ message: "Envie a nova imagem de fundo." }, { status: 400 });
    }

    const uploadsDir = "models";
    const newBackgroundImage = await persistFile(backgroundFile, uploadsDir, tenantSlug);

    const model = await prisma.certificateModel.update({
      where: { id: existing.id },
      data: {
        backgroundImage: newBackgroundImage,
        previewImage: newBackgroundImage,
      },
    });

    await Promise.all([
      deleteStaticFile(existing.backgroundImage),
      deleteStaticFile(existing.previewImage),
    ]);

    return NextResponse.json({
      model: {
        ...model,
        createdAt: model.createdAt.toISOString(),
        updatedAt: model.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Erro ao atualizar modelo:", error);
    return NextResponse.json({ message: "Nao foi possivel atualizar o modelo." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireSessionForAction();
  if (normalizeRole(session.user.role) !== UserRole.ADMIN) {
    return NextResponse.json({ message: "Acesso negado." }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const modelId = searchParams.get("id");

    if (!modelId) {
      return NextResponse.json({ message: "Informe o modelo que deseja excluir." }, { status: 400 });
    }

    const existing = await prisma.certificateModel.findUnique({
      where: { id: modelId },
    });

    if (!existing) {
      return NextResponse.json({ message: "Modelo nao encontrado." }, { status: 404 });
    }

    await prisma.certificateModel.delete({
      where: { id: existing.id },
    });

    await Promise.all([
      deleteStaticFile(existing.previewImage),
      deleteStaticFile(existing.backgroundImage),
      deleteStaticFile(existing.topBorderImage),
      deleteStaticFile(existing.bottomBorderImage),
    ]);

    return NextResponse.json({ success: true, id: existing.id });
  } catch (error) {
    console.error("Erro ao remover modelo:", error);
    return NextResponse.json({ message: "Nao foi possivel remover o modelo." }, { status: 500 });
  }
}
