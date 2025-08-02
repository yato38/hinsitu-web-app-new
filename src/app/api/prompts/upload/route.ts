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
    const { subjectId, taskId, fileType, fileName, fileContent, description, version } = body;

    // 必須フィールドの検証
    if (!subjectId || !taskId || !fileType || !fileName || !fileContent) {
      return NextResponse.json({ error: '必須フィールドが不足しています' }, { status: 400 });
    }

    // プロンプトをデータベースに保存
    const promptUpload = await prisma.promptUpload.create({
      data: {
        subjectId,
        taskId,
        fileType,
        fileName,
        fileContent,
        description: description || null,
        version: version || '1.0',
        uploadedBy: session.user.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      promptUpload,
      message: 'プロンプトが正常にアップロードされました'
    });

  } catch (error) {
    console.error('プロンプトアップロードエラー:', error);
    return NextResponse.json({ error: 'プロンプトのアップロードに失敗しました' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const taskId = searchParams.get('taskId');
    const id = searchParams.get('id');

    // 特定のプロンプトを取得する場合
    if (id) {
      const promptUpload = await prisma.promptUpload.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!promptUpload) {
        return NextResponse.json({ error: 'プロンプトが見つかりません' }, { status: 404 });
      }

      return NextResponse.json({ promptUpload });
    }

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;
    if (taskId) where.taskId = taskId;

    const promptUploads = await prisma.promptUpload.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({ promptUploads });

  } catch (error) {
    console.error('プロンプト取得エラー:', error);
    return NextResponse.json({ error: 'プロンプトの取得に失敗しました' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { id, fileName, fileContent, description, version } = body;

    if (!id) {
      return NextResponse.json({ error: 'プロンプトIDが必要です' }, { status: 400 });
    }

    // プロンプトの存在確認
    const existingPrompt = await prisma.promptUpload.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'プロンプトが見つかりません' }, { status: 404 });
    }

    // プロンプトを更新
    const updatedPrompt = await prisma.promptUpload.update({
      where: { id },
      data: {
        fileName: fileName || existingPrompt.fileName,
        fileContent: fileContent || existingPrompt.fileContent,
        description: description !== undefined ? description : existingPrompt.description,
        version: version || existingPrompt.version,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      promptUpload: updatedPrompt,
      message: 'プロンプトが正常に更新されました'
    });

  } catch (error) {
    console.error('プロンプト更新エラー:', error);
    return NextResponse.json({ error: 'プロンプトの更新に失敗しました' }, { status: 500 });
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
      return NextResponse.json({ error: 'プロンプトIDが必要です' }, { status: 400 });
    }

    // プロンプトの存在確認
    const existingPrompt = await prisma.promptUpload.findUnique({
      where: { id },
    });

    if (!existingPrompt) {
      return NextResponse.json({ error: 'プロンプトが見つかりません' }, { status: 404 });
    }

    // プロンプトを削除
    await prisma.promptUpload.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true,
      message: 'プロンプトが正常に削除されました'
    });

  } catch (error) {
    console.error('プロンプト削除エラー:', error);
    return NextResponse.json({ error: 'プロンプトの削除に失敗しました' }, { status: 500 });
  }
} 