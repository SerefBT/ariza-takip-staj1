@echo off
chcp 65001 >nul
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0Uygulama\CDLauncher\Durdur.ps1"
if errorlevel 1 (echo Islem tamamlanamadi. Lutfen ekrandaki aciklamayi okuyun. & pause)
