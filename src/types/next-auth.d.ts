import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userId: string;
      name: string;
      role: string;
      roles: string[];
      password?: string; // パスワードフィールドを追加
    };
  }

  interface User {
    id: string;
    userId: string;
    name: string;
    role: string;
    roles: string[];
    password?: string; // パスワードフィールドを追加
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
    roles: string[];
    password?: string; // パスワードフィールドを追加
  }
} 