@echo off
chcp 65001 >nul 2>&1
cd /d "%~dp0"
title pengcode

echo.
echo   ===============================================
echo     pengcode - desenho a caneta
echo   ===============================================
echo.

REM --- procura o Python. "py -3" primeiro: evita o atalho falso da Microsoft Store
set "PY="
py -3 --version >nul 2>&1 && set "PY=py -3"
if not defined PY (
  python --version >nul 2>&1 && set "PY=python"
)
if not defined PY (
  echo   [X] Python nao encontrado nesta maquina.
  echo.
  echo   1. Instale em  https://python.org/downloads
  echo   2. IMPORTANTE: marque "Add Python to PATH" na primeira tela
  echo   3. Rode este arquivo de novo
  echo.
  pause
  exit /b 1
)

REM --- ambiente isolado, para nao mexer no Python do sistema
if not exist ".venv\Scripts\python.exe" (
  echo   criando ambiente...
  %PY% -m venv .venv
  if errorlevel 1 goto erro
)

REM --- instala so na primeira vez.
REM O teste roda a partir da raiz do disco de proposito: aqui na pasta do projeto
REM existe um diretorio chamado "pengcode", que o Python importaria mesmo sem nada
REM instalado e faria o instalador pular a instalacao.
pushd "%SystemDrive%\"
"%~dp0.venv\Scripts\python.exe" -c "import pengcode, numpy, fastapi" >nul 2>&1
set "JAINSTALADO=%errorlevel%"
popd
if not "%JAINSTALADO%"=="0" (
  echo   instalando dependencias...
  echo   ^(um ou dois minutos, acontece so na primeira vez^)
  echo.
  ".venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>&1
  ".venv\Scripts\python.exe" -m pip install -e ".[web]"
  if errorlevel 1 goto erro
)

echo.
echo   pronto. abrindo no navegador...
echo   deixe esta janela aberta enquanto usar. para parar, feche-a.
echo.
".venv\Scripts\python.exe" -m pengcode.cli web
goto fim

:erro
echo.
echo   [X] Algo falhou acima. Copie a mensagem de erro inteira.
echo.
pause
exit /b 1

:fim
pause
