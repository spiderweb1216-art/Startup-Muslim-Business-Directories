@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
  call npm install --legacy-peer-deps
  if errorlevel 1 pause & exit /b 1
)
call npm run build
if errorlevel 1 pause & exit /b 1
echo.
echo Static production files are ready in the build folder.
pause
