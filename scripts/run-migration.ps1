# SQLiteからSupabaseへの移行スクリプト実行
# PowerShell用

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SQLiteからSupabaseへの移行スクリプト実行" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# スクリプトのディレクトリに移動
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptDir "..")
Write-Host "現在のディレクトリ: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# 依存関係の確認
Write-Host "依存関係を確認中..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "node_modulesが見つかりません。npm installを実行します..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm installに失敗しました。" -ForegroundColor Red
        Read-Host "Enterキーを押して終了"
        exit 1
    }
}

Write-Host ""
Write-Host "移行スクリプトを実行中..." -ForegroundColor Yellow
node scripts/migrate-to-supabase.js

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "スクリプトの実行に失敗しました。" -ForegroundColor Red
    Read-Host "Enterキーを押して終了"
    exit 1
}

Write-Host ""
Write-Host "完了しました！" -ForegroundColor Green
Read-Host "Enterキーを押して終了" 