#!/usr/bin/env bash
# Instala e abre o pengcode. No macOS, duplo-clique neste arquivo.
# No Linux:  bash instalar.command
set -u
cd "$(dirname "$0")"

echo
echo "  ==============================================="
echo "    pengcode - desenho a caneta"
echo "  ==============================================="
echo

falhou() {
    echo
    echo "  [X] Algo falhou acima. Copie a mensagem de erro inteira."
    echo
    read -r -p "  Aperte Enter para fechar." _
    exit 1
}

# --- procura um Python 3.10 ou mais novo
PY=""
for cmd in python3.13 python3.12 python3.11 python3.10 python3 python; do
    if command -v "$cmd" >/dev/null 2>&1 &&
       "$cmd" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3,10) else 1)' 2>/dev/null; then
        PY="$cmd"
        break
    fi
done

if [ -z "$PY" ]; then
    echo "  [X] Nao achei Python 3.10 ou mais novo."
    echo
    echo "  macOS:  brew install python   (ou baixe em https://python.org/downloads)"
    echo "  Linux:  sudo apt install python3 python3-venv"
    echo
    read -r -p "  Aperte Enter para fechar." _
    exit 1
fi

# --- ambiente isolado, para nao mexer no Python do sistema
if [ ! -x ".venv/bin/python" ]; then
    echo "  criando ambiente..."
    "$PY" -m venv .venv || falhou
fi

# --- instala so na primeira vez.
# O teste roda a partir de "/" de proposito: aqui na pasta do projeto existe um
# diretorio chamado "pengcode", que o Python importaria mesmo sem nada instalado
# e faria o instalador pular a instalacao.
ROOT="$(pwd)"
if ! (cd / && "$ROOT/.venv/bin/python" -c "import pengcode, numpy, fastapi") >/dev/null 2>&1; then
    echo "  instalando dependencias..."
    echo "  (um ou dois minutos, acontece so na primeira vez)"
    echo
    .venv/bin/python -m pip install --upgrade pip >/dev/null 2>&1
    .venv/bin/python -m pip install -e ".[web]" || falhou
fi

echo
echo "  pronto. abrindo no navegador..."
echo "  deixe esta janela aberta enquanto usar. para parar, aperte Ctrl+C."
echo
exec .venv/bin/python -m pengcode.cli web
