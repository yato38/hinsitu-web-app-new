import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

// ユーザーの役割を取得
export async function GET(request: NextRequest) {
  // データベースURLが設定されていない場合は空の配列を返す
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ userRoles: [] });
  }
  
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ユーザーIDが必要です' }, { status: 400 });
    }

    const userRoles = await prisma.userRole.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            name: true,
            role: true
          }
        }
      }
    });

    return NextResponse.json({ userRoles });
  } catch (error) {
    console.error('ユーザー役割取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ユーザーの役割を更新
export async function PUT(request: NextRequest) {
  // データベースURLが設定されていない場合はエラーを返す
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'データベースが設定されていません' }, { status: 500 });
  }
  
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, roles } = body;

    if (!userId || !Array.isArray(roles)) {
      return NextResponse.json({ error: 'ユーザーIDと役割の配列が必要です' }, { status: 400 });
    }

    // トランザクションで役割を更新
    const result = await prisma.$transaction(async (tx) => {
      // 既存の役割を削除
      await tx.userRole.deleteMany({
        where: { userId }
      });

      // 新しい役割を追加
      const userRoles = await Promise.all(
        roles.map(role => 
          tx.userRole.create({
            data: {
              userId,
              role
            }
          })
        )
      );

      return userRoles;
    });

    return NextResponse.json({ 
      message: '役割が正常に更新されました',
      userRoles: result 
    });
  } catch (error) {
    console.error('ユーザー役割更新エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ユーザーの役割を削除
export async function DELETE(request: NextRequest) {
  // データベースURLが設定されていない場合はエラーを返す
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'データベースが設定されていません' }, { status: 500 });
  }
  
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role');

    if (!userId || !role) {
      return NextResponse.json({ error: 'ユーザーIDと役割が必要です' }, { status: 400 });
    }

    await prisma.userRole.deleteMany({
      where: {
        userId,
        role
      }
    });

    return NextResponse.json({ message: '役割が正常に削除されました' });
  } catch (error) {
    console.error('ユーザー役割削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 