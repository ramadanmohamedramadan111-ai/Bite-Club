import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) {
    return NextResponse.json({ error: 'Missing coordinates' }, { status: 400 });
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=jsonv2`,
    {
      headers: {
        'User-Agent': 'BiteClub/1.0',
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: 'Nominatim failed' },
      { status: response.status },
    );
  }

  const data = await response.json();

  return NextResponse.json(data);
}
