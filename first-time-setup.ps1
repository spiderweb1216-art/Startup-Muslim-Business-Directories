$ErrorActionPreference = "Stop"
Write-Host "Startup Muslim Directory - local MySQL first-time setup" -ForegroundColor Cyan

if (-not (Test-Path ".\package.json")) {
  throw "Open PowerShell in the project folder containing package.json."
}

. ".\scripts\local-env.ps1"
Assert-CompatibleNode
Initialize-LocalEnv

Write-Host "Installing exact Node dependencies..." -ForegroundColor Yellow
npm ci --include=dev --legacy-peer-deps
if ($LASTEXITCODE -ne 0) { throw "npm dependency installation failed." }

Write-Host "Verifying that the application write fields match the database schema..." -ForegroundColor Yellow
npm run db:verify-schema
if ($LASTEXITCODE -ne 0) { throw "Database schema verification failed." }

Write-Host "Recreating and populating the LOCAL MySQL database..." -ForegroundColor Yellow
Write-Host "This first-time command replaces only the local database configured in .env." -ForegroundColor DarkYellow
Write-Host "MySQL must already be running in XAMPP or as a Windows service." -ForegroundColor DarkYellow
npm run db:setup:local
if ($LASTEXITCODE -ne 0) { throw "Local database setup failed." }

Write-Host "Starting the Express API and React development website..." -ForegroundColor Green
npm run dev
