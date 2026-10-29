@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist "frontend\dist\index.html" (
  call npm.cmd run build
  if errorlevel 1 goto hata
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start.ps1"
if errorlevel 1 goto hata
exit /b 0
:hata
echo Baslatilamadi. Yukaridaki hata mesajini kontrol edin.
pause
