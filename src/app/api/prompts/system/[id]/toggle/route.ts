import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// システムプロンプトの状態を変更（アクティブ/非アクティブ）
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // 開発者・管理者権限が必要
    if (session.user.role !== 'DEVELOPER' && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'システムプロンプト状態変更には開発者権限が必要です' }, { status: 403 });
    }

    const { id } = await params;

    // 既存のシステムプロンプトを確認
    const existingPrompt = await prisma.systemPrompt.findUnique({
      where: { id }
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'システムプロンプトが見つかりません' }, { status: 404 });
    }

    // 現在の状態を反転
    const newIsActive = !existingPrompt.isActive;

    const systemPrompt = await prisma.systemPrompt.update({
      where: { id },
      data: {
        isActive: newIsActive,
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
    console.error('システムプロンプト状態変更エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 