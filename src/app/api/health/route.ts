import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Basic health check
    const health: {
      status: string;
      timestamp: string;
      uptime: number;
      environment: string | undefined;
      database?: string;
    } = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    };

    // Optional: Check database connection
    try {
      const { testConnection } = require('@/server/database');
      const dbHealthy = await testConnection();
      health.database = dbHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      health.database = 'unavailable';
    }

    return NextResponse.json(health);
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'error',
        message: error.message 
      },
      { status: 500 }
    );
  }
}
