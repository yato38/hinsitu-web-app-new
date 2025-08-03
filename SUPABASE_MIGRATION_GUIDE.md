# SQLiteからSupabaseへの移行ガイド

このガイドでは、SQLiteデータベースからSupabaseへの移行手順を説明します。

## 📋 前提条件

- Node.jsがインストールされている
- Supabaseアカウントがある
- プロジェクトの依存関係がインストールされている

## 🔧 移行手順

### 1. データベースの確認

まず、現在のSQLiteデータベースの内容を確認します：

```bash
# PowerShellの場合
npm run db:verify-migration

# または直接実行
node scripts/verify-migration.js
```

### 2. 移行スクリプトの生成

SQLiteからSupabaseへの移行用SQLスクリプトを生成します：

```bash
# PowerShellの場合
npm run db:generate-migration

# または直接実行
node scripts/migrate-to-supabase.js

# またはバッチファイルを使用
scripts/run-migration.bat
```

### 3. Supabaseプロジェクトの準備

1. [Supabase](https://supabase.com)にログイン
2. 新しいプロジェクトを作成
3. プロジェクトの設定から接続情報を取得

### 4. データベースの移行

1. Supabaseダッシュボードで「SQL Editor」を開く
2. 生成された`supabase-migration.sql`ファイルの内容をコピー
3. SQL Editorに貼り付けて実行

### 5. 環境変数の更新

`.env.local`ファイルを更新：

```env
# Supabaseの接続情報
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 6. Prismaスキーマの更新

`prisma/schema.prisma`ファイルでデータベースプロバイダーを更新：

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 7. データベースの再生成

```bash
npm run db:generate
npm run db:push
```

### 8. 動作確認

```bash
npm run dev
```

## ⚠️ 注意事項

- **データのバックアップ**: 移行前に必ずデータをバックアップしてください
- **既存データの削除**: 移行スクリプトは既存のテーブルを削除します
- **外部キー制約**: 必要に応じて手動で外部キー制約を追加してください

## 🔍 トラブルシューティング

### データベースファイルが見つからない

```bash
# データベースを生成
npm run db:generate
npm run db:push
```

### 移行スクリプトの実行に失敗

1. データベースファイルの存在を確認
2. 必要な依存関係がインストールされているか確認
3. 権限の問題がないか確認

### Supabaseでの実行エラー

1. SQLの構文エラーを確認
2. テーブル名やカラム名の競合を確認
3. データ型の互換性を確認

## 📁 生成されるファイル

- `supabase-migration.sql`: 移行用SQLスクリプト
- `scripts/run-migration.bat`: Windows用実行バッチファイル

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. エラーメッセージの詳細
2. データベースの状態
3. 環境変数の設定
4. Supabaseプロジェクトの設定

## 📚 参考リンク

- [Supabase公式ドキュメント](https://supabase.com/docs)
- [Prisma公式ドキュメント](https://www.prisma.io/docs)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/) 