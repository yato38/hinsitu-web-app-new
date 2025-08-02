import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { name, model, apiKey, isActive } = body;

    // 必須フィールドの検証
    if (!name || !model || !apiKey) {
      return NextResponse.json({ error: '必須フィールドが不足しています' }, { status: 400 });
    }

    // アクティブな設定がある場合、非アクティブにする
    if (isActive) {
      await prisma.aIConfig.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    // AI設定をデータベースに保存
    const aiConfig = await prisma.aIConfig.create({
      data: {
        name,
        model,
        apiKey, // 実際の運用では暗号化して保存すべき
        isActive: isActive || false,
      },
    });

    return NextResponse.json({ 
      success: true, 
      aiConfig,
      message: 'AI設定が正常に保存されました'
    });

  } catch (error) {
    console.error('AI設定保存エラー:', error);
    return NextResponse.json({ error: 'AI設定の保存に失敗しました' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const aiConfigs = await prisma.aIConfig.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ aiConfigs });

  } catch (error) {
    console.error('AI設定取得エラー:', error);
    return NextResponse.json({ error: 'AI設定の取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, model, apiKey, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    // アクティブな設定がある場合、非アクティブにする
    if (isActive) {
      await prisma.aIConfig.updateMany({
        where: { 
          isActive: true,
          id: { not: id }
        },
        data: { isActive: false },
      });
    }

    // AI設定を更新
    const aiConfig = await prisma.aIConfig.update({
      where: { id },
      data: {
        name,
        model,
        apiKey,
        isActive,
      },
    });

    return NextResponse.json({ 
      success: true, 
      aiConfig,
      message: 'AI設定が正常に更新されました'
    });

  } catch (error) {
    console.error('AI設定更新エラー:', error);
    return NextResponse.json({ error: 'AI設定の更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    await prisma.aIConfig.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'AI設定が正常に削除されました'
    });

  } catch (error) {
    console.error('AI設定削除エラー:', error);
    return NextResponse.json({ error: 'AI設定の削除に失敗しました' }, { status: 500 });
  }
} 