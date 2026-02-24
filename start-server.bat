@echo off
cd /d "%~dp0"
echo Starting local node server...
cmd.exe /c "node server.js"
pause
