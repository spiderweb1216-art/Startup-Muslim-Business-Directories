$ErrorActionPreference = "Stop"
if (-not (Test-Path ".\node_modules")) {
  Write-Host "Dependencies are missing. Running npm install..." -ForegroundColor Yellow
  npm install --include=dev --legacy-peer-deps
}
Write-Host "Checking MySQL database..." -ForegroundColor Yellow
npm run db:check
Write-Host "Starting API and React website..." -ForegroundColor Green
npm start
