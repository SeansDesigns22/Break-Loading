@echo off
setlocal
cd /d %~dp0
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
echo Starting server...
node server.js
pause
