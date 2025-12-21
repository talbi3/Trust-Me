@echo off
echo Starting Project Initialization...

:: 1. Check for .env file (Windows style)
if not exist .env (
    echo No .env file found. Creating one from .env.example...
    copy .env.example .env
) else (
    echo No .env file found. Creating one from .env.example...
)

:: 2. Install Dependencies (MUST use 'call')
echo Installing NPM Dependencies...
call npm install

:: 3. Run the Seed Script (MUST use 'call')
echo Seeding Database...
call node scripts/seed.js

echo ✅ Initialization Complete!
pause