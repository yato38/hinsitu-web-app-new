# Vercel環境変数設定ガイド

## 1. Vercelプロジェクトの作成

### 1.1 GitHubリポジトリの接続
1. [Vercelダッシュボード](https://vercel.com/dashboard)にアクセス
2. **New Project** をクリック
3. GitHubリポジトリを選択（`品質AI/ai-web-app`）
4. プロジェクト名を設定（例：`quality-ai-app`）

### 1.2 プロジェクト設定
- **Framework Preset**: Next.js
- **Root Directory**: `ai-web-app`（リポジトリのルートにai-web-appフォルダがある場合）
- **Build Command**: `prisma generate && npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## 2. 環境変数の設定

### 2.1 必須環境変数

Vercelダッシュボードの **Environment Variables** セクションで以下を設定：

#### データベース設定
```bash
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

#### Supabase設定
```bash
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```

#### NextAuth設定
```bash
NEXTAUTH_SECRET=[YOUR-SECRET-KEY]
NEXTAUTH_URL=https://[YOUR-VERCEL-DOMAIN].vercel.app
```

#### OpenAI設定
```bash
OPENAI_API_KEY=[YOUR-OPENAI-API-KEY]
```

#### Notion設定（必要に応じて）
```bash
NOTION_TOKEN=[YOUR-NOTION-TOKEN]
```

### 2.2 環境変数の詳細説明

#### DATABASE_URL
- **説明**: SupabaseのPostgreSQLデータベースへの接続URL
- **形式**: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **取得方法**: Supabaseダッシュボード → Settings → Database → Connection string

#### NEXT_PUBLIC_SUPABASE_URL
- **説明**: SupabaseプロジェクトのURL
- **形式**: `https://[PROJECT-REF].supabase.co`
- **取得方法**: Supabaseダッシュボード → Settings → API → Project URL

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **説明**: クライアントサイドで使用する公開キー
- **取得方法**: Supabaseダッシュボード → Settings → API → anon public

#### SUPABASE_SERVICE_ROLE_KEY
- **説明**: サーバーサイドで使用するサービスロールキー
- **取得方法**: Supabaseダッシュボード → Settings → API → service_role secret

#### NEXTAUTH_SECRET
- **説明**: NextAuth.jsの暗号化キー
- **生成方法**: 
  ```bash
  openssl rand -base64 32
  ```
  または
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

#### NEXTAUTH_URL
- **説明**: アプリケーションのURL
- **形式**: `https://[YOUR-VERCEL-DOMAIN].vercel.app`
- **注意**: デプロイ後に実際のURLに更新

## 3. 環境別の設定

### 3.1 本番環境（Production）
- **Environment**: Production
- **Branch**: main（またはデフォルトブランチ）

### 3.2 プレビュー環境（Preview）
- **Environment**: Preview
- **Branch**: 開発ブランチ（feature/*, develop等）

### 3.3 開発環境（Development）
- **Environment**: Development
- **Branch**: 開発ブランチ

## 4. 環境変数の設定手順

### 4.1 Vercelダッシュボードでの設定
1. プロジェクトの **Settings** タブに移動
2. **Environment Variables** セクションを開く
3. **Add New** をクリック
4. 各環境変数を追加：
   - **Name**: 変数名（例：`DATABASE_URL`）
   - **Value**: 変数の値
   - **Environment**: 適用する環境を選択（Production, Preview, Development）

### 4.2 一括設定（推奨）
以下のスクリプトを使用して一括で設定：

```bash
# vercel-env-setup.sh
#!/bin/bash

# Supabase設定
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# NextAuth設定
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# OpenAI設定
vercel env add OPENAI_API_KEY production

# Notion設定（必要に応じて）
vercel env add NOTION_TOKEN production
```

## 5. セキュリティのベストプラクティス

### 5.1 環境変数の管理
- 機密情報は絶対にGitにコミットしない
- 本番環境では強力なパスワードを使用
- 定期的にキーをローテーション

### 5.2 アクセス制御
- Vercelプロジェクトへのアクセス権限を制限
- Supabaseプロジェクトへのアクセス権限を制限
- 必要最小限の権限のみを付与

## 6. トラブルシューティング

### 6.1 よくある問題

#### 環境変数が読み込まれない
```bash
# 解決策: デプロイ後に環境変数を再設定
# Vercelダッシュボードで環境変数を確認
```

#### データベース接続エラー
```bash
# エラー: PGRST301
# 解決策: DATABASE_URLが正しく設定されているか確認
```

#### NextAuthエラー
```bash
# エラー: Invalid NEXTAUTH_SECRET
# 解決策: NEXTAUTH_SECRETを再生成して設定
```

### 6.2 デバッグ方法
1. **Vercel Logs**: デプロイログを確認
2. **Function Logs**: API関数のログを確認
3. **Environment Variables**: 設定された環境変数を確認

## 7. デプロイ後の確認

### 7.1 動作確認
1. デプロイされたURLにアクセス
2. ログイン機能が正常に動作するか確認
3. データベース接続が正常か確認

### 7.2 ログの確認
1. **Functions** タブでAPIエンドポイントのログ
2. **Deployments** タブでビルドログ
3. エラーが発生している場合は詳細を確認

## 8. 継続的デプロイメント

### 8.1 自動デプロイの設定
1. **Git Integration** で自動デプロイを有効化
2. **Branch Protection** を設定
3. **Preview Deployments** を有効化

### 8.2 環境別の設定
- **Production**: 本番環境用の設定
- **Preview**: プレビュー環境用の設定
- **Development**: 開発環境用の設定

## 次のステップ

環境変数の設定が完了したら、[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)を参照してデプロイを実行してください。 