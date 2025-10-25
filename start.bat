@echo off
echo ========================================
echo    SORIKAMA HUB - Demarrage
echo ========================================
echo.

REM Verifier si MongoDB est installe
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] MongoDB n'est pas installe ou pas dans le PATH
    echo.
    echo Installez MongoDB depuis: https://www.mongodb.com/try/download/community
    pause
    exit /b 1
)

REM Creer le dossier data si necessaire
if not exist "data\db" (
    echo [INFO] Creation du dossier data\db...
    mkdir data\db
)

echo [1/3] Demarrage de MongoDB...
start "MongoDB - Sorikama" mongod --dbpath data\db
timeout /t 3 /nobreak >nul

echo [2/3] Demarrage du Backend...
start "Backend - Sorikama" cmd /k "cd backend && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/3] Demarrage du Frontend...
start "Frontend - Sorikama" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    Tous les services demarres !
echo ========================================
echo.
echo MongoDB:  http://localhost:27017
echo Backend:  http://localhost:7000
echo Frontend: http://localhost:5173
echo.
echo Connexion: admin@admin.fr / Admin@123
echo.
pause
