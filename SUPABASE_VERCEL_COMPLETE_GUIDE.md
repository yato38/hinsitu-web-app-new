# Supabase + Vercel 完全セットアップガイド

このガイドでは、品質AIアプリケーションをSupabaseをデータベースとして、Vercelにデプロイする完全な手順を説明します。

## 📋 前提条件

- [Supabase](https://supabase.com)アカウント
- [Vercel](https://vercel.com)アカウント
- [GitHub](https://github.com)アカウント
- Node.js 18以上
- npm または yarn

## 🚀 クイックスタート（推奨）

### 1. 自動セットアップスクリプトの実行

```bash
# プロジェクトディレクトリに移動
cd ai-web-app

# 自動セットアップスクリプトを実行
npm run setup:supabase-vercel
```

このスクリプトは以下を自動で行います：
- Supabase情報の入力
- 環境変数ファイルの作成
- Prismaクライアントの生成
- データベーススキーマの適用
- Vercel設定ファイルの更新

## 📝 手動セットアップ（詳細）

### 1. Supabaseプロジェクトの作成

#### 1.1 プロジェクト作成
1. [Supabaseダッシュボード](https://supabase.com/dashboard)にアクセス
2. **New Project** をクリック
3. 以下の情報を入力：
   - **Organization**: 既存の組織を選択または新規作成
   - **Name**: `quality-ai-db`
   - **Database Password**: 強力なパスワードを設定（重要）
   - **Region**: `Northeast Asia (Tokyo)`（推奨）
4. **Create new project** をクリック

#### 1.2 プロジェクト情報の取得
プロジェクト作成後、以下の情報を取得：

**API設定（Settings → API）:**
- **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
- **anon public**: 公開キー
- **service_role secret**: サービスロールキー

**データベース設定（Settings → Database）:**
- **Connection string**: `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres`

### 2. ローカル環境の設定

#### 2.1 環境変数ファイルの作成
```bash
# .env.localファイルを作成
cp env.example .env.local
```

`.env.local`ファイルを編集：
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

# その他の環境変数
NODE_ENV=development
```

#### 2.2 データベーススキーマの適用
```bash
# 依存関係のインストール
npm install

# Prismaクライアントの生成
npx prisma generate

# データベーススキーマの適用
npx prisma db push

# または、マイグレーションを実行
npx prisma migrate deploy
```

#### 2.3 初期データの投入
```bash
# シードデータの実行
npm run db:seed

# 管理者ユーザーの作成
npm run db:create-admin
```

### 3. Vercelプロジェクトの作成

#### 3.1 GitHubリポジトリの準備
1. コードをGitHubにプッシュ
2. リポジトリが公開されていることを確認

#### 3.2 Vercelプロジェクトの作成
1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. **New Project** をクリック
3. GitHubリポジトリを選択
4. プロジェクト設定：
   - **Framework Preset**: Next.js
   - **Root Directory**: `ai-web-app`（リポジトリのルートにai-web-appフォルダがある場合）
   - **Build Command**: `prisma generate && npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

#### 3.3 環境変数の設定
Vercelダッシュボードの **Environment Variables** セクションで以下を設定：

**必須環境変数:**
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
NEXTAUTH_SECRET=[YOUR-SECRET-KEY]
NEXTAUTH_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app
OPENAI_API_KEY=[YOUR-OPENAI-API-KEY]
```

**オプション環境変数:**
```bash
NOTION_TOKEN=[YOUR-NOTION-TOKEN]
```

### 4. デプロイの実行

#### 4.1 初回デプロイ
1. Vercelダッシュボードで **Deploy** をクリック
2. ビルドログを確認
3. デプロイ完了後、URLを確認

#### 4.2 手動デプロイ（オプション）
```bash
# Vercel CLIを使用したデプロイ
npm run deploy
```

### 5. デプロイ後の確認

#### 5.1 動作確認
1. デプロイされたURLにアクセス
2. ログイン機能が正常に動作するか確認
3. データベース接続が正常か確認

#### 5.2 ログの確認
- **Functions** タブでAPIエンドポイントのログ
- **Deployments** タブでビルドログ
- エラーが発生している場合は詳細を確認

## 🔧 トラブルシューティング

### よくある問題と解決策

#### 1. データベース接続エラー
```bash
# エラー: PGRST301
# 解決策: SupabaseのRLS設定を確認
```

#### 2. 環境変数エラー
```bash
# エラー: Missing environment variable
# 解決策: Vercelの環境変数設定を再確認
```

#### 3. ビルドエラー
```bash
# エラー: Prisma generate failed
# 解決策: package.jsonのbuildCommandを確認
```

#### 4. NextAuthエラー
```bash
# エラー: Invalid NEXTAUTH_SECRET
# 解決策: NEXTAUTH_SECRETを再生成して設定
```

### デバッグ方法

#### 1. ローカルテスト
```bash
npm run dev
```

#### 2. Prisma Studio
```bash
npm run db:studio
```

#### 3. データベース接続テスト
```bash
npx prisma db push
```

## 🔒 セキュリティ設定

### 1. Supabaseセキュリティ
1. **Row Level Security (RLS)** の設定
2. **Connection pooling** の設定
3. **IP restrictions** の設定（必要に応じて）

### 2. Vercelセキュリティ
1. **Environment Variables** の暗号化
2. **Access Control** の設定
3. **Rate Limiting** の設定

## 📊 監視とメンテナンス

### 1. ログ監視
- **Vercel Logs** の定期確認
- **Supabase Logs** の確認
- **Error Tracking** の設定

### 2. データベース管理
- **Supabase Dashboard** での監視
- **Backup** の定期実行
- **Migration** の管理

## 🚀 継続的デプロイメント

### 1. 自動デプロイの設定
1. **Git Integration** で自動デプロイを有効化
2. **Branch Protection** を設定
3. **Preview Deployments** を有効化

### 2. 環境別の設定
- **Production**: 本番環境用の設定
- **Preview**: プレビュー環境用の設定
- **Development**: 開発環境用の設定

## 📚 参考資料

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. 各ガイドの詳細版：
   - [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
   - [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)
   - [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

2. プロジェクトのREADME.md

3. 各サービスの公式ドキュメント

## 🎉 完了

設定が完了したら、アプリケーションが正常に動作することを確認し、必要に応じて追加の設定やカスタマイズを行ってください。 