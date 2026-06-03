import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: AbortSignal.timeout(5000), // 5 seconds timeout
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch url' }, { status: res.status });
    }

    const html = await res.text();

    const ogImageMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:image|twitter:image)["']\s+content=["']([^"']+)["']/i);
    const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:title|twitter:title)["']\s+content=["']([^"']+)["']/i) || html.match(/<title>([^<]+)<\/title>/i);
    const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description)["']\s+content=["']([^"']+)["']/i);

    return NextResponse.json({
      image: ogImageMatch ? ogImageMatch[1] : null,
      title: ogTitleMatch ? ogTitleMatch[1] : null,
      description: ogDescMatch ? ogDescMatch[1] : null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 });
  }
}
