@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"
title Marga Beauty

echo.
echo   ===============================================
echo     Marga Beauty - site
echo   ===============================================
echo.

REM --- precisa do Node.js 20 ou mais novo
node -e "process.exit(+process.versions.node.split('.')[0] >= 20 ? 0 : 1)" >nul 2>&1
if errorlevel 1 (
  echo   [X] Nao achei o Node.js 20 ou mais novo.
  echo.
  echo   1. Baixe a versao LTS em  https://nodejs.org
  echo   2. Instale e rode este arquivo de novo
  echo.
  pause
  exit /b 1
)

REM --- instala so na primeira vez
if not exist "node_modules\next" (
  echo   instalando dependencias...
  echo   ^(um ou dois minutos, acontece so na primeira vez^)
  echo.
  call npm install --no-audit --no-fund
  if errorlevel 1 goto erro
)

echo.
echo   preparando o site...
call npm run build
if errorlevel 1 goto erro

echo.
echo   pronto. abrindo em http://localhost:3000 ...
echo   deixe esta janela aberta enquanto usar. para parar, feche-a.
echo.
start "" cmd /c "timeout /t 4 >nul & start http://localhost:3000"
call npm start
goto fim

:erro
echo.
echo   [X] Algo falhou acima. Copie a mensagem de erro inteira.
echo.
pause
exit /b 1

:fim
pause
