$ErrorActionPreference = "Stop"
Write-Host "Repairing Startup Muslim Directory installation without deleting database data..." -ForegroundColor Cyan

if (-not (Test-Path ".\package.json")) {
  throw "Open PowerShell in the project folder containing package.json."
}

. ".\scripts\local-env.ps1"
Assert-CompatibleNode
Initialize-LocalEnv

Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force ".\node_modules" -ErrorAction SilentlyContinue
npm cache verify
npm ci --include=dev --legacy-peer-deps
if ($LASTEXITCODE -ne 0) { throw "npm dependency repair failed." }

Write-Host "Verifying database schema definitions..." -ForegroundColor Yellow
npm run db:verify-schema
if ($LASTEXITCODE -ne 0) { throw "Database schema verification failed." }

Write-Host "Applying any missing database tables without resetting data..." -ForegroundColor Yellow
$env:DB_CREATE_DATABASE = "false"
npm run db:schema
if ($LASTEXITCODE -ne 0) { throw "Database schema repair failed." }

npm run dev
