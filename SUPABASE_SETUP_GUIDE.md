# Supabaseセットアップガイド

## 1. Supabaseプロジェクトの作成

### 1.1 プロジェクト作成
1. [Supabase](https://supabase.com)にアクセス
2. **New Project** をクリック
3. プロジェクト名を入力（例：`quality-ai-db`）
4. データベースパスワードを設定（重要：後で使用）
5. リージョンを選択（推奨：`Northeast Asia (Tokyo)`）
6. **Create new project** をクリック

### 1.2 プロジェクト情報の取得
プロジェクト作成後、以下の情報を取得：

#### API設定
1. **Settings** → **API** に移動
2. 以下の情報をコピー：
   - **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
   - **anon public**: 公開キー
   - **service_role secret**: サービスロールキー

#### データベース設定
1. **Settings** → **Database** に移動
2. **Connection string** をコピー：
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

## 2. データベーススキーマの適用

### 2.1 Prismaマイグレーションの実行
```bash
# プロジェクトディレクトリに移動
cd ai-web-app

# 環境変数を設定
cp env.example .env.local

# .env.localファイルを編集して実際の値を設定
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Prismaクライアントの生成
npx prisma generate

# データベースにスキーマを適用
npx prisma db push

# または、マイグレーションを実行
npx prisma migrate deploy
```

### 2.2 初期データの投入
```bash
# シードデータの実行
npm run db:seed

# 管理者ユーザーの作成
npm run db:create-admin
```

## 3. セキュリティ設定

### 3.1 Row Level Security (RLS) の設定
Supabaseダッシュボードで以下を設定：

1. **Authentication** → **Policies** に移動
2. 各テーブルに対して適切なポリシーを設定
3. 必要に応じてRLSを有効化

### 3.2 接続制限の設定
1. **Settings** → **Database** に移動
2. **Connection pooling** を設定
3. **IP restrictions** を必要に応じて設定

## 4. 環境変数の設定

### 4.1 ローカル開発環境
`.env.local` ファイルに以下を設定：

```bash
# Database - Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

# OpenAI API設定
OPENAI_API_KEY=your_openai_api_key_here

# Notion API設定（必要に応じて）
NOTION_TOKEN=your_notion_integration_token_here
```

### 4.2 本番環境（Vercel）
Vercelダッシュボードで環境変数を設定（後述）

## 5. 接続テスト

### 5.1 データベース接続の確認
```bash
# Prisma Studioでデータベースを確認
npm run db:studio

# 接続テスト
npx prisma db pull
```

### 5.2 アプリケーションの動作確認
```bash
# 開発サーバーの起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
# ログイン機能が正常に動作することを確認
```

## 6. トラブルシューティング

### 6.1 よくある問題

#### 接続エラー
```bash
# エラー: PGRST301
# 解決策: SupabaseのRLS設定を確認
```

#### 認証エラー
```bash
# エラー: Invalid API key
# 解決策: APIキーが正しく設定されているか確認
```

#### マイグレーションエラー
```bash
# エラー: Migration failed
# 解決策: データベースの状態を確認し、必要に応じてリセット
npx prisma migrate reset --force
```

## 7. 本番環境の準備

### 7.1 バックアップ設定
1. **Settings** → **Database** でバックアップ設定を確認
2. 自動バックアップが有効になっていることを確認

### 7.2 監視設定
1. **Settings** → **Logs** でログ設定を確認
2. 必要に応じてアラートを設定

## 次のステップ

Supabaseの設定が完了したら、[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)を参照してVercelでのデプロイを行ってください。 