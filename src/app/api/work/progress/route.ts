import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 作業進捗を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const examType = searchParams.get('examType');

    if (!subjectId || !examType) {
      return NextResponse.json({ error: '科目IDと試験種が必要です' }, { status: 400 });
    }

    // 作業進捗を取得
    const progress = await prisma.workProgress.findMany({
      where: {
        userId: session.user.userId,
        subjectId: subjectId,
        examType: examType as 'mock' | 'past'
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('作業進捗の取得に失敗しました:', error);
    return NextResponse.json({ error: '作業進捗の取得に失敗しました' }, { status: 500 });
  }
}

// 作業進捗を保存
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.userId) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId, fileType, questionNumber, referenceData, aiOutput, subjectId, examType } = body;

    if (!taskId || !fileType || !questionNumber || !subjectId || !examType) {
      return NextResponse.json({ error: '必要なデータが不足しています' }, { status: 400 });
    }

    // 作業進捗を保存または更新
    const progress = await prisma.workProgress.upsert({
      where: {
        userId_taskId_fileType: {
          userId: session.user.userId,
          taskId: taskId,
          fileType: fileType as 'problem' | 'answer' | 'explanation' | 'scoring'
        }
      },
      update: {
        questionNumber,
        referenceData,
        aiOutput,
        completedAt: new Date()
      },
      create: {
        userId: session.user.userId,
        taskId: taskId,
        fileType: fileType as 'problem' | 'answer' | 'explanation' | 'scoring',
        questionNumber,
        referenceData,
        aiOutput,
        subjectId,
        examType: examType as 'mock' | 'past',
        completedAt: new Date()
      }
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('作業進捗の保存に失敗しました:', error);
    return NextResponse.json({ error: '作業進捗の保存に失敗しました' }, { status: 500 });
  }
} 