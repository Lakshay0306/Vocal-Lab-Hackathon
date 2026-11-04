@echo off
title VoxAction AI - Voice to Action OS
echo ====================================================
echo  🚀 Starting VoxAction AI...
echo  🎙️ Voice In -^> AI Intent -^> Real Action -^> Voice Out
echo ====================================================
echo.

:: Open browser automatically after 1.5 seconds in background
start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:3000"

:: Start Node.js server
node server.js

pause
