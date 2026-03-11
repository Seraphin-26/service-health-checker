import { NextRequest, NextResponse } from 'next/server';

export interface CheckResponse {
  url: string;
  online: boolean;
  statusCode?: number;
  message?: string;
}

function isValidUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  // Validate presence
  if (!url || url.trim() === '') {
    return NextResponse.json(
      { error: 'Le paramètre "url" est requis.' },
      { status: 400 }
    );
  }

  // Validate format
  if (!isValidUrl(url)) {
    return NextResponse.json(
      { error: 'URL invalide. Elle doit commencer par http:// ou https://' },
      { status: 400 }
    );
  }

  // Perform the check
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'ServiceHealthChecker/1.0',
      },
    });

    clearTimeout(timeout);

    const body: CheckResponse = {
      url,
      online: response.status >= 200 && response.status < 400,
      statusCode: response.status,
      message: response.ok ? 'Le service répond correctement.' : `Le service a répondu avec le statut ${response.status}.`,
    };

    return NextResponse.json(body, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return NextResponse.json(
        { url, online: false, message: 'La requête a expiré après 10 secondes.' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { url, online: false, message: 'Impossible de joindre le service.' },
      { status: 200 }
    );
  }
}
