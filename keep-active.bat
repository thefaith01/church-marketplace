@echo off
REM Keep Vercel project active by pushing a commit

echo Updating project activity...
echo. >> README.md
echo Last updated: %date% %time% >> README.md

git add .
git commit -m "chore: keep project active - %date%"
git push

echo.
echo Done! Project activity updated.
pause
