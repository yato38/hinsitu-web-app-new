import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { supabase } from '@/lib/supabase'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // 1. Prisma接続テスト
    console.log('🔍 Prisma接続をテスト中...')
    const userCount = await prisma.user.count()
    console.log(`✅ Prisma接続成功: ${userCount}人のユーザーが存在`)

    // 2. Supabase接続テスト
    console.log('🔍 Supabase接続をテスト中...')
    const { data: subjects, error } = await supabase
      .from('Subject')
      .select('*')
      .limit(1)

    if (error) {
      console.error('❌ Supabase接続エラー:', error)
      return NextResponse.json({
        success: false,
        prisma: { connected: true, userCount },
        supabase: { connected: false, error: error.message }
      }, { status: 500 })
    }

    console.log(`✅ Supabase接続成功: ${subjects?.length || 0}件の科目データ`)

    // 3. 環境変数の確認
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      prisma: {
        connected: true,
        userCount,
        tables: ['User', 'Subject', 'TaskDefinition', 'SystemPrompt', 'WorkProgress', 'PromptUpload', 'AdminSettings']
      },
      supabase: {
        connected: true,
        subjectCount: subjects?.length || 0,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL
      },
      environmentVariables: envCheck
    })

  } catch (error) {
    console.error('❌ 接続テストエラー:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
} 