# MCP自動デプロイガイド

このガイドでは、CursorのMCP（Model Context Protocol）を使用してSupabaseとVercelの設定を自動化する方法を説明します。

## 🚀 MCPで自動化できる機能

### 1. **Supabaseプロジェクトの自動作成**
- プロジェクトの作成
- データベースの初期化
- APIキーの生成
- マイグレーションの実行

### 2. **Vercelプロジェクトの自動作成**
- プロジェクトの作成
- 環境変数の設定
- GitHubリポジトリの連携
- 自動デプロイの設定

### 3. **Notionドキュメントの自動作成**
- 設定情報の記録
- デプロイ履歴の管理
- トラブルシューティングガイドの生成

## 📋 前提条件

### 必要なMCPツール
- **Supabase MCP** - データベース管理
- **Vercel MCP** - デプロイメント管理
- **Notion MCP** - ドキュメント管理

### 必要な認証情報
- Supabase API トークン
- Vercel API トークン
- Notion API トークン
- GitHub Personal Access Token

## 🔧 セットアップ手順

### 1. MCPクライアントのインストール

```bash
# MCPクライアントライブラリをインストール
npm install @modelcontextprotocol/sdk
npm install @modelcontextprotocol/server-supabase
npm install @modelcontextprotocol/server-vercel
npm install @modelcontextprotocol/server-notion
```

### 2. 環境変数の設定

```bash
# .env.localファイルに追加
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
VERCEL_TOKEN=your_vercel_token
NOTION_TOKEN=your_notion_integration_token
GITHUB_TOKEN=your_github_personal_access_token
```

### 3. MCPサーバーの設定

```javascript
// mcp-config.json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "your_token"
      }
    },
    "vercel": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-vercel"],
      "env": {
        "VERCEL_TOKEN": "your_token"
      }
    },
    "notion": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-notion"],
      "env": {
        "NOTION_TOKEN": "your_token"
      }
    }
  }
}
```

## 🚀 自動デプロイの実行

### 1. 基本的な自動デプロイ

```bash
# MCP自動デプロイスクリプトを実行
npm run deploy:mcp
```

### 2. カスタム設定での自動デプロイ

```javascript
// scripts/custom-deploy.js
const MCPAutoDeploy = require('./auto-deploy-mcp');

const deployer = new MCPAutoDeploy();
deployer.config = {
  projectName: 'my-custom-app',
  region: 'us-west-1',
  framework: 'nextjs'
};

deployer.run();
```

## 📊 自動化される処理の詳細

### 1. Supabaseプロジェクト作成

```javascript
// MCP Supabase API呼び出し
const project = await mcp_supabase_create_project({
  name: "ai-web-app",
  region: "ap-northeast-1",
  databasePassword: "secure-password"
});

// 返される情報
{
  projectRef: "abc123def456",
  url: "https://abc123def456.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  databaseUrl: "postgresql://postgres:password@db.abc123def456.supabase.co:5432/postgres"
}
```

### 2. データベースマイグレーション

```javascript
// マイグレーションスクリプトの実行
await mcp_supabase_execute_sql({
  projectRef: project.projectRef,
  sql: migrationScript
});
```

### 3. Vercelプロジェクト作成

```javascript
// MCP Vercel API呼び出し
const vercelProject = await mcp_vercel_create_project({
  name: "ai-web-app",
  framework: "nextjs",
  gitRepository: "github:username/repo",
  environmentVariables: {
    DATABASE_URL: project.databaseUrl,
    NEXT_PUBLIC_SUPABASE_URL: project.url,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: project.anonKey,
    SUPABASE_SERVICE_ROLE_KEY: project.serviceRoleKey
  }
});
```

### 4. Notionドキュメント作成

```javascript
// MCP Notion API呼び出し
await mcp_notion_create_pages({
  parent: { page_id: "notion-page-id" },
  pages: [{
    properties: {
      title: "AI Web App デプロイ設定"
    },
    content: `
# デプロイ設定情報

## Supabase設定
- Project URL: ${project.url}
- Database URL: ${project.databaseUrl}

## Vercel設定
- App URL: ${vercelProject.url}
- Framework: ${vercelProject.framework}
    `
  }]
});
```

## 🔍 接続テスト

### 自動テストの実行

```javascript
// 接続テストAPIの呼び出し
const testResult = await fetch(`${vercelProject.url}/api/test-connection`);
const result = await testResult.json();

if (result.success) {
  console.log('✅ すべての接続が正常です');
  console.log('📊 接続情報:', result);
} else {
  console.error('❌ 接続エラー:', result.error);
}
```

## 🛠️ トラブルシューティング

### よくある問題と解決策

#### 1. MCPサーバー接続エラー

```bash
# エラー: MCP server connection failed
# 解決策: トークンの確認とMCPサーバーの再起動
npm run mcp:restart
```

#### 2. Supabaseプロジェクト作成エラー

```bash
# エラー: Project creation failed
# 解決策: リージョンの変更またはプロジェクト名の変更
```

#### 3. Vercelデプロイエラー

```bash
# エラー: Build failed
# 解決策: 環境変数の確認とビルドログの確認
```

### デバッグ方法

```bash
# 詳細ログの有効化
DEBUG=mcp:* npm run deploy:mcp

# 特定のMCPサーバーのログ
DEBUG=mcp:supabase npm run deploy:mcp
```

## 📈 監視とメンテナンス

### 1. 自動監視の設定

```javascript
// 定期的な接続テスト
setInterval(async () => {
  const result = await testConnection();
  if (!result.success) {
    // アラートの送信
    await sendAlert(result.error);
  }
}, 300000); // 5分ごと
```

### 2. ログの管理

```javascript
// ログの自動保存
const logEntry = {
  timestamp: new Date().toISOString(),
  action: 'deploy',
  status: 'success',
  details: { supabase: supabaseConfig, vercel: vercelConfig }
};

await saveLog(logEntry);
```

## 🔐 セキュリティ考慮事項

### 1. トークンの管理

- 環境変数での安全な保存
- 定期的なトークンの更新
- 最小権限の原則

### 2. アクセス制御

- IP制限の設定
- 多要素認証の有効化
- 監査ログの有効化

## 📚 参考資料

- [MCP公式ドキュメント](https://modelcontextprotocol.io/)
- [Supabase MCP Server](https://github.com/modelcontextprotocol/server-supabase)
- [Vercel MCP Server](https://github.com/modelcontextprotocol/server-vercel)
- [Notion MCP Server](https://github.com/modelcontextprotocol/server-notion)

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. MCPサーバーのログ
2. 認証トークンの有効性
3. ネットワーク接続
4. API制限の確認

または、プロジェクトのIssuesページで問題を報告してください。 