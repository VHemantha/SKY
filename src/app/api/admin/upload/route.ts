import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { IMAGE_TYPES, MAX_UPLOAD_BYTES, saveUpload } from "@/lib/uploads";

// Magic bytes so a renamed file can't pretend to be an image.
function looksLikeImage(buf: Buffer, type: string) {
  switch (type) {
    case "image/jpeg":
      return buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    case "image/png":
      return buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/webp":
      return buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP";
    case "image/avif":
      return buf.subarray(4, 12).toString("ascii").startsWith("ftypavi");
    default:
      return false;
  }
}

export async function POST(request: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }
  const ext = IMAGE_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Please upload a JPG, PNG, WebP or AVIF image." }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image is larger than 8 MB. Please resize it first." }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (!looksLikeImage(buf, file.type)) {
    return NextResponse.json({ error: "That file doesn't look like a valid image." }, { status: 400 });
  }

  const name = `${randomUUID()}.${ext}`;
  await saveUpload(name, buf, file.type);

  return NextResponse.json({ url: `/uploads/${name}` });
}
