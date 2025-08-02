import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

// システムプロンプトを更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者・管理者権限が必要
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'システムプロンプト編集には開発者権限が必要です' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, content, applicableTasks, priority, isActive } = body;

    if (!name || !content) {
      return NextResponse.json({ error: '名前、内容は必須です' }, { status: 400 });
    }

    // 既存のシステムプロンプトを確認
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id }
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'システムプロンプトが見つかりません' }, { status: 404 });
    }

    const systemPrompt = await prisma.systemPrompt.update({
      where: { id },
      data: {
        name,
        content,
        applicableTasks: JSON.stringify(applicableTasks || []),
        priority: priority || 1,
        isActive: isActive ?? true,
        updatedAt: new Date()
      }
    });

    // JSON文字列を配列に変換して返す
    const formattedPrompt = {
      ...systemPrompt,
      applicableTasks: JSON.parse(systemPrompt.applicableTasks || '[]')
    };

    return NextResponse.json(formattedPrompt);
  } catch (error) {
    console.error('システムプロンプト更新エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// システムプロンプトを削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = new PrismaClient();
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者・管理者権限が必要
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'システムプロンプト削除には開発者権限が必要です' }, { status: 403 });
    }

    const { id } = await params;

    // 既存のシステムプロンプトを確認
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id }
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'システムプロンプトが見つかりません' }, { status: 404 });
    }

    await prisma.systemPrompt.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'システムプロンプトが削除されました' });
  } catch (error) {
    console.error('システムプロンプト削除エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 