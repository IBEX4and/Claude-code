import type { SiteContent } from "./it";

/**
 * Texto do site em português (versão secundária; o site publicado usa `it.ts`).
 * Mesmas chaves de `it.ts`. Os nomes dos tratamentos ficam em italiano, em `treatments.ts`.
 */
export const pt: SiteContent = {
  locale: "pt-BR",
  htmlLang: "pt-BR",

  meta: {
    title: "MARGA Brazilian Beauty — Cera brasileira, rosto, corpo, mãos e pés em Uboldo",
    description:
      "Centro de estética brasileira em Uboldo (VA), para mulheres e homens: depilação com cera brasileira, tratamentos de rosto, drenagem linfática, Miracle Face, manicure e pedicure. Agende online.",
  },

  header: {
    home: "MARGA Brazilian Beauty, início",
    book: "Agendar",
  },

  /** Cartazes provisórios (até chegarem as fotos de cada área). */
  visuals: {
    placeholder: "Foto provisória",
    labels: { rosto: "Rosto", corpo: "Corpo", drenagem: "Drenagem Linfática", podologia: "Mãos e pés", marga: "Marga", margaDivisa: "Marga", margaCamicia: "Marga", margaAbito: "Marga" },
  },

  hero: {
    title: "Sua Beleza em Perfeito Equilíbrio",
    asideTop: "Mulher & Homem",
    asideBottom: ["Estética", "Brasileira"],
    imageAlt: "Marga, fundadora da MARGA Brazilian Beauty, com o uniforme do espaço",
    galleryLabel: "Tratamentos da MARGA Brazilian Beauty",
  },

  treatments: {
    title: "Nossos Tratamentos",
    intro: "Escolha a área e a categoria para ver todos os serviços.",
    areasLabel: "Área",
    categoriesLabel: "Categorias",
    book: "Agendar",
    bookAria: (name: string) => `Agendar ${name}`,
  },

  why: {
    title: "Por que a MARGA Brazilian Beauty?",
    subtitle: "Competência, cuidado e sensibilidade brasileira",
    items: [
      {
        icon: "sparkles",
        title: "Cuidado sob Medida",
        text: "Cada serviço é adaptado à sua pele e às suas necessidades, com atenção aos detalhes e ao acabamento.",
      },
      {
        icon: "zap",
        title: "Tradição Brasileira",
        text: "Cera brasileira, drenagem linfática e Miracle Face do método Renata França: técnicas manuais que levam a Uboldo o melhor da estética brasileira.",
      },
      {
        icon: "heart",
        title: "Para Mulheres e Homens",
        text: "Duas áreas dedicadas, com serviços pensados para elas e para eles. Você pode consultar as duas e escolher livremente.",
      },
    ],
  },

  technologies: {
    title: ["Tecnologias", "Estéticas Avançadas"],
    text: "",
    cardAction: (title: string) => `Agendar: ${title}`,
    cards: [],
  },

  specialties: {
    title: ["Nossas", "Especialidades"],
    items: [
      { title: "Cera Brasileira", meta: "Depilação de rosto e corpo", image: "margaAbito" },
      { title: "Miracle Face", meta: "Massagem facial método Renata França", image: "margaCamicia" },
      { title: "Drenagem Linfática", meta: "Manobras drenantes para corpo e pernas", image: "margaDivisa" },
      { title: "Mãos e Pés", meta: "Manicure, pedicure e cuidado das unhas", image: "marga" },
    ],
  },

  benefits: {
    title: "Drenagem Linfática Brasileira: Sensação de Leveza Desde a Primeira Sessão.",
    words: [
      "Leveza",
      "Relaxamento",
      "Pernas leves",
      "Pele macia",
      "Bem-estar",
      "Autocuidado",
      "Equilíbrio",
      "Tempo para você",
      "Delicadeza",
      "Harmonia",
      "Pele lisa",
      "Serenidade",
    ],
  },

  steps: {
    title: "Como Funciona o Seu Atendimento",
    stepLabel: (n: number, total: number) => `Etapa ${n} de ${total}`,
    showStep: (title: string) => `Mostrar a etapa: ${title}`,
    prev: "Etapa anterior",
    next: "Próxima etapa",
    items: [
      { title: "Escolha", text: "Consulte as áreas Mulher e Homem e escolha o serviço que deseja." },
      { title: "Agende", text: "Escolha dia e horário online, ou fale com a gente no WhatsApp." },
      { title: "Seu Momento", text: "Recebemos você no espaço em Uboldo e adaptamos o serviço à sua pele." },
      { title: "Dicas", text: "No fim do atendimento, damos algumas orientações para cuidar da pele em casa." },
    ],
  },

  faq: {
    title: "Perguntas Frequentes",
    items: [
      {
        question: "Os serviços também são para homens?",
        answer:
          "Sim. O site tem duas áreas, Mulher e Homem, com as mesmas categorias: cera brasileira, rosto, corpo, mãos e pés. Você pode consultar as duas livremente.",
      },
      {
        question: "O que é o Miracle Face?",
        answer: "É a massagem facial do método Renata França, com manobras drenantes e de modelagem manual.",
      },
      {
        question: "O que é a drenagem linfática brasileira?",
        answer:
          "É uma técnica brasileira exclusiva, criada por Renata França, com manobras específicas, pressão firme e ritmo intenso.",
      },
      {
        question: "Como funciona o agendamento online?",
        answer:
          "Escolha o serviço, veja os horários livres e confirme em poucos passos. O horário entra direto na agenda da Marga.",
      },
      {
        question: "Posso remarcar ou cancelar?",
        answer: "Claro. Avise com pelo menos 24 horas de antecedência, para liberarmos o horário para outra pessoa.",
      },
    ],
  },

  footer: {
    cta: "Reserve o Seu Momento de Cuidado",
    book: "Agendar horário",
    reachOut: "Contato",
    hoursTitle: "Horários",
    closed: "Fechado",
    privacy: "Política de privacidade",
    vat: "P. IVA",
    rights: (year: number) => `Copyright © MARGA Brazilian Beauty ${year}`,
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    whatsappMessage: "Olá, Marga! Vi o site e gostaria de mais informações.",
    whatsappAria: (phone: string) => `Conversar no WhatsApp: ${phone}`,
    mapsAria: (address: string) => `Ver no Google Maps: ${address}`,
  },

  booking: {
    title: "Agende Seu Horário",
    intro: "Horários em tempo real, direto da agenda da Marga.",
    close: "Fechar agendamento",
    timezoneNote: "Horários no fuso da Itália.",
    steps: ["Tratamento", "Data e horário", "Seus dados"],
    stepsLabel: "Etapas do agendamento",
    chooseService: "Qual tratamento você quer fazer?",
    areaLabel: "Área",
    chooseDate: "Escolha o dia e o horário",
    calendarLabel: "Calendário",
    chooseTime: "Escolha o horário",
    yourDetails: "Seus dados",
    change: "Alterar",
    prevMonth: "Mês anterior",
    nextMonth: "Próximo mês",
    loading: "Consultando a agenda…",
    slotsCount: (n: number) => (n === 1 ? "1 horário livre" : `${n} horários livres`),
    noSlots: "sem horários",
    timesFor: (date: string) => `Horários de ${date}`,
    noSlotsDay: "Não há horários livres neste dia. Escolha outra data.",
    noSlotsMonth: "Não há horários livres neste mês para este tratamento. Veja o próximo mês.",
    pickDateFirst: "Escolha um dia no calendário para ver os horários.",
    morning: "Manhã",
    afternoon: "Tarde",
    fields: {
      name: "Nome e sobrenome",
      phone: "Telefone / WhatsApp",
      phoneHint: "Com o código do país, como +39 333 123 4567.",
      email: "E-mail",
      notes: "Observações (opcional)",
      notesPlaceholder: "Algo que a Marga deva saber antes do atendimento?",
      consent: "Li a política de privacidade e autorizo o uso dos meus dados para gerenciar o agendamento.",
      privacyLink: "Ler a política de privacidade",
    },
    summary: {
      service: "Tratamento",
      date: "Data",
      time: "Horário",
    },
    submit: "Confirmar agendamento",
    submitting: "Confirmando…",
    success: {
      title: "Agendamento confirmado",
      text: "Seu horário está reservado na agenda da Marga. Para remarcar ou cancelar, avise com pelo menos 24 horas de antecedência.",
      addToGoogle: "Adicionar ao Google Agenda",
      downloadIcs: "Baixar para outra agenda (.ics)",
      whatsapp: "Enviar mensagem no WhatsApp",
      whatsappMessage: (service: string, date: string, time: string, name: string) =>
        `Olá, Marga! Sou ${name} e acabei de agendar ${service} para ${date} às ${time}.`,
      again: "Fazer outro agendamento",
    },
    errors: {
      required: "Preencha este campo.",
      email: "Digite um e-mail válido, como nome@email.com.",
      phone: "Digite o telefone com o código do país, como +39 333 123 4567.",
      consent: "Para agendar, aceite a política de privacidade.",
      slotTaken: "Este horário acabou de ser reservado. Escolha outro horário.",
      loadFailed: "Não foi possível carregar a agenda. Verifique a conexão e tente de novo.",
      generic: "Não foi possível concluir o agendamento. Tente de novo ou fale com a gente pelo Instagram.",
      retry: "Tentar de novo",
    },
    demoNotice:
      "Modo demonstração: a agenda Google ainda não está conectada. Os horários ocupados são simulados e os agendamentos não são salvos.",
    eventTitle: (service: string, name: string) => `${service} — ${name}`,
    eventDetails: {
      phone: "Telefone",
      email: "E-mail",
      notes: "Observações",
      source: "Agendado pelo site",
    },
    clientEventTitle: (service: string) => `${service} na MARGA Brazilian Beauty`,
  },

  privacy: {
    title: "Política de privacidade",
    back: "Voltar ao site",
    updated: "Última atualização: outubro de 2026",
    // TODO: revisar com um profissional antes de publicar (GDPR / Garante Privacy).
    sections: [
      {
        title: "Quem trata os seus dados",
        body: [
          "O responsável pelo tratamento é MARGA Brazilian Beauty. Os dados de contato completos (razão social, endereço e Partita IVA) estão no rodapé do site.",
        ],
      },
      {
        title: "Quais dados coletamos",
        body: [
          "Ao agendar pelo site, você informa nome, telefone, e-mail, o tratamento escolhido, a data e o horário e, se quiser, observações.",
          "O site não usa cookies de publicidade nem de rastreamento.",
        ],
      },
      {
        title: "Para que usamos",
        body: [
          "Somente para registrar e gerenciar o seu agendamento e entrar em contato sobre ele (confirmação, remarcação ou cancelamento). A base legal é a execução de medidas pré-contratuais a seu pedido (art. 6.1.b do GDPR).",
        ],
      },
      {
        title: "Onde ficam guardados",
        body: [
          "O agendamento é salvo na agenda Google de MARGA Brazilian Beauty. O Google atua como fornecedor de serviço, com proteções previstas pelo GDPR.",
        ],
      },
      {
        title: "Por quanto tempo",
        body: [
          "Mantemos os dados pelo tempo necessário para o atendimento e pelas obrigações legais e fiscais aplicáveis.",
        ],
      },
      {
        title: "Seus direitos",
        body: [
          "Você pode pedir acesso, correção, exclusão ou limitação dos seus dados, além de se opor ao tratamento, escrevendo para o contato informado no rodapé. Também pode apresentar reclamação ao Garante per la protezione dei dati personali.",
        ],
      },
    ],
  },
};

