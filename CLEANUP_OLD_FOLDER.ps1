# Run this script AFTER closing Cursor and any terminals running the backend.
# The old folder is locked while Python/uvicorn processes use .venv313 files.

$oldPath = Join-Path $PSScriptRoot "..\anti-gravity-voice-analyzer"
if (-not (Test-Path $oldPath)) {
    Write-Host "Old folder already removed." -ForegroundColor Green
    exit 0
}

Write-Host "Removing old folder: $oldPath" -ForegroundColor Yellow
Write-Host "Make sure you closed Cursor and any backend/uvicorn processes first." -ForegroundColor Yellow

try {
    Remove-Item -Path $oldPath -Recurse -Force
    Write-Host "Old folder deleted successfully." -ForegroundColor Green
} catch {
    Write-Host "Failed: $_" -ForegroundColor Red
    Write-Host "Try: Close Cursor, open PowerShell as Admin, run this script again." -ForegroundColor Yellow
}
