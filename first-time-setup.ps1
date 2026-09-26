$ErrorActionPreference = "Stop"
Write-Host "Crescent Startup Lab - MySQL first-time setup" -ForegroundColor Cyan

if (-not (Test-Path ".\package.json")) {
  throw "Open PowerShell in the project folder containing package.json."
}
if (-not (Test-Path ".\.env")) {
  Copy-Item ".\.env.example" ".\.env"
  Write-Host "Created .env from .env.example" -ForegroundColor Green
}

Write-Host "Installing Node dependencies..." -ForegroundColor Yellow
npm install --include=dev --legacy-peer-deps

Write-Host "Creating and populating the MySQL database..." -ForegroundColor Yellow
Write-Host "MySQL must already be running in XAMPP or as a Windows service." -ForegroundColor DarkYellow
npm run db:setup

Write-Host "Starting API and website..." -ForegroundColor Green
npm start
