@echo off
chcp 65001 >nul
title Barbearia do Carneiro — site
cd /d "%~dp0"

echo.
echo   BARBEARIA DO CARNEIRO
echo   ---------------------
echo   Abrindo o site em http://localhost:4173
echo.
echo   Deixe esta janela aberta enquanto estiver usando o site.
echo   Para encerrar, feche esta janela.
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [ERRO] O Node.js nao foi encontrado neste computador.
  echo   Instale em https://nodejs.org e tente de novo.
  echo.
  pause
  exit /b 1
)

start "" http://localhost:4173
node servidor.js

pause
