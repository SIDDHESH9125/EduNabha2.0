@echo off
echo Starting Enhanced EduNabha Backend Server...
echo ============================================
echo.
echo Enhanced endpoints available:
echo   - GET  /api/study/dashboard
echo   - GET  /api/study/recommendations  
echo   - GET  /api/videos/offline/enhanced
echo   - GET  /api/storage/enhanced
echo   - POST /api/videos/:id/progress/enhanced
echo   - GET  /api/videos/search
echo   - GET  /api/study/export
echo.
echo Backend will run on: http://localhost:3001
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0server"
npm run dev