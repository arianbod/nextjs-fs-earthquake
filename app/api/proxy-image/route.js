import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Proxy route to handle CORS issues with Google Maps images
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate that it's a Google Maps URL
    const allowedDomains = [
      'maps.googleapis.com',
      'maps.google.com',
      'streetviewpixels-pa.googleapis.com'
    ];

    const urlObj = new URL(imageUrl);
    if (!allowedDomains.some(domain => urlObj.hostname.includes(domain))) {
      return NextResponse.json(
        { error: 'URL not allowed' },
        { status: 403 }
      );
    }

    console.log('Proxying image request:', imageUrl);

    // Fetch the image
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'QuakeWise/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { 
        error: 'Failed to proxy image',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}