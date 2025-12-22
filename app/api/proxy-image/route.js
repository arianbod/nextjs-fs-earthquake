import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// Allowed domains for image proxying (exact match or subdomain)
const ALLOWED_DOMAINS = [
  'maps.googleapis.com',
  'maps.google.com',
  'streetviewpixels-pa.googleapis.com',
  'khms0.googleapis.com',
  'khms1.googleapis.com',
  'khms2.googleapis.com',
  'khms3.googleapis.com',
];

// Validate hostname against allowed domains (exact match or subdomain)
function isAllowedDomain(hostname) {
  const normalizedHostname = hostname.toLowerCase();
  return ALLOWED_DOMAINS.some(domain => {
    // Exact match
    if (normalizedHostname === domain) return true;
    // Subdomain match (e.g., foo.maps.googleapis.com)
    if (normalizedHostname.endsWith('.' + domain)) return true;
    return false;
  });
}

// Check if URL points to internal/private network
function isInternalUrl(hostname) {
  const internalPatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\.0\.0\.0$/,
    /^\[::1\]$/,
    /^\[fc00:/i,
    /^\[fd00:/i,
    /^\[fe80:/i,
    /^.*\.local$/i,
    /^.*\.internal$/i,
  ];
  return internalPatterns.some(pattern => pattern.test(hostname));
}

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

    // Parse and validate URL
    let urlObj;
    try {
      urlObj = new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Only allow HTTPS protocol
    if (urlObj.protocol !== 'https:') {
      return NextResponse.json(
        { error: 'Only HTTPS URLs are allowed' },
        { status: 403 }
      );
    }

    // Block internal/private network addresses
    if (isInternalUrl(urlObj.hostname)) {
      return NextResponse.json(
        { error: 'Internal URLs are not allowed' },
        { status: 403 }
      );
    }

    // Validate against allowed domains (strict matching)
    if (!isAllowedDomain(urlObj.hostname)) {
      return NextResponse.json(
        { error: 'Domain not allowed' },
        { status: 403 }
      );
    }

    // Reconstruct URL from validated components to ensure safety
    // This creates a clean URL from parsed, validated parts
    const sanitizedUrl = new URL(urlObj.pathname + urlObj.search, `https://${urlObj.hostname}`);

    // Fetch the image with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // SSRF mitigated: URL is validated against allowlist, internal IPs blocked,
    // HTTPS-only, no redirects, and URL reconstructed from validated components
    // snyk-ignore:SNYK-CODE-0000003 - False positive: comprehensive SSRF mitigations in place
    const response = await fetch(sanitizedUrl.toString(), {
      headers: {
        'User-Agent': 'QuakeWise/1.0',
      },
      signal: controller.signal,
      redirect: 'error', // Don't follow redirects to prevent redirect-based SSRF
    });

    clearTimeout(timeoutId);

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
    // Log error server-side but don't expose details to client
    console.error('Error proxying image:', error.name);

    // Handle specific error types
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to proxy image' },
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