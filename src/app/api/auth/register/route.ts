import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId, name, password } = await request.json();

    // バリデーション
    if (!userId || !name || !password) {
      return NextResponse.json(
        { error: 'すべての項目を入力してください。' },
        { status: 400 }
      );
    }

    if (userId.length < 3) {
      return NextResponse.json(
        { error: 'ユーザーIDは3文字以上で入力してください。' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください。' },
        { status: 400 }
      );
    }

    // 既存ユーザーのチェック
    const existingUser = await prisma.user.findUnique({
      where: { userId }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'このユーザーIDは既に使用されています。' },
        { status: 400 }
      );
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(password, 12);

    // ユーザーの作成
    const user = await prisma.user.create({
      data: {
        userId,
        name,
        password: hashedPassword,
        role: 'USER', // デフォルトは一般ユーザー
      },
    });

    // パスワードを除いてレスポンスを返す
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { 
        message: 'ユーザー登録が完了しました。',
        user: userWithoutPassword 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '登録中にエラーが発生しました。' },
      { status: 500 }
    );
  }
} 