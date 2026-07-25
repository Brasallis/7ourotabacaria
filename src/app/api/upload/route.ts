import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Diretório public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads");
    
    // Criar diretório se não existir
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Nome único para evitar conflitos
    const uniqueName = `${Date.now()}-${file.name.replace(/\s/g, '-')}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Salvar o arquivo
    await writeFile(filePath, buffer);
    
    // Retornar a URL relativa
    return NextResponse.json({ url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}
