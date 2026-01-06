@echo off
echo.
echo ============================================
echo   SafePaw Slack Notification Test
echo ============================================
echo.
echo Testing SLACK notification...
echo NOTE: Ensure SLACK_WEBHOOK_URL is set in .env
echo.
node testNotifications.js slack system
echo.
echo ============================================
echo.
pause
