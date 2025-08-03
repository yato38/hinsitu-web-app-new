import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // データベース接続テスト
    await prisma.$connect();
    
    // 簡単なクエリを実行
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'データベース接続成功',
      userCount,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定'
    });
  } catch (error) {
    console.error('データベース接続エラー:', error);
    
    return NextResponse.json({
      success: false,
      message: 'データベース接続失敗',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? '設定済み' : '未設定'
    }, { status: 500 });
  }
} 