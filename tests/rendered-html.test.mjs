import assert from "node:assert/strict";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Hacker House Goa hero", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Hacker House Goa 2026<\/title>/i);
  assert.match(html, /Hacker/);
  assert.match(html, /House/);
  assert.match(html, /गोवा/);
  assert.match(html, /28–31 Oct 2026/);
  assert.match(html, /Goa, India/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Starter Project/);
});

test("ships the original hero artwork", async () => {
  const { access } = await import("node:fs/promises");
  await access(new URL("public/artwork/goa-coast-hero.jpg", templateRoot));
});
