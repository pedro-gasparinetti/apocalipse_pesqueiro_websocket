import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Import server-side modules dynamically
    const { getRecentGames } = require('@/server/game-repository');
    
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    const games = await getRecentGames(limit);
    
    return NextResponse.json({
      success: true,
      data: games
    });
    
  } catch (error: any) {
    console.error('[API] Error fetching games:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch games',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
