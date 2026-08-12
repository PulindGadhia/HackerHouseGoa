"use client";

import { useEffect, useRef } from "react";

export function GoaEnvironment() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotionPreference = () => {
      if (motionQuery.matches) {
        video.pause();
      } else {
        void video.play().catch(() => {});
      }
    };

    syncMotionPreference();
    motionQuery.addEventListener("change", syncMotionPreference);
    return () => motionQuery.removeEventListener("change", syncMotionPreference);
  }, []);

  return (
    <video
      ref={videoRef}
      className="hero-art"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster="/artwork/goa-coast-hero.jpg"
      aria-hidden="true"
    >
      <source src="/videos/hacker-house-goa.mp4" type="video/mp4" />
    </video>
  );
}
