# pengcode

Gera G-code de desenho a caneta a partir de imagens, para impressoras 3D com
uma caneta presa ao carro do extrusor. Vem com perfil pronto para a **Bambu Lab
A1** e uma interface web com viewport de pré-visualização.

```
imagem → vetorização → milímetros de papel → otimização → G-code
                              ↓
                     preview na viewport
```

---

## ⚠ Antes de rodar o primeiro arquivo

Cinco coisas que evitam estragar máquina, caneta ou papel:

1. **A ponta da caneta, recolhida, precisa ficar ACIMA da ponta do bico.**
   O `G28` leva o bico até a mesa. Se a caneta estiver mais baixa, ela é
   esmagada — e pode danificar a mesa junto. Use um apoio rígido e plano sobre
   a mesa para o papel, de modo que o Z de desenho fique numa faixa positiva.

2. **Use suporte com mola.** É a decisão mais importante do projeto inteiro:
   a mola absorve papel ondulado, mesa desnivelada e a compensação de mesh da
   própria impressora, e mantém a pressão constante. Sem ela, seria necessário
   sondar a mesa e corrigir o plano em todo movimento.

3. **Prenda o papel nas quatro bordas.** A A1 move a *mesa* no eixo Y; papel
   solto escorrega e borra o desenho. É também por isso que a aceleração
   padrão do perfil é baixa (1500 mm/s²).

4. **Desligue detecção de primeira camada por IA, detecção de spaghetti e
   timelapse.** Sem filamento saindo, o monitoramento pode pausar o trabalho.

5. **Nenhum aquecedor é ligado e nenhum comando `E` é gerado**, nunca. O
   emissor garante isso, e há teste cobrindo.

---

## Instalação

**Jeito fácil — duplo-clique.** Baixe o projeto, descompacte e:

| sistema | arquivo |
|---|---|
| Windows | `instalar.bat` |
| macOS | `instalar.command` |
| Linux | `bash instalar.command` |

O script acha o Python, monta um ambiente isolado, instala tudo e abre a
interface no navegador. Da segunda vez em diante ele pula direto para abrir.
Use o mesmo arquivo sempre que quiser usar o programa.

Se o script disser que não achou Python, instale em
[python.org/downloads](https://python.org/downloads) — no Windows, marque
**"Add Python to PATH"** na primeira tela — e rode de novo.

**Na mão**, se preferir:

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e ".[web,dev]"
pengcode web
```

## Comece pela calibração

Não pule esta parte — ela economiza horas de tentativa e erro.

```bash
pengcode info                       # confere a geometria efetiva do seu perfil
pengcode calibrate frame            # 1. onde prender a folha
pengcode calibrate cross            # 2. mede o offset da caneta
pengcode calibrate zladder          # 3. acha a altura de contato
pengcode calibrate speed            # 4. acha velocidade e aceleração seguras
```

| padrão | o que faz | o que você extrai |
|---|---|---|
| `frame` | contorno da área desenhável | onde prender a folha |
| `cross` | cruzes em coordenadas conhecidas | `novo_offset = atual + (medido − pretendido)` |
| `zladder` | o mesmo traço em vários Z, rotulados | o menor Z que marca uniforme = seu `z.down` |
| `speed` | grade velocidade × aceleração | a célula mais rápida que ainda sai limpa |

Com suporte de mola, escolha um ou dois degraus **abaixo** do primeiro Z que
marca: essa folga é o que absorve as imperfeições.

## Gerando um desenho

```bash
# linha de comando
pengcode plot foto.jpg --mode hatch --paper A5 -o saida.gcode --preview

# interface com viewport (recomendado para explorar)
pengcode web
```

Na interface: solte a imagem, escolha o modo, mexa nos controles e o traçado se
redesenha na hora. Vermelho tracejado = deslocamento com a caneta no ar.
O botão **Animar** mostra a ordem em que a máquina vai desenhar.

## Modos de vetorização

| modo | técnica | bom para |
|---|---|---|
| `edges` | Canny (limiares por quantil) → esqueleto → traçado | line art, logos, desenhos com contorno |
| `centerline` | binarização → eixo médio | assinaturas, caligrafia, tinta |
| `contours` | isolinhas de luminância (marching squares) | pôster gráfico ou retrato topográfico |
| `hatch` | linhas paralelas por faixa de tom, cruzando no escuro | tons contínuos, sombreado |
| `spiral` | espiral de Arquimedes modulada pelo tom | retratos; quase sem levantar a caneta |
| `stipple` | Voronoi ponderado + TSP | o clássico "retrato de uma linha só" |
| `svg` | leitura direta de `path`, formas, arcos e grupos | quando o vetor já existe |

**Espaçamento, passo da espiral e tamanho do ponto são em milímetros de
papel**, não em pixels da imagem. Você pensa na largura da caneta ("0,8 mm
entre linhas") e o resultado não muda ao trocar a resolução da imagem.

## Como funciona

```
pengcode/
  core/
    paths.py        Path e Drawing — a geometria, sempre com Y para cima
    raster.py       carregamento e pré-processamento da imagem
    vectorize/      um módulo por modo; trace.py é o traçador de esqueleto
    optimize.py     simplificação, emenda de pontas e reordenação (2-opt)
    transform.py    encaixe na folha, rotação, recorte
    text.py         fonte de traço único, para rotular as calibrações
  gcode/emitter.py  emissão, com o limite de curso como última linha de defesa
  machine/          perfis em YAML e a geometria derivada deles
  pipeline.py       orquestra os estágios
  calibrate.py      os quatro padrões
  preview.py        renderização em SVG
  web/              API e interface
```

A **ordem dos estágios importa**: vetoriza-se em pixels, encaixa-se na folha
(daí em diante tudo é milímetro, e as tolerâncias passam a ter significado
físico), recorta-se o que a caneta não alcança, e só então se otimiza — assim
a reordenação trabalha sobre a geometria final.

O ganho real de tempo está na otimização, não na emissão do G-code. Num teste
com 1500 traços espalhados, a reordenação por vizinho-mais-próximo com refino
2-opt levou o percurso no ar de 156 m para 5,4 m em 0,8 s.

## Área útil: o offset custa papel

A caneta vive deslocada do bico, então a área alcançável é a mesa **menos** o
offset. Com os 35 mm do perfil padrão sobram 221 mm em Y — e por isso **A4 não
cabe numa A1 com caneta**; o padrão é A5. `pengcode info` mostra a conta, e
`Profile.check()` avisa quando a folha passa do alcance.

## Levando o arquivo para a impressora

As impressoras Bambu esperam `.3mf` / `.gcode.3mf`, não `.gcode` cru. Dois
caminhos, ambos a validar com um arquivo trivial antes de confiar:

- empacotar o `.gcode` num `.gcode.3mf` (zip com `Metadata/plate_1.gcode`,
  o md5 correspondente e os metadados de placa);
- modo LAN + upload por FTPS/MQTT.

Ainda não implementado aqui — é o próximo passo do roadmap.

## Configuração

O perfil fica em `pengcode/machine/profiles/bambu_a1.yaml`, todo comentado.
Copie e ajuste para o seu setup, e use com `--profile caminho/do/seu.yaml`.
Os campos que você mais vai mexer são `pen_offset`, `z.down` e `accel`.

## Testes

```bash
pytest            # 124 testes
```

## Roadmap

- [ ] Empacotamento `.gcode.3mf` e envio pela rede
- [ ] Multi-caneta: separar por cor e pausar para troca
- [ ] Ligação serpentina da hachura (menos levantadas ainda)
- [ ] Ajuste de plano por sondagem em 3 pontos, para quem não usar mola
