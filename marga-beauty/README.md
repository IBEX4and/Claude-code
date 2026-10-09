# Marga Beauty — site

Site de uma página para a Marga Beauty (estética avançada, drenagem linfática
brasileira Método Renata França e podologia, na Itália), com agendamento online
ligado ao Google Agenda.

O texto está em português por enquanto. A troca para italiano é feita num único
arquivo (veja [Traduzir para italiano](#traduzir-para-italiano)).

## Rodar no computador

```bash
cd marga-beauty
npm install
npm run dev        # http://localhost:3000
```

Outros comandos:

| Comando             | O que faz                                        |
| ------------------- | ------------------------------------------------ |
| `npm run build`     | Gera a versão de produção                        |
| `npm start`         | Roda a versão de produção                        |
| `npm test`          | Testa o cálculo de horários livres               |
| `npm run typecheck` | Confere os tipos do TypeScript                   |

Sem as variáveis do Google, o agendamento funciona em **modo demonstração**:
alguns horários aparecem ocupados de propósito, os agendamentos ficam só na
memória do servidor e o site avisa isso embaixo do calendário.

## Onde editar cada coisa

| O quê                                   | Arquivo                       |
| --------------------------------------- | ----------------------------- |
| Todos os textos, serviços e durações    | `src/content/pt.ts`           |
| Endereço, WhatsApp, e-mail, P. IVA      | `src/config/business.ts`      |
| Horário de funcionamento e regras da agenda | `src/config/business.ts` (`bookingRules`) |
| Fotos                                   | `src/content/images.ts` + `public/images/` |
| Cores e tipografia                      | `src/app/globals.css` (topo do arquivo) |

### Regras da agenda (`bookingRules`)

- `weeklyHours`: janelas de atendimento por dia da semana. O espaço entre duas
  janelas é a pausa (almoço). Hoje: seg–sex 9h–13h e 14h–19h, sáb 9h–14h.
- `slotStepMinutes`: de quanto em quanto tempo um horário pode começar (30 min).
- `bufferMinutes`: folga antes e depois de cada compromisso (15 min).
- `minNoticeMinutes`: antecedência mínima para agendar online (3 h).
- `maxDaysAhead`: até quantos dias à frente a agenda abre (60).
- `closeOnItalianHolidays`: fecha sozinho nos feriados nacionais italianos,
  incluindo Páscoa e Pasquetta.
- `closedDates`: férias e o dia do padroeiro da cidade (`"2026-12-24"`, …).

Cada serviço tem a sua duração em `src/content/pt.ts`. O sistema só oferece um
horário se o serviço inteiro couber antes da pausa ou do fechamento.

### Fotos

A foto do hero (`public/images/marga-hero.webp` e `.png`) já é a da Marga, recortada
com fundo transparente. As outras ainda são provisórias (`public/images/placeholder/`):
coloque as fotos reais em `public/images/` e troque os caminhos em
`src/content/images.ts`. Para o hero, uma versão da mesma foto em resolução maior
(1500 px de largura ou mais) deixa a imagem mais nítida em telas grandes.

## Como o agendamento funciona

1. A cliente escolhe o tratamento.
2. O site pergunta à API (`/api/availability`) os horários livres do mês. A API lê
   no Google Agenda da Marga o que está ocupado (consulta *free/busy*) e cruza com
   o horário de funcionamento, a duração do serviço, a folga entre clientes, a
   antecedência mínima e os feriados.
3. O primeiro dia com vaga já vem selecionado; dias sem vaga ficam apagados.
4. Ao confirmar (`/api/book`), a API consulta a agenda **de novo**. Se alguém
   reservou o mesmo horário nesse meio-tempo, a cliente vê um aviso e escolhe
   outro. Se estiver livre, o evento é criado na agenda da Marga com nome,
   telefone, e-mail e observações.
5. A cliente recebe a confirmação na tela, com botões para salvar no Google
   Agenda dela, baixar um `.ics` ou mandar mensagem no WhatsApp (o botão de
   WhatsApp aparece quando o número estiver preenchido em `business.ts`).

Qualquer compromisso que a Marga marcar na agenda dela (por telefone, Instagram,
pessoal) bloqueia o horário no site automaticamente.

> Eventos de dia inteiro no Google Agenda vêm como "Disponível" por padrão e
> **não** bloqueiam o dia. Para fechar um dia pela agenda, marque o evento como
> "Ocupado" — ou adicione a data em `closedDates`.

## Google Agenda

1. No [Google Cloud Console](https://console.cloud.google.com/), crie um projeto
   e ative a **Google Calendar API**.
2. Em *IAM e administrador → Contas de serviço*, crie uma conta de serviço. Em
   *Chaves → Adicionar chave → JSON*, baixe o arquivo.
3. No Google Agenda da Marga, abra *Configurações da agenda → Compartilhar com
   pessoas específicas* e adicione o e-mail da conta de serviço com a permissão
   **Fazer alterações nos eventos**.
4. Na mesma tela, em *Integrar agenda*, copie o **ID da agenda**.
5. Cadastre as variáveis (veja `.env.example`):
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: campo `client_email` do JSON
   - `GOOGLE_PRIVATE_KEY`: campo `private_key` do JSON
   - `GOOGLE_CALENDAR_ID`: o ID copiado no passo 4
   - `GOOGLE_EXTRA_BUSY_CALENDAR_IDS` (opcional): outras agendas que também
     devem bloquear horários, compartilhadas do mesmo jeito.

Com as variáveis preenchidas, o aviso de "modo demonstração" some sozinho.

## Publicar e ligar o domínio da GoDaddy

1. Na [Vercel](https://vercel.com/), importe este repositório e defina
   **Root Directory** como `marga-beauty`.
2. Em *Settings → Environment Variables*, cadastre as variáveis do Google e
   `NEXT_PUBLIC_SITE_URL` com o endereço final.
3. Em *Settings → Domains*, adicione o domínio (com e sem `www`).
4. Na GoDaddy, em *DNS* do domínio, crie os registros que a Vercel mostrar
   (normalmente um registro **A** para `@` e um **CNAME** para `www`). A
   propagação leva de minutos a algumas horas.

## Traduzir para italiano

1. Copie `src/content/pt.ts` para `src/content/it.ts`.
2. Troque `export const pt = {` por `export const it: SiteContent = {` e importe o
   tipo: `import type { SiteContent } from "./pt";`.
3. Traduza só os valores (as chaves e os `id` dos serviços ficam iguais). Ajuste
   `locale: "it-IT"` e `htmlLang: "it"`: datas, dias da semana e meses passam a
   sair em italiano automaticamente.
4. Em `src/content/index.ts`, troque a linha de exportação para
   `export { it as content } from "./it";`.
5. Ajuste as âncoras do menu se quiser os endereços em italiano
   (`#servicos` → `#servizi` etc.) e renomeie a pasta `src/app/privacidade` para
   `src/app/privacy`, atualizando os links.

## Pendências com a cliente

- [ ] Endereço completo, cidade, WhatsApp, e-mail e **Partita IVA**
      (obrigatória no site de empresas na Itália) — `src/config/business.ts`
- [ ] Horários reais de atendimento e dias fechados
- [ ] Durações de cada tratamento e lista final de serviços (os de podologia
      foram montados por nós; o Instagram não detalha)
- [ ] Fotos: Marga no estúdio, tratamentos de rosto, corpo, drenagem e pés;
      foto do hero em resolução maior
- [ ] Revisão da política de privacidade por um profissional (GDPR)
- [ ] Na Itália, *podologo* é profissão de saúde regulamentada: confirmar se o
      diploma dela é reconhecido lá antes de usar "podologia" no texto em
      italiano (senão, o termo adequado é *pedicure estetico* / cuidado estético
      dos pés)
