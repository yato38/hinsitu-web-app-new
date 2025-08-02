import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// システムプロンプト一覧を取得
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: '科目IDは必須です' }, { status: 400 });
    }

    const systemPrompts = await prisma.systemPrompt.findMany({
      where: {
        subjectId: subjectId
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    // JSON文字列を配列に変換
    const formattedPrompts = systemPrompts.map(prompt => ({
      ...prompt,
      applicableTasks: JSON.parse(prompt.applicableTasks || '[]')
    }));

    return NextResponse.json({ systemPrompts: formattedPrompts });
  } catch (error) {
    console.error('システムプロンプト取得エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// システムプロンプトを追加
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者・管理者権限が必要
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'システムプロンプト追加には開発者権限が必要です' }, { status: 403 });
    }

    const body = await request.json();
    const { subjectId, name, content, applicableTasks, priority, isActive, maxCount } = body;

    if (!subjectId || !name || !content) {
      return NextResponse.json({ error: '科目ID、名前、内容は必須です' }, { status: 400 });
    }

    // 既存のシステムプロンプト数をチェック
    const existingCount = await prisma.systemPrompt.count({
      where: {
        subjectId: subjectId
      }
    });

    if (existingCount >= (maxCount || 3)) {
      return NextResponse.json({ error: `システムプロンプトは最大${maxCount || 3}個までです` }, { status: 400 });
    }

    const systemPrompt = await prisma.systemPrompt.create({
      data: {
        subjectId,
        name,
        content,
        applicableTasks: JSON.stringify(applicableTasks || []),
        priority: priority || 1,
        isActive: isActive ?? true,
        maxCount: maxCount || 3,
        createdBy: session.user.id
      }
    });

    return NextResponse.json(systemPrompt);
  } catch (error) {
    console.error('システムプロンプト追加エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者権限チェック
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'システムプロンプトの更新には開発者権限が必要です' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, content, applicableTasks, priority, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'システムプロンプトIDが必要です' }, { status: 400 });
    }

    // システムプロンプトの存在確認
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'システムプロンプトが見つかりません' }, { status: 404 });
    }

    // システムプロンプトを更新
    const updatedPrompt = await prisma.systemPrompt.update({
      where: { id },
      data: {
        name: name || existingPrompt.name,
        content: content || existingPrompt.content,
        applicableTasks: applicableTasks !== undefined ? JSON.stringify(applicableTasks) : existingPrompt.applicableTasks,
        priority: priority !== undefined ? priority : existingPrompt.priority,
        isActive: isActive !== undefined ? isActive : existingPrompt.isActive,
        updatedAt: new Date(),
      },
    });

    // JSON文字列を配列に変換
    const formattedPrompt = {
      ...updatedPrompt,
      applicableTasks: JSON.parse(updatedPrompt.applicableTasks || '[]')
    };

    return NextResponse.json({ 
      success: true, 
      systemPrompt: formattedPrompt,
      message: 'システムプロンプトが正常に更新されました'
    });

  } catch (error) {
    console.error('システムプロンプト更新エラー:', error);
    return NextResponse.json({ error: 'システムプロンプトの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者権限チェック
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'システムプロンプトの削除には開発者権限が必要です' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'システムプロンプトIDが必要です' }, { status: 400 });
    }

    // システムプロンプトの存在確認
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'システムプロンプトが見つかりません' }, { status: 404 });
    }

    // システムプロンプトを削除
    await prisma.systemPrompt.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'システムプロンプトが正常に削除されました'
    });

  } catch (error) {
    console.error('システムプロンプト削除エラー:', error);
    return NextResponse.json({ error: 'システムプロンプトの削除に失敗しました' }, { status: 500 });
  }
} 