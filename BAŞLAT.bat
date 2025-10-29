@echo off
echo ================================================
echo   ILAC HATIRLATICI - EMINE HANIM ICIN
echo ================================================
echo.
echo [*] Uygulama baslatiliyor...
echo.
echo ADIMLAR:
echo 1. QR kodu cikacak
echo 2. Telefon ile QR kodu okutun
echo 3. Expo Go otomatik acilacak
echo.
echo NOT: Telefon ve bilgisayar ayni WiFi aginda olmali!
echo.
echo ================================================
echo.

cd /d "%~dp0"
call npx expo start

pause
