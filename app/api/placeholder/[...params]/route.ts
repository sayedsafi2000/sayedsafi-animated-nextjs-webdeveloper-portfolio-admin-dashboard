/**
 * Placeholder Image API Route
 * Generates placeholder images on the fly
 * Usage: /api/placeholder/600/400 or /api/placeholder/600/400/FF0000/FFFFFF
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ params: string[] }> | { params: string[] } }
) {
  try {
    // Handle both Promise and direct params (Next.js 14+ compatibility)
    const resolvedParams = context.params instanceof Promise 
      ? await context.params 
      : context.params;
    
    // Get params from the route
    const paramArray = resolvedParams?.params || [];
    
    // If params is empty, try parsing from URL
    let paramList = paramArray;
    if (paramList.length === 0) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/').filter(Boolean);
      const placeholderIndex = pathParts.indexOf('placeholder');
      if (placeholderIndex !== -1 && placeholderIndex < pathParts.length - 1) {
        paramList = pathParts.slice(placeholderIndex + 1);
      }
    }
    
    // Parse dimensions and colors from URL
    // Format: /api/placeholder/width/height or /api/placeholder/width/height/bgColor/textColor
    const [width = '600', height = '400', bgColor = 'E5E7EB', textColor = '9CA3AF'] = paramList;

    // Validate and parse dimensions
    const w = Math.max(1, Math.min(10000, parseInt(width, 10) || 600));
    const h = Math.max(1, Math.min(10000, parseInt(height, 10) || 400));
    
    // Clean color codes (remove # if present)
    const bg = `#${bgColor.replace(/^#/, '')}`;
    const text = `#${textColor.replace(/^#/, '')}`;

    // Generate SVG placeholder
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${bg}"/>
  <text 
    x="50%" 
    y="50%" 
    font-family="Arial, sans-serif" 
    font-size="${Math.min(24, Math.max(12, Math.floor(w / 25)))}" 
    fill="${text}" 
    text-anchor="middle" 
    dominant-baseline="middle"
  >
    ${w} × ${h}
  </text>
</svg>`;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    // Return a simple error SVG
    const errorSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#E5E7EB"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#9CA3AF" text-anchor="middle" dominant-baseline="middle">Error</text>
</svg>`;
    return new NextResponse(errorSvg, {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml',
      },
    });
  }
}

