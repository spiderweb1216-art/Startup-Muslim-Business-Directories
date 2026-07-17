@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  call npm ci --include=dev --legacy-peer-deps
  if errorlevel 1 pause & exit /b 1
)
call npm run build
if errorlevel 1 pause & exit /b 1
echo.
echo Production React files are ready in the build folder.
echo Run npm start only after production environment variables and MySQL are configured.
pause
