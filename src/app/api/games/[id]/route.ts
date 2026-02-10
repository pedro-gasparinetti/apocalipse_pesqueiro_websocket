import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { exportGameData, getGameResults } = require('@/server/game-repository');
    
    const gameId = parseInt(params.id, 10);
    
    if (isNaN(gameId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid game ID' },
        { status: 400 }
      );
    }
    
    // Buscar dados completos do jogo
    const gameData = await exportGameData(gameId);
    const results = await getGameResults(gameId);
    
    return NextResponse.json({
      success: true,
      data: {
        ...gameData,
        results
      }
    });
    
  } catch (error: any) {
    console.error('[API] Error fetching game details:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch game details',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
