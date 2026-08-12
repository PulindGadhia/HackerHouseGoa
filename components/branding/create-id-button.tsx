"use client";

export function CreateIdButton() {
  return (
    <button
      className="apply-button"
      type="button"
      aria-label="Create your Hacker House ID"
      onClick={() => { window.location.href = "/create"; }}
    >
      <span>CREATE..</span>
    </button>
  );
}
