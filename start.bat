@echo off
set "APP_ROOT=%~dp0"
echo Demarrage du Backend (FastAPI)...
start "PDF backend" cmd /k "cd /d \"%APP_ROOT%backend\" && call venv\Scripts\activate.bat && python -m uvicorn main:app --reload"

echo Demarrage du Frontend (Next.js)...
start "PDF frontend" cmd /k "cd /d \"%APP_ROOT%frontend\" && npm run dev"

echo Serveurs lances !
echo Backend : http://localhost:8000/docs
echo Frontend : http://localhost:3000
pause
