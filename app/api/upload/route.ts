export const runtime = "nodejs"; // IMPORTANT

import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const data = await req.formData();
  const file: any = data.get("file");

  // file check
  if (!file) {
    return Response.json({ error: "No file uploaded" });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // unique name (important)
  const fileName = Date.now() + "-" + file.name;

  const filePath = path.join(process.cwd(), "public/uploads", fileName);

  await writeFile(filePath, buffer);

  return Response.json({
    message: "Uploaded",
    path: `/uploads/${fileName}`
  });
}