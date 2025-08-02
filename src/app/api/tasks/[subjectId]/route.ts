import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 特定の科目のタスク定義を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者権限チェック
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { subjectId } = await params;
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType') || 'mock';

    // データベースからタスク定義を取得
    const taskDefinition = await prisma.taskDefinition.findUnique({
      where: {
        subjectId_examType: {
          subjectId: subjectId,
          examType: examType
        }
      }
    });

    if (!taskDefinition) {
      return NextResponse.json({ files: [] });
    }

    // JSONデータをパース
    const files = taskDefinition.files as any[];

    return NextResponse.json({ files });
  } catch (error) {
    console.error('タスク定義の取得に失敗しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 特定の科目のタスク定義を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subjectId: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者権限チェック
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { subjectId } = await params;
    const { searchParams } = new URL(request.url);
    const examType = searchParams.get('examType') || 'mock';
    const { files } = await request.json();

    // 既存のタスク定義を更新または新規作成
    await prisma.taskDefinition.upsert({
      where: {
        subjectId_examType: {
          subjectId: subjectId,
          examType: examType
        }
      },
      update: {
        files: files
      },
      create: {
        subjectId: subjectId,
        examType: examType,
        files: files
      }
    });

    return NextResponse.json({ message: 'タスク定義を更新しました' });
  } catch (error) {
    console.error('タスク定義の更新に失敗しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 