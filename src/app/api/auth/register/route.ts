import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SupabaseAuthService } from '@/lib/supabase-auth';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // 本番環境での登録制限を解除
    // if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
    //   return NextResponse.json(
    //     { error: '本番環境ではユーザー登録機能は利用できません。' },
    //     { status: 503 }
    //   );
    // }

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

    // SupabaseとPrismaの両方でユーザーを作成
    const { supabaseUser, prismaUser } = await SupabaseAuthService.createUser(
      userId,
      name,
      password,
      'USER'
    );

    // パスワードを除いてレスポンスを返す
    const { password: _, ...userWithoutPassword } = prismaUser;

    return NextResponse.json(
      { 
        message: 'ユーザー登録が完了しました。',
        user: userWithoutPassword,
        supabaseUserId: supabaseUser?.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // エラーメッセージをより詳細に
    let errorMessage = '登録中にエラーが発生しました。';
    if (error instanceof Error) {
      if (error.message.includes('Supabase user creation failed')) {
        errorMessage = '認証システムでのユーザー作成に失敗しました。';
      } else if (error.message.includes('duplicate key')) {
        errorMessage = 'このユーザーIDは既に使用されています。';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 