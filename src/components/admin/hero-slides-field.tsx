"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { ACCEPT, upload } from "./image-field";
import { MAX_HERO_SLIDES, type HeroSlide } from "@/lib/hero-slides";

type Row = HeroSlide & { key: string };

let nextKey = 0;
const withKey = (s: HeroSlide): Row => ({ ...s, caption: s.caption ?? "", key: `s${nextKey++}` });

/**
 * Editor for the home page slider: upload, replace, reorder and remove photos,
 * each with alt text and an optional caption. Stores a JSON array in a hidden
 * input called `name`.
 */
export function HeroSlidesField({ name, defaultValue }: { name: string; defaultValue: HeroSlide[] }) {
  const [rows, setRows] = useState<Row[]>(() => defaultValue.map(withKey));
  const [busy, setBusy] = useState<string | null>(null); // row key being replaced, or "add"
  const [error, setError] = useState("");
  const addInput = useRef<HTMLInputElement>(null);
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceKey = useRef<string | null>(null);

  const update = (key: string, patch: Partial<HeroSlide>) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  const move = (i: number, dir: -1 | 1) =>
    setRows((r) => {
      const j = i + dir;
      if (j < 0 || j >= r.length) return r;
      const next = [...r];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  async function onAdd(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    const room = MAX_HERO_SLIDES - rows.length;
    const list = Array.from(files).slice(0, Math.max(room, 0));
    if (files.length > list.length) setError(`The slider holds up to ${MAX_HERO_SLIDES} photos.`);
    setBusy("add");
    for (const file of list) {
      try {
        const src = await upload(file);
        setRows((r) => [...r, withKey({ src, alt: "", caption: "" })]);
      } catch (e) {
        setError(`${file.name}: ${(e as Error).message}`);
      }
    }
    setBusy(null);
    if (addInput.current) addInput.current.value = "";
  }

  async function onReplace(file?: File) {
    const key = replaceKey.current;
    if (!file || !key) return;
    setError("");
    setBusy(key);
    try {
      update(key, { src: await upload(file) });
    } catch (e) {
      setError(`${file.name}: ${(e as Error).message}`);
    } finally {
      setBusy(null);
      if (replaceInput.current) replaceInput.current.value = "";
    }
  }

  const payload = rows.map(({ src, alt, caption }) => ({ src, alt, caption }));

  return (
    <div>
      <span className="label">Slider photos</span>
      <p className="mb-4 text-xs text-ink/50">
        Shown in this order, changing every 6 seconds. Use wide landscape photos, at least 1920px wide. Alt text describes the
        photo for screen readers and Google. The caption appears small beside the arrows.
      </p>
      <input type="hidden" name={name} value={JSON.stringify(payload)} />

      <ol className="space-y-3">
        {rows.map((row, i) => (
          <li key={row.key} className="flex flex-col gap-4 rounded-2xl bg-sand-50 p-3 ring-1 ring-sand-200 sm:flex-row">
            <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-sand-100 sm:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.src} alt="" className="h-full w-full object-cover" />
              <span className="absolute top-2 left-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-xs font-semibold text-white">
                {i + 1}
              </span>
              {busy === row.key && (
                <div className="absolute inset-0 grid place-items-center bg-white/70">
                  <Loader2 className="h-6 w-6 animate-spin text-jungle-700" />
                </div>
              )}
            </div>

            <div className="grid flex-1 gap-3">
              <div>
                <label htmlFor={`${row.key}-alt`} className="label">Alt text</label>
                <input
                  id={`${row.key}-alt`}
                  className="field"
                  value={row.alt}
                  maxLength={200}
                  placeholder="e.g. Leopard resting on a rock in Yala"
                  onChange={(e) => update(row.key, { alt: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor={`${row.key}-caption`} className="label">Caption (optional)</label>
                <input
                  id={`${row.key}-caption`}
                  className="field"
                  value={row.caption}
                  maxLength={80}
                  placeholder="e.g. Leopard, Yala"
                  onChange={(e) => update(row.key, { caption: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-row flex-wrap gap-1 sm:w-32 sm:flex-col">
              <button
                type="button"
                onClick={() => {
                  replaceKey.current = row.key;
                  replaceInput.current?.click();
                }}
                className="btn justify-start px-3 py-1.5 hover:bg-sand-100"
              >
                <RefreshCw className="h-4 w-4" aria-hidden /> Replace
              </button>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn justify-start px-3 py-1.5 hover:bg-sand-100 disabled:opacity-30">
                <ArrowUp className="h-4 w-4" aria-hidden /> Move up
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === rows.length - 1}
                className="btn justify-start px-3 py-1.5 hover:bg-sand-100 disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" aria-hidden /> Move down
              </button>
              <button
                type="button"
                onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                disabled={rows.length === 1}
                title={rows.length === 1 ? "The slider needs at least one photo" : undefined}
                className="btn justify-start px-3 py-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" aria-hidden /> Remove
              </button>
            </div>
          </li>
        ))}
      </ol>

      {rows.length < MAX_HERO_SLIDES && (
        <button
          type="button"
          onClick={() => addInput.current?.click()}
          disabled={busy === "add"}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sand-300 py-5 text-sm text-ink/60 hover:border-jungle-400 hover:text-jungle-700"
        >
          {busy === "add" ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Uploading" /> : <ImagePlus className="h-5 w-5" aria-hidden />}
          {busy === "add" ? "Uploading…" : "Add photos"}
        </button>
      )}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-ink/50">Changes go live when you press “Save settings”.</p>

      <input ref={addInput} type="file" accept={ACCEPT} multiple className="hidden" onChange={(e) => onAdd(e.target.files)} />
      <input ref={replaceInput} type="file" accept={ACCEPT} className="hidden" onChange={(e) => onReplace(e.target.files?.[0])} />
    </div>
  );
}
