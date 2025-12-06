import { NextResponse, NextRequest } from 'next/server';

const JULES_API_BASE = 'https://jules.googleapis.com/v1alpha';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-jules-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get('path') || '';
    const url = `${JULES_API_BASE}${path}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
    });

    const data = await response.json().catch(() => ({}));

    // Temporarily log activities for debugging
    if (path.includes('/activities') && data.activities && data.activities.length > 0) {
      // Log activity types
      const activityTypes = data.activities.map((a: any) => {
        const type = Object.keys(a).find(k => k !== 'name' && k !== 'createTime' && k !== 'originator' && k !== 'id');
        return type;
      });
      console.log('[Jules API Proxy] Activity types:', activityTypes);

      // Look for sessionCompleted activities
      const completedActivity = data.activities.find((a: any) => a.sessionCompleted);
      if (completedActivity) {
        console.log('[Jules API Proxy] Found sessionCompleted activity:', JSON.stringify(completedActivity, null, 2));
      }

      // Log first activity for reference
      console.log('[Jules API Proxy] First activity:', JSON.stringify(data.activities[0], null, 2));
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Jules API Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-jules-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get('path') || '';
    const url = `${JULES_API_BASE}${path}`;
    const body = await request.text();

    console.log('[Jules API Proxy] POST request:', {
      url,
      path,
      body: JSON.parse(body || '{}'),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
      body: body || undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error('[Jules API Proxy] POST error:', {
        status: response.status,
        data,
      });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-jules-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const path = request.nextUrl.searchParams.get('path') || '';
    const url = `${JULES_API_BASE}${path}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Proxy error', message: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
