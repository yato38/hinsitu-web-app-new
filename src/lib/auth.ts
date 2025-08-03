import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SupabaseAuthService } from "./supabase-auth";

const prisma = new PrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        userId: { label: "ユーザーID", type: "text" },
        password: { label: "パスワード", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.userId || !credentials?.password) {
          return null;
        }

        try {
          // SupabaseAuthServiceを使用してユーザー認証
          const user = await SupabaseAuthService.getPrismaUserByUserId(credentials.userId as string);

          if (!user) {
            return null;
          }

          const isPasswordValid = await SupabaseAuthService.verifyPassword(
            credentials.userId as string,
            credentials.password as string
          );

          if (!isPasswordValid) {
            return null;
          }

          // ユーザーの役割を配列として取得
          const roles = user.userRoles ? user.userRoles.map(ur => ur.role) : [];
          // 従来の単一役割との互換性のため、メインの役割も含める
          if (user.role && !roles.includes(user.role)) {
            roles.push(user.role);
          }

          return {
            id: user.id,
            userId: user.userId,
            name: user.name,
            role: user.role,
            roles: roles,
            password: '******', // セキュリティのためダミーパスワードを表示
          };
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.role = user.role;
        token.roles = user.roles;
        token.password = user.password; // ダミーパスワードを追加
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string;
        session.user.userId = token.userId as string;
        session.user.role = token.role as string;
        session.user.roles = token.roles as string[];
        session.user.password = token.password as string; // ダミーパスワードを追加
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  }
}); 