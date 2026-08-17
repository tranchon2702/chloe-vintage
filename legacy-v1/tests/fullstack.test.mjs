import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createPortfolioServer } from "../server.mjs";

test("serves the portfolio and full contact API flow", async (context) => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), ".chloe-test-"));
  const storageFile = join(temporaryDirectory, "contacts.ndjson");
  const server = createPortfolioServer({ storageFile });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  context.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const pageResponse = await fetch(`${baseUrl}/`);
  assert.equal(pageResponse.status, 200);
  const pageHtml = await pageResponse.text();
  assert.match(pageHtml, /CHLOE/);
  assert.match(pageHtml, /#FFFCE1/i);
  assert.match(pageHtml, /assets\/web-ngan\.jpg/);
  assert.match(pageHtml, /assets\/ngan-web-2\.jpg/);

  const portraitResponse = await fetch(`${baseUrl}/assets/ngan-web-2.jpg`);
  assert.equal(portraitResponse.status, 200);
  assert.match(portraitResponse.headers.get("content-type"), /image\/jpeg/);

  const healthResponse = await fetch(`${baseUrl}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.equal((await healthResponse.json()).service, "chloe-web-vintage");

  const profileResponse = await fetch(`${baseUrl}/api/profile`);
  assert.equal(profileResponse.status, 200);
  assert.equal(
    (await profileResponse.json()).profile.role,
    "Organic food sales · Relationship builder",
  );

  const invalidResponse = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: "C", email: "bad", message: "short" }),
  });
  assert.equal(invalidResponse.status, 422);

  const contactResponse = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test Visitor",
      email: "visitor@example.com",
      subject: "Organic food collaboration",
      message: "I would love to discuss a thoughtful organic food partnership with Chloe.",
    }),
  });
  assert.equal(contactResponse.status, 201);
  assert.equal((await contactResponse.json()).ok, true);

  const savedContact = await readFile(storageFile, "utf8");
  assert.match(savedContact, /visitor@example\.com/);
  assert.match(savedContact, /Organic food collaboration/);
});
