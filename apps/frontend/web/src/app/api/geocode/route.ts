import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=jsonv2&limit=5`,
    {
      headers: {
        'User-Agent': 'BiteClub/1.0',
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Nominatim search failed' },
      { status: response.status },
    );
  }

  const data = await response.json();

  const results = data.map(
    (item: {
      lat: string;
      lon: string;
      display_name: string;
      type: string;
    }) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      address: item.display_name,
      type: item.type,
    }),
  );

  return NextResponse.json(results);
}
