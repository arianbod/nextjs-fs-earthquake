import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const payload = await req.json();
    const finalResponse = {
      analysis: formatAnalysisResult(payload, 'demo')
    };
    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('=== IMAGE ANALYSIS ERROR ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ error: 'Image analysis failed' }, { status: 500 });
  }
}

function formatAnalysisResult(raw, type) {
  return { type, raw };
}
