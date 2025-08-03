@echo off
echo ========================================
echo SQLiteからSupabaseへの移行スクリプト実行
echo ========================================
echo.

cd /d "%~dp0.."
echo 現在のディレクトリ: %CD%
echo.

echo 依存関係を確認中...
if not exist "node_modules" (
    echo node_modulesが見つかりません。npm installを実行します...
    npm install
    if errorlevel 1 (
        echo npm installに失敗しました。
        pause
        exit /b 1
    )
)

echo.
echo 移行スクリプトを実行中...
node scripts/migrate-to-supabase.js

if errorlevel 1 (
    echo.
    echo スクリプトの実行に失敗しました。
    pause
    exit /b 1
)

echo.
echo 完了しました！
pause 