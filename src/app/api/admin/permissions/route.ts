import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: '管理者権限が必要です。' },
        { status: 403 }
      );
    }

    // アクセス権限一覧を取得（ユーザー情報も含める）
    const permissions = await prisma.accessPermission.findMany({
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: [
        { userId: 'asc' },
        { subjectId: 'asc' },
      ],
    });

    return NextResponse.json({ permissions });

  } catch (error) {
    console.error('Permissions fetch error:', error);
    return NextResponse.json(
      { error: '権限取得中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 