import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// 環境変数の検証
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const prisma = new PrismaClient();

export interface SupabaseUser {
  id: string;
  email?: string;
  user_metadata?: {
    userId?: string;
    name?: string;
  };
}

export class SupabaseAuthService {
  // Supabaseでユーザーを作成し、Prismaにも同期
  static async createUser(userId: string, name: string, password: string, role: string = 'USER') {
    let prismaUser = null;
    
    try {
      // 1. Supabaseでユーザーを作成
      const { data: supabaseUser, error: supabaseError } = await supabase.auth.admin.createUser({
        email: `${userId}@example.com`, // 仮のメールアドレス
        password: password,
        user_metadata: {
          userId: userId,
          name: name
        },
        email_confirm: true
      });

      if (supabaseError) {
        console.error('Supabase user creation error:', supabaseError);
        throw new Error(`Supabase user creation failed: ${supabaseError.message}`);
      }

      // 2. Prismaでユーザーを作成
      const hashedPassword = await bcrypt.hash(password, 12);
      prismaUser = await prisma.user.create({
        data: {
          userId: userId,
          name: name,
          password: hashedPassword,
          role: role as any
        }
      });

      // 3. ユーザーロールも作成
      await prisma.userRole.create({
        data: {
          userId: prismaUser.id,
          role: role as any
        }
      });

      return {
        supabaseUser: supabaseUser.user,
        prismaUser: prismaUser
      };
    } catch (error) {
      console.error('User creation error:', error);
      
      // エラーが発生した場合、Prismaで作成されたユーザーを削除
      if (prismaUser) {
        try {
          await prisma.user.delete({
            where: { id: prismaUser.id }
          });
        } catch (deleteError) {
          console.error('Failed to delete Prisma user after error:', deleteError);
        }
      }
      
      throw error;
    }
  }

  // SupabaseユーザーIDからPrismaユーザーを取得
  static async getPrismaUserBySupabaseId(supabaseUserId: string) {
    try {
      // Supabaseからユーザー情報を取得
      const { data: supabaseUser, error } = await supabase.auth.admin.getUserById(supabaseUserId);
      
      if (error || !supabaseUser.user) {
        throw new Error('Supabase user not found');
      }

      const userId = supabaseUser.user.user_metadata?.userId;
      if (!userId) {
        throw new Error('User ID not found in metadata');
      }

      // Prismaからユーザーを取得
      const prismaUser = await prisma.user.findUnique({
        where: { userId: userId },
        include: { userRoles: true }
      });

      return prismaUser;
    } catch (error) {
      console.error('Get Prisma user error:', error);
      throw error;
    }
  }

  // ユーザーIDからPrismaユーザーを取得
  static async getPrismaUserByUserId(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { userId: userId },
        include: { userRoles: true }
      });

      return user;
    } catch (error) {
      console.error('Get Prisma user by userId error:', error);
      throw error;
    }
  }

  // パスワード検証
  static async verifyPassword(userId: string, password: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { userId: userId }
      });

      if (!user) {
        return false;
      }

      return await bcrypt.compare(password, user.password);
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  // ユーザー削除（SupabaseとPrisma両方）
  static async deleteUser(userId: string) {
    try {
      // Prismaからユーザーを削除
      await prisma.user.delete({
        where: { userId: userId }
      });

      // Supabaseからも削除（必要に応じて）
      // 注意: Supabaseの削除は慎重に行う必要があります

      return true;
    } catch (error) {
      console.error('User deletion error:', error);
      throw error;
    }
  }
} 