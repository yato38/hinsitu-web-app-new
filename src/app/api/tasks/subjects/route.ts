import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 科目一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 科目一覧取得は全ユーザーに許可（権限チェックなし）

    // 削除されていない科目のみを取得
    const subjects = await prisma.subject.findMany({
      where: {
        isDeleted: false
      },
      orderBy: {
        subjectName: 'asc'
      }
    });

    // レスポンス形式に変換
    const subjectsResponse = subjects.map(subject => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      examType: subject.examType || 'mock' // デフォルトは模試
    }));

    return NextResponse.json(subjectsResponse);
  } catch (error) {
    console.error('科目一覧の取得に失敗しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 新しい科目を追加
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 科目追加は開発者・管理者権限が必要
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '科目追加には開発者権限が必要です' }, { status: 403 });
    }

    const body = await request.json();
    const { subjectName, examType = 'mock' } = body;

    if (!subjectName || typeof subjectName !== 'string') {
      return NextResponse.json({ error: '科目名は必須です' }, { status: 400 });
    }

    // 科目名の重複チェック（削除済みも含む）
    const existingSubject = await prisma.subject.findFirst({
      where: {
        subjectName: subjectName.trim()
      }
    });

    if (existingSubject) {
      return NextResponse.json({ error: 'この科目名は既に存在します' }, { status: 409 });
    }

    // subjectIdを生成（科目名をベースにした英数字のID）
    const generateSubjectId = (name: string): string => {
      const japaneseToEnglish: { [key: string]: string } = {
        '英語': 'english',
        '国語': 'japanese',
        '数学': 'math',
        '物理': 'physics',
        '化学': 'chemistry',
        '生物': 'biology',
        '地学': 'earth_science',
        '世界史': 'world_history',
        '日本史': 'japanese_history',
        '地理': 'geography',
        '政治経済': 'politics_economics',
        '倫理': 'ethics',
        '現代社会': 'modern_society'
      };
      
      return japaneseToEnglish[name] || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    };

    const subjectId = generateSubjectId(subjectName.trim());

    // subjectIdの重複チェック（削除済みも含む）
    const existingSubjectId = await prisma.subject.findFirst({
      where: {
        subjectId: subjectId
      }
    });

    if (existingSubjectId) {
      return NextResponse.json({ error: 'この科目IDは既に存在します' }, { status: 409 });
    }

    // 新しい科目を作成
    const newSubject = await prisma.subject.create({
      data: {
        subjectId: subjectId,
        subjectName: subjectName.trim(),
        examType: examType as 'mock' | 'past',
        createdBy: session.user.id
      }
    });

    return NextResponse.json({
      subjectId: newSubject.subjectId,
      subjectName: newSubject.subjectName,
      examType: newSubject.examType
    });
  } catch (error) {
    console.error('科目追加に失敗しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 科目削除・復元・完全削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 科目削除・復元は開発者・管理者権限が必要
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: '科目操作には開発者権限が必要です' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const action = searchParams.get('action'); // 'soft_delete', 'restore', 'hard_delete'

    if (!subjectId) {
      return NextResponse.json({ error: '科目IDは必須です' }, { status: 400 });
    }

    if (!action) {
      return NextResponse.json({ error: 'アクションは必須です' }, { status: 400 });
    }

    switch (action) {
      case 'soft_delete':
        // ソフトデリート（削除フラグを立てる）
        await prisma.subject.update({
          where: { subjectId },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        });
        return NextResponse.json({ message: '科目を削除しました' });

      case 'restore':
        // 復元（削除フラグを外す）
        await prisma.subject.update({
          where: { subjectId },
          data: {
            isDeleted: false,
            deletedAt: null
          }
        });
        return NextResponse.json({ message: '科目を復元しました' });

      case 'hard_delete':
        // 完全削除（データベースから削除）
        await prisma.subject.delete({
          where: { subjectId }
        });
        return NextResponse.json({ message: '科目を完全に削除しました' });

      default:
        return NextResponse.json({ error: '無効なアクションです' }, { status: 400 });
    }
  } catch (error) {
    console.error('科目操作に失敗しました:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 