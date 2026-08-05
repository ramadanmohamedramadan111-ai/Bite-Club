import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const contentType = req.headers.get('content-type') || '';
    
    let socketId = '';
    let channelName = '';

    if (contentType.includes('application/json')) {
      try {
        const body = JSON.parse(bodyText);
        socketId = body.socket_id;
        channelName = body.channel_name;
      } catch (e) {}
    } else {
      const params = new URLSearchParams(bodyText);
      socketId = params.get('socket_id') || '';
      channelName = params.get('channel_name') || '';
    }

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    let user = null;

    if (token) {
      try {
        const jwtSecret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, jwtSecret);
        
        // Fetch user details from Laravel API using JWT token to get full name
        const backendUrl = process.env.API_BASE_URL || 'http://api:8000/api';
        const meResponse = await fetch(`${backendUrl}/user/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (meResponse.ok) {
          const meData = await meResponse.json();
          user = meData.data;
        }
      } catch (e) {
        console.error('Error verifying token in broadcasting proxy:', e);
      }
    }

    let userIdStr = '';
    let nameStr = '';
    let isGuest = false;

    if (user) {
      userIdStr = String(user.id);
      nameStr = `${user.first_name} ${user.last_name}`;
    } else {
      // Guest path!
      const guestId = req.headers.get('X-Guest-ID') || '';
      const guestName = req.headers.get('X-Guest-Name') || '';

      if (!guestId) {
        return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
      }

      userIdStr = guestId;
      nameStr = guestName || 'Guest';
      isGuest = true;
    }

    // Reverb credentials from backend project config
    const reverbKey = process.env.NEXT_PUBLIC_REVERB_APP_KEY || '7shjlvmsslgdjgltf46x';
    const reverbSecret = 'j2mthdcxfa5lymyt8zho';

    let responseData: any = {};

    if (channelName.startsWith('presence-')) {
      const channelData = JSON.stringify({
        user_id: userIdStr,
        user_info: {
          id: isGuest ? userIdStr : Number(userIdStr),
          name: nameStr,
          is_guest: isGuest,
        }
      });

      const stringToSign = `${socketId}:${channelName}:${channelData}`;
      const hash = crypto
        .createHmac('sha256', reverbSecret)
        .update(stringToSign)
        .digest('hex');

      responseData = {
        auth: `${reverbKey}:${hash}`,
        channel_data: channelData,
      };
    } else {
      if (isGuest) {
        return NextResponse.json({ error: 'Guests cannot join private channels' }, { status: 403 });
      }

      const stringToSign = `${socketId}:${channelName}`;
      const hash = crypto
        .createHmac('sha256', reverbSecret)
        .update(stringToSign)
        .digest('hex');

      responseData = {
        auth: `${reverbKey}:${hash}`,
      };
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('[Broadcasting Proxy] Auth error:', error);
    return NextResponse.json({ error: error?.message || 'Unauthorized' }, { status: 500 });
  }
}
