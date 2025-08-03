import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // データベースURLが設定されていない場合は空の配列を返す
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ users: [] });
  }
  
  const prisma = new PrismaClient();
  try {
    // セッション確認
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: '管理者権限が必要です。' },
        { status: 403 }
      );
    }

    // ユーザー一覧を取得
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userId: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'ユーザー取得中にエラーが発生しました。' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 