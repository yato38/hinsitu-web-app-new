import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Prisma接続テスト
    await prisma.$connect();
    
    // Supabase接続テスト
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      // Supabaseのヘルスチェック
      const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
      
      if (error) {
        console.warn('Supabase connection warning:', error);
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'データベース接続が正常です',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'データベース接続に失敗しました',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 