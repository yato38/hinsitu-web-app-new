# データベースバックアップガイド

## 概要
このプロジェクトでは、デプロイ時のデータ損失を防ぐために、データベースの自動バックアップ機能を実装しています。

## 利用可能なコマンド

### 1. 手動バックアップ
```bash
npm run db:backup
```
- 現在のデータベースを `backups/` ディレクトリにタイムスタンプ付きで保存
- 30日以上古いバックアップファイルは自動削除

### 2. データベース復元
```bash
npm run db:restore <バックアップファイル名>
```
例：
```bash
npm run db:restore backup_2024-01-15_14-30-00.db
```

### 3. 安全なマイグレーション
```bash
npm run db:migrate:safe
```
- マイグレーション前に自動でバックアップを作成
- マイグレーション失敗時は復元方法を提示

### 4. 通常のマイグレーション
```bash
npm run db:migrate
```

### 5. データベースリセット
```bash
npm run db:reset
```

### 6. 管理者ユーザー作成
```bash
npm run db:create-admin
```

### 7. 任意のユーザー作成
```bash
npm run db:create-user <ユーザーID> <名前> <パスワード> [権限]
```
例：
```bash
npm run db:create-user USER002 "田中太郎" password123 ADMIN
```

### 8. ユーザー一覧表示
```bash
npm run db:list-users
```

## デプロイ時のワークフロー

### 推奨手順
1. **デプロイ前のバックアップ**
   ```bash
   npm run db:backup
   ```

2. **安全なマイグレーション実行**
   ```bash
   npm run db:migrate:safe
   ```

3. **デプロイ実行**

4. **問題が発生した場合の復元**
   ```bash
   npm run db:restore <最新のバックアップファイル名>
   ```

## バックアップファイルの管理

- バックアップファイルは `backups/` ディレクトリに保存
- ファイル名形式: `backup_YYYY-MM-DD_HH-MM-SS.db`
- 30日以上古いファイルは自動削除
- `.gitignore` でバックアップディレクトリは除外

## トラブルシューティング

### マイグレーション失敗時
1. エラーメッセージを確認
2. 最新のバックアップファイルを確認
3. 必要に応じて復元を実行

### 復元時の注意点
- 復元前に現在のデータベースが自動でバックアップされる
- 復元後は必要に応じてシードデータを再適用

## ファイル構造
```
ai-web-app/
├── scripts/
│   ├── backup-db.js      # バックアップスクリプト
│   ├── restore-db.js     # 復元スクリプト
│   ├── safe-migrate.js   # 安全なマイグレーションスクリプト
│   ├── create-admin.js   # 管理者ユーザー作成スクリプト
│   ├── create-user.js    # 任意ユーザー作成スクリプト
│   └── list-users.js     # ユーザー一覧表示スクリプト
├── backups/              # バックアップファイル保存ディレクトリ
└── prisma/
    └── dev.db           # 現在のデータベースファイル
```

## 緊急時の復旧手順

### ユーザーデータが消失した場合
1. **管理者ユーザーの作成**
   ```bash
   npm run db:create-admin
   ```

2. **ログイン情報**
   - ユーザーID: `ADMIN001`
   - パスワード: `admin123`
   - 権限: `SUPER_ADMIN`

3. **追加ユーザーの作成**
   ```bash
   npm run db:create-user <ユーザーID> <名前> <パスワード> [権限]
   ```

4. **ユーザー一覧の確認**
   ```bash
   npm run db:list-users
   ``` 