import { readUpload } from "@/lib/uploads";

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function GET(_request: Request, { params }: RouteContext<"/uploads/[name]">) {
  const { name } = await params;
  const data = await readUpload(name);
  if (!data) return new Response("Not found", { status: 404 });

  return new Response(data as Uint8Array<ArrayBuffer>, {
    headers: {
      "Content-Type": MIME[name.split(".").pop()!],
      // File names are random UUIDs, so they never change.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
