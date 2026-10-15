@echo off
title Kat's Lesson Plan Generator - La Consolacion College-Pasig
color 0A

echo =====================================================================
echo           KAT'S LESSON PLAN GENERATOR (LCCP EDITION)
echo           La Consolacion College - Pasig  S.Y. 2026-2027
echo =====================================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found. Please install Node.js from https://nodejs.org
    pause
    exit /b
)

if not exist "node_modules" (
    echo [INFO] First time setup: Installing required packages...
    call npm.cmd install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b
    )
)

echo [INFO] Starting web application on http://localhost:3000 ...
echo [INFO] Your browser will open automatically in 3 seconds.
echo.

start "" http://localhost:3000
call npm.cmd run dev

pause
