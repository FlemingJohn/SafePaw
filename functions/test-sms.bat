@echo off
echo.
echo ============================================
echo   SafePaw SMS Notification Test
echo ============================================
echo.
echo Testing SMS notification...
echo NOTE: For Twilio trial, phone number must be verified
echo.
set /p PHONE="Enter phone number (e.g., +919876543210): "
echo.
node testNotifications.js sms %PHONE%
echo.
echo ============================================
echo.
pause
