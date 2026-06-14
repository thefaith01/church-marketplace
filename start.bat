@echo off
cd /d "%~dp0"
node_modules\.bin\next.cmd dev
timeout /t 3 /nobreak
start http://localhost:3000
pause