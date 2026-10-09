#!/usr/bin/env bash
# Abre o site da Marga Beauty no seu navegador. No macOS, duplo-clique neste arquivo.
# No Linux:  bash abrir-site.command
set -u
cd "$(dirname "$0")"

echo
echo "  ==============================================="
echo "    Marga Beauty - site"
echo "  ==============================================="
echo

falhou() {
    echo
    echo "  [X] Algo falhou acima. Copie a mensagem de erro inteira."
    echo
    read -r -p "  Aperte Enter para fechar." _
    exit 1
}

# --- precisa do Node.js 20 ou mais novo
if ! command -v node >/dev/null 2>&1 ||
   [ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0)" -lt 20 ]; then
    echo "  [X] Nao achei o Node.js 20 ou mais novo."
    echo
    echo "  1. Baixe a versao LTS em  https://nodejs.org"
    echo "  2. Instale e rode este arquivo de novo"
    echo
    read -r -p "  Aperte Enter para fechar." _
    exit 1
fi

# --- instala so na primeira vez
if [ ! -d node_modules/next ]; then
    echo "  instalando dependencias..."
    echo "  (um ou dois minutos, acontece so na primeira vez)"
    echo
    npm install --no-audit --no-fund || falhou
fi

echo
echo "  preparando o site..."
npm run build || falhou

echo
echo "  pronto. abrindo em http://localhost:3000 ..."
echo "  deixe esta janela aberta enquanto usar. para parar, aperte Ctrl+C."
echo
( sleep 4; open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 >/dev/null 2>&1 ) &
exec npm start
