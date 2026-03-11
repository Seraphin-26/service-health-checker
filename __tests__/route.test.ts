/**
 * Tests unitaires pour /api/check (route.ts)
 * Lancez avec : npx vitest run
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '../src/app/api/check/route';
import { NextRequest } from 'next/server';

// ─── Helper ───────────────────────────────────────────────────────────────────

function makeRequest(url: string): NextRequest {
  const fullUrl = `http://localhost:3000/api/check?url=${encodeURIComponent(url)}`;
  return new NextRequest(fullUrl);
}

function makeEmptyRequest(): NextRequest {
  return new NextRequest('http://localhost:3000/api/check');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/check', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('retourne 400 si le paramètre url est absent', async () => {
    const req = makeEmptyRequest();
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/requis/i);
  });

  it('retourne 400 pour une URL sans protocole (ex: "google.com")', async () => {
    const req = makeRequest('google.com');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalide/i);
  });

  it('retourne 400 pour une URL avec protocole invalide (ftp://)', async () => {
    const req = makeRequest('ftp://example.com');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalide/i);
  });

  it('retourne 400 pour une chaîne complètement invalide', async () => {
    const req = makeRequest('pas-une-url-!!@@##');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toMatch(/invalide/i);
  });

  // ── Cas "en ligne" ──────────────────────────────────────────────────────────

  it('renvoie online=true pour une réponse HTTP 200', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );

    const req = makeRequest('https://example.com');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.online).toBe(true);
    expect(body.statusCode).toBe(200);
  });

  it('renvoie online=true pour une réponse HTTP 301 (redirect)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 301 })
    );

    const req = makeRequest('https://example.com');
    const res = await GET(req);
    const body = await res.json();

    expect(body.online).toBe(true);
    expect(body.statusCode).toBe(301);
  });

  // ── Cas "hors ligne" ────────────────────────────────────────────────────────

  it('renvoie online=false pour une réponse HTTP 503', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 503 })
    );

    const req = makeRequest('https://example.com');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.online).toBe(false);
    expect(body.statusCode).toBe(503);
  });

  it('renvoie online=false pour une réponse HTTP 500', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 500 })
    );

    const req = makeRequest('https://broken-service.com');
    const res = await GET(req);
    const body = await res.json();

    expect(body.online).toBe(false);
  });

  // ── Cas réseau ──────────────────────────────────────────────────────────────

  it('renvoie online=false si le fetch échoue (réseau injoignable)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const req = makeRequest('https://service-inexistant.xyz');
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.online).toBe(false);
    expect(body.message).toMatch(/joindre/i);
  });

  it('renvoie online=false et message timeout si la requête expire', async () => {
    const abortError = new Error('AbortError');
    abortError.name = 'AbortError';
    vi.mocked(fetch).mockRejectedValueOnce(abortError);

    const req = makeRequest('https://slow-service.com');
    const res = await GET(req);
    const body = await res.json();

    expect(body.online).toBe(false);
    expect(body.message).toMatch(/expir/i);
  });

  // ── Contenu de la réponse ───────────────────────────────────────────────────

  it('inclut toujours le champ "url" dans la réponse', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 200 })
    );

    const targetUrl = 'https://example.com';
    const req = makeRequest(targetUrl);
    const res = await GET(req);
    const body = await res.json();

    expect(body.url).toBe(targetUrl);
  });
});
