import assert from "node:assert/strict";
import test from "node:test";
import { readFile, access } from "node:fs/promises";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const htmlPath = new URL("../dist/client/index.html", import.meta.url);
  const html = await readFile(htmlPath, "utf-8");
  return {
    status: 200,
    headers: new Map([["content-type", "text/html"]]),
    text: async () => html
  };
}

test("renders the Hacker House Goa hero statically", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Hacker House Goa 2026<\/title>/i);
  assert.match(html, /Hacker/);
  assert.match(html, /House/);
  assert.match(html, /\/branding\/goa-hindi\.svg/);
  assert.match(html, /\/videos\/hacker-house-goa\.mp4/);
  assert.match(html, /28–31 Oct 2026/);
  assert.match(html, /Goa, India/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("ships the original hero artwork", async () => {
  await access(new URL("public/artwork/goa-coast-hero.jpg", templateRoot));
});
