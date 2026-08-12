"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function CheckHypeModal() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    videoRef.current?.pause();
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  }, [closing]);

  useEffect(() => {
    if (!open) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    void videoRef.current?.play().catch(() => {});
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, requestClose]);

  const openModal = () => {
    setClosing(false);
    setOpen(true);
  };

  return (
    <>
      <button
        className="hype-link"
        type="button"
        aria-label="Check the Hacker House Goa hype"
        onClick={openModal}
      >
        Check hype
      </button>

      {open && (
        <div
          className={`hype-modal-backdrop${closing ? " is-closing" : ""}`}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) requestClose();
          }}
        >
          <section className="hype-modal" role="dialog" aria-modal="true" aria-labelledby="hype-modal-title">
            <button className="hype-modal-close" type="button" aria-label="Close video" onClick={requestClose}>
              ×
            </button>
            <p id="hype-modal-title" className="hype-modal-kicker">Check the hype</p>
            <video ref={videoRef} controls playsInline preload="metadata" src="/video/check-hype.mp4">
              <track kind="captions" src="/video/check-hype.vtt" srcLang="en" label="English" />
            </video>
          </section>
        </div>
      )}
    </>
  );
}
