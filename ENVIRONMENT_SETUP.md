# 環境変数管理ガイド

## 概要
このプロジェクトでは、開発環境と本番環境で異なる環境変数を使用して、セキュリティと機能を最適化しています。

## ファイル構成

### 開発環境
```
ai-web-app/
├── .env.local               # ローカル開発用（gitignore）
├── .env.development         # 開発環境用（gitignore）
└── env.example              # テンプレート（git管理）
```

### 本番環境
- Vercelダッシュボードで環境変数を設定
- ファイルベースではなく、Vercelの設定画面で管理

## 環境変数の優先順位

1. `.env.local` (最も優先)
2. `.env.development` (NODE_ENV=development時)
3. `.env.production` (NODE_ENV=production時)
4. `.env`

## 開発環境のセットアップ

### 1. ローカル開発用ファイルの作成

```bash
# .env.localファイルを作成
cp env.example .env.local
```

### 2. .env.localの設定例

```bash
# Database - Supabase (開発用)
DATABASE_URL="postgresql://postgres:hinsitukanriyamamoto@db.zhxmdcylgkbtpknmwvpg.supabase.co:5432/postgres"

# Supabase設定 (開発用)
NEXT_PUBLIC_SUPABASE_URL="https://zhxmdcylgkbtpknmwvpg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTI1MzYsImV4cCI6MjA2OTc2ODUzNn0.8yjxZeYr2ik75gsistOeltlt1fgAggJYOXt_p3zJipw"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoeG1kY3lsZ2tidHBrbm13dnBnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE5MjUzNiwiZXhwIjoyMDY5NzY4NTM2fQ.9IgxIA01Igq91o3iSMGeb5Qs3U7Bmcrq4E-RKKfdGak"

# NextAuth (開発用)
NEXTAUTH_URL="http://localhost:3003"
NEXTAUTH_SECRET="aa3dc4678a3ed270b8d87b11785e8f8adfeda975548d10e7fed94d22bf40f91f"

# OpenAI API設定 (開発用)
OPENAI_API_KEY=your_openai_api_key_here

# Notion API設定 (開発用)
NOTION_TOKEN=your_notion_integration_token_here

# 環境設定
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
```

### 3. 開発環境用ファイルの作成

```bash
# .env.developmentファイルを作成
cp env.example .env.development
```

## 本番環境のセットアップ

### Vercelダッシュボードでの設定

1. **Vercelダッシュボードにアクセス**
2. **プロジェクトを選択**
3. **Settings → Environment Variables**
4. **各環境変数を追加**

### 本番環境用の設定例

```bash
# Database - Supabase (本番用)
DATABASE_URL="postgresql://postgres:your_production_password@your_production_db_host:5432/your_production_db"

# Supabase設定 (本番用)
NEXT_PUBLIC_SUPABASE_URL="https://your-production-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_production_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_production_service_role_key"

# NextAuth (本番用)
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your_production_nextauth_secret"

# OpenAI API設定 (本番用)
OPENAI_API_KEY=your_production_openai_api_key

# Notion API設定 (本番用)
NOTION_TOKEN=your_production_notion_token

# 環境設定
NODE_ENV=production
DEBUG=false
LOG_LEVEL=error
```

## 環境変数の説明

### データベース関連
- `DATABASE_URL`: Supabaseデータベースの接続文字列
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 匿名ユーザー用のAPIキー
- `SUPABASE_SERVICE_ROLE_KEY`: 管理者権限用のAPIキー

### 認証関連
- `NEXTAUTH_URL`: NextAuth.jsの認証URL
- `NEXTAUTH_SECRET`: セッション暗号化用の秘密鍵

### 外部API
- `OPENAI_API_KEY`: OpenAI APIのアクセスキー
- `NOTION_TOKEN`: Notion APIの統合トークン

### 環境設定
- `NODE_ENV`: 実行環境（development/production）
- `DEBUG`: デバッグモードの有効/無効
- `LOG_LEVEL`: ログレベルの設定

## セキュリティのベストプラクティス

### 開発環境
- テスト用のAPIキーを使用
- デバッグ情報を有効化
- ローカルデータベースを使用

### 本番環境
- 本番用のAPIキーを使用
- デバッグ情報を無効化
- 本番データベースを使用
- 強力な秘密鍵を使用

## トラブルシューティング

### 環境変数が読み込まれない場合
1. ファイル名が正しいか確認
2. ファイルの場所が正しいか確認
3. サーバーを再起動

### 本番環境でエラーが発生する場合
1. Vercelダッシュボードで環境変数が設定されているか確認
2. 環境変数の値が正しいか確認
3. デプロイを再実行

## 注意事項

- `.env.local`、`.env.development`、`.env.production`ファイルは`.gitignore`に含まれています
- 機密情報は絶対にリポジトリにコミットしないでください
- 本番環境ではVercelダッシュボードでの環境変数設定を推奨します 