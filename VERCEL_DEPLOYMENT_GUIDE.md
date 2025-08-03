# Vercelデプロイガイド - Supabase接続

このガイドでは、Vercelでアプリケーションをデプロイし、Supabaseと接続する手順を説明します。

## 前提条件

- Supabaseプロジェクトが作成済み
- Vercelアカウントが作成済み
- GitHubリポジトリにコードがプッシュ済み

## 1. Supabase設定の確認

### 1.1 Supabaseプロジェクトの情報を取得

1. [Supabaseダッシュボード](https://supabase.com/dashboard)にアクセス
2. プロジェクトを選択
3. **Settings** → **API** で以下の情報を確認：
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon public**: 公開キー
   - **service_role secret**: サービスロールキー

### 1.2 データベース接続URLの取得

1. **Settings** → **Database** で以下を確認：
   - **Connection string**: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

## 2. Vercelプロジェクトの作成

### 2.1 GitHubリポジトリの接続

1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. **New Project** をクリック
3. GitHubリポジトリを選択
4. プロジェクト名を設定（例：`ai-web-app`）

### 2.2 環境変数の設定

**Environment Variables** セクションで以下の変数を設定：

```bash
# データベース
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# NextAuth設定
NEXTAUTH_SECRET=[YOUR-SECRET-KEY]
NEXTAUTH_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app

# OpenAI設定
OPENAI_API_KEY=[YOUR-OPENAI-API-KEY]

# Notion設定（必要に応じて）
NOTION_TOKEN=[YOUR-NOTION-TOKEN]
```

### 2.3 ビルド設定

**Build & Development Settings** で以下を設定：

- **Framework Preset**: Next.js
- **Build Command**: `prisma generate && npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 3. デプロイの実行

### 3.1 初回デプロイ

1. **Deploy** ボタンをクリック
2. ビルドログを確認してエラーがないかチェック
3. デプロイ完了後、URLを確認

### 3.2 手動デプロイ（オプション）

ローカルからデプロイする場合：

```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp env.example .env.local
# .env.localファイルを編集して実際の値を設定

# デプロイスクリプトの実行
npm run deploy
```

## 4. デプロイ後の確認

### 4.1 アプリケーションの動作確認

1. デプロイされたURLにアクセス
2. ログイン機能が正常に動作するか確認
3. データベース接続が正常か確認

### 4.2 ログの確認

Vercelダッシュボードで以下を確認：

1. **Functions** タブでAPIエンドポイントのログ
2. **Deployments** タブでビルドログ
3. エラーが発生している場合は詳細を確認

## 5. トラブルシューティング

### 5.1 よくある問題

#### データベース接続エラー

```bash
# エラー: PGRST301
# 解決策: SupabaseのRLS（Row Level Security）設定を確認
```

#### 環境変数エラー

```bash
# エラー: Missing environment variable
# 解決策: Vercelの環境変数設定を再確認
```

#### ビルドエラー

```bash
# エラー: Prisma generate failed
# 解決策: package.jsonのbuildCommandを確認
```

### 5.2 デバッグ方法

1. **ローカルテスト**:
   ```bash
   npm run dev
   ```

2. **Prisma Studio**:
   ```bash
   npm run db:studio
   ```

3. **データベース接続テスト**:
   ```bash
   npx prisma db push
   ```

## 6. 本番環境の最適化

### 6.1 パフォーマンス設定

1. **Vercel Analytics** の有効化
2. **Edge Functions** の活用
3. **Image Optimization** の設定

### 6.2 セキュリティ設定

1. **CORS** 設定の確認
2. **Rate Limiting** の設定
3. **Environment Variables** の暗号化

## 7. 継続的デプロイメント

### 7.1 GitHub連携

1. **GitHub Integration** の設定
2. **Auto Deploy** の有効化
3. **Branch Protection** の設定

### 7.2 プレビューデプロイ

1. **Preview Deployments** の設定
2. **Environment Variables** の分離
3. **Testing** の自動化

## 8. 監視とメンテナンス

### 8.1 ログ監視

1. **Vercel Logs** の定期確認
2. **Error Tracking** の設定
3. **Performance Monitoring** の有効化

### 8.2 データベース管理

1. **Supabase Dashboard** での監視
2. **Backup** の定期実行
3. **Migration** の管理

## サポート

問題が発生した場合は、以下を確認してください：

1. [Vercel Documentation](https://vercel.com/docs)
2. [Supabase Documentation](https://supabase.com/docs)
3. [Next.js Documentation](https://nextjs.org/docs)

または、プロジェクトのREADME.mdを参照してください。 