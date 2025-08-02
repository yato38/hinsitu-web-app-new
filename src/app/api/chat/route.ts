import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAIクライアントの初期化（APIキーがある場合のみ）
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export async function POST(request: NextRequest) {
  try {
    const { message, taskType } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'メッセージが必要です' },
        { status: 400 }
      );
    }

    // OpenAI APIキーが設定されていない場合のモックレスポンス
    if (!process.env.OPENAI_API_KEY) {
      let mockResponse = '';
      
      if (taskType === 'citation_check') {
        mockResponse = `【引用チェック結果】

以下の点について確認しました：

1. 引用の正確性：特に問題は見つかりませんでした
2. 引用形式：適切に引用符が使用されています
3. 出典の明記：必要に応じて出典が明記されています

総合評価：引用に関する不備は確認されませんでした。

※ これはモックレスポンスです。実際のAI機能を使用するには、OpenAI APIキーを設定してください。`;
      } else {
        mockResponse = `申し訳ございませんが、現在AI機能は設定中です。あなたのメッセージ「${message}」を受け取りました。実際のAI機能を使用するには、OpenAI APIキーを設定してください。`;
      }
      
      return NextResponse.json({
        response: mockResponse
      });
    }

    // タスクタイプに応じたシステムプロンプト
    let systemPrompt = "あなたは親切で役立つAIアシスタントです。日本語で丁寧に回答してください。";
    
    if (taskType === 'citation_check') {
      systemPrompt = `あなたは大学入試模試の品質管理専門家です。引用チェックの専門家として、以下の点を厳密にチェックしてください：

1. 引用の正確性：原文と一字一句正確に一致しているか
2. 引用形式：適切な引用符（「」、『』、""、''）が使用されているか
3. 出典の明記：引用元が適切に明記されているか
4. 引用の必要性：引用が適切な場面で使用されているか
5. 引用の長さ：過度に長い引用になっていないか

指摘事項がある場合は、具体的な箇所と修正提案を含めて回答してください。
問題がない場合は、「引用に関する不備は確認されませんでした」と回答してください。

回答は以下の形式で構造化してください：
- チェック項目ごとの結果
- 発見された問題（あれば）
- 修正提案（あれば）
- 総合評価`;
    }

    // OpenAI APIを使用した実際のレスポンス
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI APIキーが設定されていません' },
        { status: 500 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '申し訳ございませんが、回答を生成できませんでした。';

    return NextResponse.json({ response });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 