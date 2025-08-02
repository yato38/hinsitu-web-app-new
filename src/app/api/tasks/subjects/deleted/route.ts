import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 削除済み科目一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者権限チェック
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    // 削除済み科目のみを取得
    const deletedSubjects = await prisma.subject.findMany({
      where: {
        isDeleted: true
      },
      orderBy: {
        deletedAt: 'desc'
      }
    });

    // レスポンス形式に変換
    const subjectsResponse = deletedSubjects.map(subject => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      examType: subject.examType || 'mock',
      deletedAt: subject.deletedAt
    }));

    return NextResponse.json(subjectsResponse);
  } catch (error) {
    console.error('削除済み科目一覧の取得に失敗しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 