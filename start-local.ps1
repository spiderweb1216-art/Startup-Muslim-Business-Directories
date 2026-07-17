$ErrorActionPreference = "Stop"
if (-not (Test-Path ".\package.json")) {
  throw "Open PowerShell in the project folder containing package.json."
}

. ".\scripts\local-env.ps1"
Assert-CompatibleNode
Initialize-LocalEnv

if (-not (Test-Path ".\node_modules")) {
  Write-Host "Dependencies are missing. Running npm ci..." -ForegroundColor Yellow
  npm ci --include=dev --legacy-peer-deps
  if ($LASTEXITCODE -ne 0) { throw "npm dependency installation failed." }
}

Write-Host "Checking MySQL database..." -ForegroundColor Yellow
npm run db:check
if ($LASTEXITCODE -ne 0) { throw "MySQL database check failed. Start MySQL and check .env." }

Write-Host "Starting the Express API and React development website..." -ForegroundColor Green
npm run dev
