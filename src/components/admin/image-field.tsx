"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, ArrowLeft, ArrowRight } from "lucide-react";

export async function upload(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Upload failed.");
  return json.url as string;
}

export const ACCEPT = "image/jpeg,image/png,image/webp,image/avif";

/** Single image picker. Stores the uploaded URL in a hidden input called `name`. */
export function ImageField({ name, label, defaultValue, hint }: { name: string; label: string; defaultValue?: string | null; hint?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setUrl(await upload(file));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-sand-100 ring-1 ring-sand-200 sm:w-64">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-sm text-ink/40">No image</div>
          )}
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="h-6 w-6 animate-spin text-jungle-700" />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={() => input.current?.click()} className="btn border border-sand-300 bg-white px-4 py-2 hover:bg-sand-100">
            <ImagePlus className="h-4 w-4" aria-hidden /> {url ? "Replace image" : "Upload image"}
          </button>
          {url && (
            <button type="button" onClick={() => setUrl("")} className="btn px-4 py-2 text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" aria-hidden /> Remove
            </button>
          )}
          <p className="max-w-56 text-xs text-ink/50">{hint ?? "JPG, PNG or WebP up to 8 MB. Landscape photos work best."}</p>
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input ref={input} type="file" accept={ACCEPT} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
    </div>
  );
}

/** Multi-image gallery. Stores a JSON array of URLs in a hidden input called `name`. */
export function GalleryField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string[] }) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files);
    setBusy(list.length);
    for (const file of list) {
      try {
        const url = await upload(file);
        setUrls((u) => [...u, url]);
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`);
      } finally {
        setBusy((b) => b - 1);
      }
    }
    if (input.current) input.current.value = "";
  }

  const move = (i: number, dir: -1 | 1) =>
    setUrls((u) => {
      const next = [...u];
      const j = i + dir;
      if (j < 0 || j >= next.length) return u;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  return (
    <div>
      <span className="label">{label}</span>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {urls.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-sand-100 ring-1 ring-sand-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move left" className="rounded p-1 text-white hover:bg-white/20">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setUrls((u) => u.filter((x) => x !== url))} aria-label="Remove photo" className="rounded p-1 text-white hover:bg-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move right" className="rounded p-1 text-white hover:bg-white/20">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="grid aspect-square place-items-center rounded-xl border-2 border-dashed border-sand-300 text-sm text-ink/50 hover:border-jungle-400 hover:text-jungle-700"
        >
          {busy > 0 ? (
            <Loader2 className="h-6 w-6 animate-spin" aria-label="Uploading" />
          ) : (
            <span className="flex flex-col items-center gap-1">
              <ImagePlus className="h-6 w-6" aria-hidden /> Add photos
            </span>
          )}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <input ref={input} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
}
