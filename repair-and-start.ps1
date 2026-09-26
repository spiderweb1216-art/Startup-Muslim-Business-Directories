$ErrorActionPreference = "Stop"
Write-Host "Repairing Crescent Startup Lab full-stack installation..." -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\node_modules" -ErrorAction SilentlyContinue
Remove-Item -Force ".\package-lock.json" -ErrorAction SilentlyContinue
Remove-Item -Force ".\yarn.lock" -ErrorAction SilentlyContinue
npm cache verify
npm install --include=dev --legacy-peer-deps
if (-not (Test-Path ".\.env")) { Copy-Item ".\.env.example" ".\.env" }
Write-Host "Resetting and populating MySQL..." -ForegroundColor Yellow
npm run db:setup
npm start
