/* eslint-disable @next/next/no-img-element -- generated data URLs are rendered directly for download fidelity. */
"use client";

import { ChangeEvent, PointerEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

const CARD_W = 1536;
const CARD_H = 1024;
// Coordinates are relative to the 768px-wide front card in the supplied template.
// Inner edge of the existing dashed photo frame; the template border remains visible.
const PHOTO_FRAME = { x: 80, y: 642, width: 234, height: 279, radius: 18 };
const DEBUG_TEMPLATE = false;
const TEXT_FIELDS = {
  // These are the visual centers of the blank text zones, deliberately above
  // the template's existing artwork rules at y≈742, 818, and 894.
  name: { x: 404, centerY: 714, maxWidth: 291, maxFontSize: 40, minFontSize: 18 },
  role: { x: 404, centerY: 790, maxWidth: 291, maxFontSize: 27, minFontSize: 14 },
  badgeId: { x: 404, centerY: 866, maxWidth: 291, maxFontSize: 23, minFontSize: 14 },
};
const FONT_NAME = '"Palatino Linotype", "Book Antiqua", Palatino, serif';
const FONT_ROLE = '"Playfair Display", Georgia, serif';
const CROP_PREVIEW = { width: 300, height: Math.round(300 * PHOTO_FRAME.height / PHOTO_FRAME.width) };

type CropPixels = { x: number; y: number; width: number; height: number };
type PhotoCrop = { x: number; y: number; zoom: number };

function renderCardText({
  ctx,
  text,
  x,
  centerY,
  maxWidth,
  maxFontSize,
  minFontSize = 12,
  fontWeight = 600,
  fontFamily = '"Barlow Condensed", "Arial Narrow", sans-serif',
}: {
  ctx: CanvasRenderingContext2D;
  text: string;
  x: number;
  centerY: number;
  maxWidth: number;
  maxFontSize: number;
  minFontSize?: number;
  fontWeight?: number;
  fontFamily?: string;
}) {
  let fontSize = maxFontSize;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  while (fontSize > minFontSize && ctx.measureText(text).width > maxWidth) {
    fontSize -= 1;
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  }
  // Canvas places alphabetic text on its baseline. Use its actual glyph bounds
  // so the configured visual center stays in the blank zone above each rule.
  const metrics = ctx.measureText(text);
  const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.72;
  const descent = metrics.actualBoundingBoxDescent || fontSize * 0.18;
  const baseline = centerY + (ascent - descent) / 2;
  ctx.fillText(text, x, baseline);
}

function makeBuilderId() {
  const key = "hh_goa_id_pool";
  let pool: number[] = [];
  try { pool = JSON.parse(sessionStorage.getItem(key) || "[]"); } catch { pool = []; }
  let n = 0;
  do { n = Math.floor(Math.random() * 9000) + 1000; } while (pool.includes(n));
  pool.push(n);
  try { sessionStorage.setItem(key, JSON.stringify(pool)); } catch { /* storage may be unavailable */ }
  return `#HH-GOA-${String(n).padStart(4, "0")}`;
}

export function IdCardGenerator() {
  const cropRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef({ active: false, x: 0, y: 0 });
  const [photoName, setPhotoName] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [builderId, setBuilderId] = useState("");
  const [generated, setGenerated] = useState(false);
  const [generatedCard, setGeneratedCard] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [photoCrop, setPhotoCrop] = useState<PhotoCrop>({ x: 0, y: 0, zoom: 1 });

  const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image could not be loaded."));
    image.src = src;
  });

  const calculateCropPixels = (image: HTMLImageElement, crop: PhotoCrop): CropPixels => {
    const aspect = PHOTO_FRAME.width / PHOTO_FRAME.height;
    const baseWidth = image.width / image.height > aspect ? image.height * aspect : image.width;
    const baseHeight = image.width / image.height > aspect ? image.height : image.width / aspect;
    const width = Math.min(image.width, baseWidth / Math.max(1, crop.zoom));
    const height = Math.min(image.height, baseHeight / Math.max(1, crop.zoom));
    const maxX = Math.max(0, (image.width - width) / 2);
    const maxY = Math.max(0, (image.height - height) / 2);
    return {
      x: image.width / 2 - maxX * Math.max(-1, Math.min(1, crop.x)) - width / 2,
      y: image.height / 2 - maxY * Math.max(-1, Math.min(1, crop.y)) - height / 2,
      width,
      height,
    };
  };

  const renderPhotoCrop = (
    ctx: CanvasRenderingContext2D,
    image: HTMLImageElement,
    cropPixels: CropPixels,
    frame: { x: number; y: number; width: number; height: number; radius: number },
  ) => {
    const scale = Math.max(frame.width / cropPixels.width, frame.height / cropPixels.height);
    const drawWidth = cropPixels.width * scale;
    const drawHeight = cropPixels.height * scale;
    ctx.save();
    ctx.beginPath(); ctx.roundRect(frame.x, frame.y, frame.width, frame.height, frame.radius); ctx.clip();
    ctx.drawImage(image, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height, frame.x + (frame.width - drawWidth) / 2, frame.y + (frame.height - drawHeight) / 2, drawWidth, drawHeight);
    ctx.restore();
  };

  const drawCrop = (cropState = photoCrop) => {
    const canvas = cropRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const crop = calculateCropPixels(image, cropState);
    ctx.clearRect(0, 0, CROP_PREVIEW.width, CROP_PREVIEW.height);
    ctx.fillStyle = "#002f22";
    ctx.fillRect(0, 0, CROP_PREVIEW.width, CROP_PREVIEW.height);
    renderPhotoCrop(ctx, image, crop, { x: 0, y: 0, width: CROP_PREVIEW.width, height: CROP_PREVIEW.height, radius: 0 });
  };

  const loadPhoto = (file: File) => {
    if (!/^image\/(png|jpeg|jpg|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Use a PNG, JPG, JPEG, or WEBP image under 10 MB."); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      loadImage(String(reader.result)).then((image) => {
        // The supplied two-card artwork is never a user photo.
        if (image.naturalWidth === 1536 && image.naturalHeight === 1024 || /id[ _-]?card/i.test(file.name)) {
          setError("Please upload your personal photo, not the ID card template.");
          return;
        }
        imageRef.current = image;
        setPhotoCrop({ x: 0, y: 0, zoom: 1 });
        setPhotoName(file.name); setError(""); drawCrop();
      }).catch(() => setError("That photo could not be loaded. Please choose a valid PNG, JPG, JPEG, or WEBP image."));
    };
    reader.onerror = () => setError("That photo could not be read. Please try another image.");
    try { reader.readAsDataURL(file); } catch { setError("That photo could not be read. Please try another image."); }
  };

  // The renderer is intentionally shared by upload, drag, and zoom updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { drawCrop(); }, [photoCrop]);

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const image = imageRef.current;
    if (!dragRef.current.active || !image) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    const crop = calculateCropPixels(image, photoCrop);
    const maxX = Math.max(0, (image.width - crop.width) / 2);
    const maxY = Math.max(0, (image.height - crop.height) / 2);
    const next = {
      x: maxX ? Math.max(-1, Math.min(1, photoCrop.x - dx * crop.width / CROP_PREVIEW.width / maxX)) : 0,
      y: maxY ? Math.max(-1, Math.min(1, photoCrop.y - dy * crop.height / CROP_PREVIEW.height / maxY)) : 0,
      zoom: photoCrop.zoom,
    };
    setPhotoCrop(next);
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
  };
  const onPointerUp = () => { dragRef.current.active = false; };

  const zoom = (value: number) => {
    const image = imageRef.current;
    if (!image) return;
    const current = calculateCropPixels(image, photoCrop);
    const nextZoom = Math.max(1, value);
    const nextSize = calculateCropPixels(image, { x: 0, y: 0, zoom: nextZoom });
    const nextMaxX = Math.max(0, (image.width - nextSize.width) / 2);
    const nextMaxY = Math.max(0, (image.height - nextSize.height) / 2);
    setPhotoCrop({
      x: nextMaxX ? Math.max(-1, Math.min(1, (image.width / 2 - (current.x + current.width / 2)) / nextMaxX)) : 0,
      y: nextMaxY ? Math.max(-1, Math.min(1, (image.height / 2 - (current.y + current.height / 2)) / nextMaxY)) : 0,
      zoom: nextZoom,
    });
  };

  const generate = async () => {
    if (!imageRef.current) { setError("Please upload your photo first."); return; }
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!role.trim()) { setError("Please enter your role."); return; }
    const croppedAreaPixels = calculateCropPixels(imageRef.current, photoCrop);
    let template: HTMLImageElement;
    try {
      template = await loadImage("/id-card/id-card-template.png");
    } catch {
      setError("ID card template could not be loaded. Please check public/id-card/id-card-template.png.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = CARD_W; canvas.height = CARD_H;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    // Preserve both cards exactly; dynamic content is added only to the front/left card.
    ctx.drawImage(template, 0, 0, CARD_W, CARD_H);
    renderPhotoCrop(ctx, imageRef.current, croppedAreaPixels, PHOTO_FRAME);
    const id = makeBuilderId();
    ctx.fillStyle = "#003d2a";
    if (document.fonts) {
      await document.fonts.ready;
      // Palatino is a system font — no remote load needed; Playfair Display must be loaded.
      await document.fonts.load(`700 ${TEXT_FIELDS.name.maxFontSize}px "Palatino Linotype"`);
      await document.fonts.load(`700 ${TEXT_FIELDS.role.maxFontSize}px "Playfair Display"`);
      await document.fonts.load(`600 ${TEXT_FIELDS.badgeId.maxFontSize}px "Barlow Condensed"`);
    }
    renderCardText({ ctx, text: name.trim(), ...TEXT_FIELDS.name, fontWeight: 700, fontFamily: FONT_NAME });
    renderCardText({ ctx, text: role.trim(), ...TEXT_FIELDS.role, fontWeight: 700, fontFamily: FONT_ROLE });
    renderCardText({ ctx, text: id, ...TEXT_FIELDS.badgeId });
    if (DEBUG_TEMPLATE) {
      ctx.save();
      ctx.strokeStyle = "#e91667";
      ctx.strokeRect(PHOTO_FRAME.x, PHOTO_FRAME.y, PHOTO_FRAME.width, PHOTO_FRAME.height);
      ctx.strokeRect(TEXT_FIELDS.name.x, TEXT_FIELDS.name.centerY - 20, TEXT_FIELDS.name.maxWidth, 40);
      ctx.strokeRect(TEXT_FIELDS.role.x, TEXT_FIELDS.role.centerY - 20, TEXT_FIELDS.role.maxWidth, 40);
      ctx.strokeRect(TEXT_FIELDS.badgeId.x, TEXT_FIELDS.badgeId.centerY - 20, TEXT_FIELDS.badgeId.maxWidth, 40);
      ctx.restore();
    }
    const dataUrl = canvas.toDataURL("image/png");
    setBuilderId(id); setGeneratedCard(dataUrl); setGenerated(true); setError("");
  };

  const reset = () => { imageRef.current = null; setPhotoCrop({ x: 0, y: 0, zoom: 1 }); setPhotoName(""); setName(""); setRole(""); setBuilderId(""); setGeneratedCard(null); setGenerated(false); setError(""); const ctx = cropRef.current?.getContext("2d"); ctx?.clearRect(0, 0, CROP_PREVIEW.width, CROP_PREVIEW.height); };
  const onFile = (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) loadPhoto(file); };

  const buildShareUrl = () => {
    const caption = [
      "🌴 Hacker Goa House: ID unlocked.",
      "",
      `👤 ${name.trim()}`,
      `🪪 Builder ID: ${builderId}`,
      "",
      "💻 Came to build. 🌊 Stayed for Goa.",
      "🚀 Code. Build. Ship. Repeat.",
      "",
      "Think you can build too? 👀",
      "Create your own Builder Card:",
      "",
      "",
      "#FrameInGoa #HHGoa2026",
    ].join("\n");
    return `https://x.com/intent/post?${new URLSearchParams({ text: caption }).toString()}`;
  };

  const shareToX = async () => {
    // Guard: card must be generated first.
    if (!generatedCard) {
      setError("Generate your Builder Card first.");
      return;
    }
    setSharing(true);
    setError("");
    try {
      // Auto-download the exact generated card (same data URL as Download ID Card).
      const link = document.createElement("a");
      link.download = `${name.replace(/[^a-z0-9]/gi, "-")}-${builderId.replace(/[^a-z0-9-]/gi, "-")}-Builder-Pass.png`;
      link.href = generatedCard;
      link.click();
      // Open X composer with the pre-filled caption in a new tab.
      window.open(buildShareUrl(), "_blank", "noopener,noreferrer");
    } catch {
      setError("Could not prepare your Builder Card. Please try again.");
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="create-page">
      <header className="create-page-header"><img className="create-studio-logo" src="/branding/247pm-studio.png" alt="2:47 PM Studio" /><Link href="/" className="create-back-button"><span>← Back to Hacker House Goa</span></Link></header>
      <div className="create-title-block"><h1>BUILDER <img className="create-goa-logo" src="/branding/goa-hindi.svg" alt="Goa" /> PASS</h1><p>Create your official Hacker House Goa 2026 Builder Pass.</p></div>
      <div className="generator-grid">
        <section className="generator-panel" aria-labelledby="details-title">
          <h2 id="details-title">Build your pass</h2>
          <label className="upload-label" htmlFor="photo-input">Upload photo <span>PNG, JPG, WEBP · max 10MB</span></label>
          <input id="photo-input" type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
          <canvas ref={cropRef} className={`crop-preview${photoName ? " has-photo" : ""}`} width={CROP_PREVIEW.width} height={CROP_PREVIEW.height} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} aria-label="Drag to reposition your photo" />
          {photoName && <p className="photo-status">{photoName} · drag to reposition</p>}
          <label className="upload-label" htmlFor="zoom">Zoom</label><input id="zoom" type="range" min="1" max="3" step=".01" value={photoCrop.zoom} onChange={(e) => zoom(Number(e.target.value))} />
          <label className="field-label" htmlFor="builder-name">Full name</label><input id="builder-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={40} placeholder="Your name" />
          <label className="field-label" htmlFor="builder-role">Role / designation</label><input id="builder-role" value={role} onChange={(e) => setRole(e.target.value)} maxLength={40} placeholder="What do you build?" />
          {error && <p className="generator-error" role="alert">{error}</p>}
          <button className="generator-primary" type="button" onClick={generate}>Generate ID card</button>
        </section>
        <section className="generator-result" aria-live="polite"><h2>{generated ? "Your Builder Pass" : "Your pass preview"}</h2>{generatedCard ? <><img src={generatedCard} className="card-preview" alt={`Generated Hacker House Goa Builder Pass ${builderId}`} /><div className="generator-actions"><button className="generator-primary" type="button" onClick={() => { const link = document.createElement("a"); link.download = `${name.replace(/[^a-z0-9]/gi, "-")}-${builderId.replace(/[^a-z0-9-]/gi, "-")}-Builder-Pass.png`; link.href = generatedCard; link.click(); }}>Download ID card</button><button className="generator-share" type="button" onClick={shareToX} disabled={sharing} aria-label="Share your Builder Pass on X">{sharing ? "Sharing…" : "Share to X"}</button><button className="generator-secondary" type="button" onClick={reset}>Generate another</button></div></> : <p>Upload your photo and details, then generate your personalized card.</p>}</section>
      </div>
    </main>
  );
}
