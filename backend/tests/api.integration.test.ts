import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createServer } from 'node:http';
import { join } from 'node:path';
import test from 'node:test';
import { createApp } from '../src/app.js';

test('versioned API validates and persists a contact submission', async (context) => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), '.chloe-test-'));
  const storageFile = join(temporaryDirectory, 'contacts.ndjson');
  const app = createApp({
    contactStorageFile: storageFile,
    serveFrontend: false,
    logRequests: false,
  });
  const server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  context.after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  const healthResponse = await fetch(`${baseUrl}/health`);
  assert.equal(healthResponse.status, 200);
  const health = (await healthResponse.json()) as {
    success: boolean;
    data: { service: string; version: string };
  };
  assert.equal(health.success, true);
  assert.equal(health.data.service, 'chloe-web-vintage-api');
  assert.equal(health.data.version, '2.0.0');
  assert.ok(healthResponse.headers.get('x-request-id'));

  const profileResponse = await fetch(`${baseUrl}/profile`);
  assert.equal(profileResponse.status, 200);
  const profile = (await profileResponse.json()) as {
    data: { role: string; palette: string[] };
  };
  assert.equal(profile.data.role, 'Sales · Advisor & relationship builder');
  assert.deepEqual(profile.data.palette, [
    '#F4EDDC',
    '#C9876B',
    '#B7CCD0',
    '#5B2B32',
    '#A47B46',
    '#241D1B',
  ]);

  const invalidResponse = await fetch(`${baseUrl}/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'C', email: 'invalid', message: 'short' }),
  });
  assert.equal(invalidResponse.status, 422);
  const invalidBody = (await invalidResponse.json()) as {
    success: boolean;
    details: Record<string, string[]>;
  };
  assert.equal(invalidBody.success, false);
  assert.ok(invalidBody.details.email);

  const contactResponse = await fetch(`${baseUrl}/contact`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Visitor',
      email: 'visitor@example.com',
      subject: 'Sales career opportunity',
      message: 'I would love to discuss a thoughtful sales opportunity with Chloe.',
      website: '',
    }),
  });
  assert.equal(contactResponse.status, 201);
  const contact = (await contactResponse.json()) as {
    success: boolean;
    data: { id: string };
  };
  assert.equal(contact.success, true);
  assert.match(contact.data.id, /^[0-9a-f-]{36}$/i);

  const savedContact = await readFile(storageFile, 'utf8');
  assert.match(savedContact, /visitor@example\.com/);
  assert.match(savedContact, /Sales career opportunity/);
});

test('admin session protects content edits and image uploads', async (context) => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), '.chloe-test-'));
  const contentStorageFile = join(temporaryDirectory, 'content.json');
  const contentMediaDirectory = join(temporaryDirectory, 'media');
  const adminPassword = 'a-private-test-password';
  const app = createApp({
    contentStorageFile,
    contentMediaDirectory,
    adminPassword,
    serveFrontend: false,
    logRequests: false,
  });
  const server = createServer(app);

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  context.after(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await rm(temporaryDirectory, { recursive: true, force: true });
  });

  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;

  const initialContentResponse = await fetch(`${baseUrl}/content`);
  assert.equal(initialContentResponse.status, 200);
  const initialContent = (await initialContentResponse.json()) as {
    data: { content: null; updatedAt: null };
  };
  assert.equal(initialContent.data.content, null);

  const sameOriginResponse = await fetch(`${baseUrl}/content`, {
    headers: { origin: `http://127.0.0.1:${address.port}` },
  });
  assert.equal(sameOriginResponse.status, 200);

  const disallowedOriginResponse = await fetch(`${baseUrl}/content`, {
    headers: { origin: 'https://untrusted.example' },
  });
  assert.equal(disallowedOriginResponse.status, 403);

  const unauthorizedResponse = await fetch(`${baseUrl}/admin/content`);
  assert.equal(unauthorizedResponse.status, 401);

  const wrongLoginResponse = await fetch(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: 'definitely-wrong' }),
  });
  assert.equal(wrongLoginResponse.status, 401);

  const loginResponse = await fetch(`${baseUrl}/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ password: adminPassword }),
  });
  assert.equal(loginResponse.status, 200);
  const login = (await loginResponse.json()) as {
    data: { token: string; expiresAt: string };
  };
  assert.ok(login.data.token.length > 30);
  assert.ok(Date.parse(login.data.expiresAt) > Date.now());
  const authorization = { authorization: `Bearer ${login.data.token}` };

  const managedContent = {
    email: 'chloe@example.com',
    translations: {
      vi: {
        'meta.title': 'Chloe — tiếng Việt',
        'hero.title': 'Một tiêu đề',
      },
      en: {
        'meta.title': 'Chloe — English',
        'hero.title': 'A title',
      },
    },
    images: {
      hero: '/assets/hero.jpg',
      journey: '/assets/journey.jpg',
      archivePlant: '/assets/plant.jpg',
      archiveReading: '/assets/reading.jpg',
      archiveTravel: '/assets/travel.jpg',
      archiveCover: '/assets/cover.jpg',
      archiveDenimOne: '/assets/denim-one.jpg',
      archiveDenimTwo: '/assets/denim-two.jpg',
      social: '/assets/social.png',
    },
    sections: {
      manifesto: true,
      approach: true,
      organic: true,
      cases: true,
      journey: true,
      archive: true,
      about: true,
      notes: true,
      contact: true,
    },
    caseStudies: [
      {
        id: 'discovery',
        vi: {
          eyebrow: 'Tình huống 01',
          title: 'Khám phá nhu cầu',
          challenge: 'Khách hàng chưa xác định rõ nhu cầu.',
          approach: 'Lắng nghe và làm rõ bối cảnh trước khi đề xuất.',
          outcome: 'Một lựa chọn rõ ràng và phù hợp hơn.',
        },
        en: {
          eyebrow: 'Scenario 01',
          title: 'Discover the need',
          challenge: 'The customer has not clearly defined the need.',
          approach: 'Listen and clarify the context before suggesting a direction.',
          outcome: 'A clearer and more suitable choice.',
        },
      },
    ],
  };

  const saveResponse = await fetch(`${baseUrl}/admin/content`, {
    method: 'PUT',
    headers: { ...authorization, 'content-type': 'application/json' },
    body: JSON.stringify(managedContent),
  });
  assert.equal(saveResponse.status, 200);

  const publicContentResponse = await fetch(`${baseUrl}/content`);
  const publicContent = (await publicContentResponse.json()) as {
    data: { content: typeof managedContent; updatedAt: string };
  };
  assert.equal(publicContent.data.content.email, 'chloe@example.com');
  assert.equal(publicContent.data.content.translations.vi['hero.title'], 'Một tiêu đề');
  assert.ok(Date.parse(publicContent.data.updatedAt) > 0);

  const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0]);
  const uploadResponse = await fetch(`${baseUrl}/admin/media/hero`, {
    method: 'PUT',
    headers: { ...authorization, 'content-type': 'image/png' },
    body: pngSignature,
  });
  assert.equal(uploadResponse.status, 200);
  const upload = (await uploadResponse.json()) as { data: { path: string } };
  assert.match(upload.data.path, /^\/api\/v1\/content\/media\/hero-\d+\.png$/);

  const imageResponse = await fetch(
    `http://127.0.0.1:${address.port}${upload.data.path}`,
  );
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get('cache-control'), 'public, max-age=31536000, immutable');
  assert.deepEqual(new Uint8Array(await imageResponse.arrayBuffer()), pngSignature);

  const savedContent = await readFile(contentStorageFile, 'utf8');
  assert.match(savedContent, /chloe@example\.com/);
});
