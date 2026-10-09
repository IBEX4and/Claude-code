/**
 * Todo o texto do site em português.
 * Para lançar em italiano: copie este arquivo para `it.ts`, traduza os valores
 * (as chaves e os `id` ficam iguais) e troque a importação em `content/index.ts`.
 */

export const pt = {
  locale: "pt-BR",
  htmlLang: "pt-BR",

  meta: {
    title: "Marga Beauty — Estética avançada, drenagem linfática brasileira e podologia",
    description:
      "Tratamentos de rosto e corpo com tecnologias de última geração, drenagem linfática Método Renata França e podologia. Agende online com horários em tempo real.",
  },

  header: {
    home: "Marga Beauty, início",
    book: "Agendar",
  },

  hero: {
    title: "Sua Beleza em Perfeito Equilíbrio",
    asideTop: "Estética Avançada",
    asideBottom: ["Podologia &", "Drenagem Brasileira"],
    imageAlt: "Marga, fundadora da Marga Beauty, de blazer preto",
    galleryLabel: "Tratamentos da Marga Beauty",
  },

  /** Seção em degradê com a lista lateral e os cartões que sobem (um por área). */
  showcase: {
    title: "Nossos Tratamentos",
    book: "Agendar",
    bookAria: (name: string) => `Agendar ${name}`,
    minutes: (n: number) => `${n} min`,
  },

  services: {
    categories: [
      {
        id: "rosto",
        name: "Rosto",
        tags: ["Anti-idade", "Pele renovada"],
        summary: "Rejuvenescimento, limpeza profunda e regeneração da pele.",
        image: "rosto",
        items: [
          {
            id: "limpeza-profunda",
            name: "Limpeza de pele profunda",
            description: "Espátula ultrassônica, extração delicada e máscara calmante.",
            duration: 60,
          },
          {
            id: "anti-idade",
            name: "Tratamento anti-idade",
            description: "Radiofrequência multipolar e LED para firmeza e viço.",
            duration: 60,
          },
          {
            id: "antimanchas",
            name: "Tratamento antimanchas",
            description: "Protocolo para uniformizar o tom e devolver a luminosidade.",
            duration: 60,
          },
          {
            id: "acne",
            name: "Tratamento para acne",
            description: "Limpeza, controle da oleosidade e LED para peles acneicas.",
            duration: 60,
          },
          {
            id: "lifting",
            name: "Lifting não invasivo",
            description: "Efeito lifting sem agulhas, com tecnologia e massagem facial.",
            duration: 75,
          },
          {
            id: "oxigenoterapia",
            name: "Oxigenoterapia facial",
            description: "Oxigênio e ativos para uma pele descansada e luminosa.",
            duration: 45,
          },
        ],
      },
      {
        id: "corpo",
        name: "Corpo",
        tags: ["Remodelação", "Anticelulite"],
        summary: "Remodelação, drenagem e tonificação com tecnologia e técnicas manuais.",
        image: "corpo",
        items: [
          {
            id: "radiofrequencia-corpo",
            name: "Remodelação com radiofrequência",
            description: "Calor controlado para firmar a pele e definir o contorno.",
            duration: 60,
          },
          {
            id: "ondas-de-choque",
            name: "Ondas de choque estéticas",
            description: "Tratamento direcionado para celulite e gordura localizada.",
            duration: 45,
          },
          {
            id: "cavitacao",
            name: "Ultrassom e cavitação",
            description: "Ultrassom focado para reduzir medidas.",
            duration: 45,
          },
          {
            id: "pressoterapia",
            name: "Pressoterapia",
            description: "Compressão sequencial que ativa a circulação e reduz o inchaço.",
            duration: 45,
          },
          {
            id: "vacuum",
            name: "Vacuum endomassagem",
            description: "Sucção e rolos para drenar, tonificar e suavizar a celulite.",
            duration: 45,
          },
          {
            id: "madeiroterapia",
            name: "Madeiroterapia",
            description: "Instrumentos de madeira para modelar o corpo e ativar a circulação.",
            duration: 60,
          },
          {
            id: "eletroporacao",
            name: "Eletroporação",
            description: "Leva ativos às camadas profundas da pele, sem agulhas.",
            duration: 45,
          },
          {
            id: "termo-crio",
            name: "Termoterapia e crioterapia",
            description: "Calor e frio alternados para tonificar e drenar.",
            duration: 60,
          },
        ],
      },
      {
        id: "drenagem",
        name: "Drenagem Linfática",
        tags: ["Método Renata França", "Bem-estar"],
        summary: "Leveza, menos inchaço e bem-estar desde a primeira sessão.",
        image: "drenagem",
        items: [
          {
            id: "drenagem-renata-franca",
            name: "Drenagem linfática Método Renata França",
            description: "Manobras rápidas e ritmadas no corpo todo. Resultado visível logo após a sessão.",
            duration: 60,
          },
          {
            id: "modeladora",
            name: "Massagem modeladora",
            description: "Manobras firmes e profundas para modelar o contorno e tonificar.",
            duration: 60,
          },
        ],
      },
      {
        id: "podologia",
        name: "Podologia",
        tags: ["Saúde dos pés", "Cuidado completo"],
        summary: "Cuidado especializado para a saúde e a beleza dos pés.",
        image: "podologia",
        items: [
          {
            id: "avaliacao-podologica",
            name: "Avaliação podológica",
            description: "Análise dos pés, das unhas e da pisada, com orientação de cuidados.",
            duration: 45,
          },
          {
            id: "unha-encravada",
            name: "Unha encravada",
            description: "Tratamento cuidadoso da unha encravada, com instrumentos esterilizados.",
            duration: 45,
          },
          {
            id: "calosidades",
            name: "Calos e calosidades",
            description: "Remoção de calos e espessamentos da pele dos pés.",
            duration: 45,
          },
          {
            id: "pes-completo",
            name: "Tratamento completo dos pés",
            description: "Unhas, pele, hidratação e massagem relaxante.",
            duration: 60,
          },
        ],
      },
    ],
  },

  why: {
    title: "Por Que a Marga Beauty?",
    subtitle: "Tecnologia, competência e sensibilidade estética",
    items: [
      {
        icon: "sparkles",
        title: "Protocolos Personalizados",
        text: "Cada tratamento é estudado para você, combinando técnicas manuais e aparelhos profissionais de alta performance.",
      },
      {
        icon: "zap",
        title: "Tecnologia de Última Geração",
        text: "Laser, radiofrequência multipolar, ondas de choque, cavitação e mais: equipamentos de ponta para rosto e corpo.",
      },
      {
        icon: "heart",
        title: "Resultados Visíveis e Naturais",
        text: "Respeito total ao equilíbrio da pele e da silhueta, em tratamentos femininos e masculinos.",
      },
    ],
  },

  /** Cartões em rolagem horizontal. */
  technologies: {
    title: ["Tecnologia que", "Respeita a Sua Pele"],
    text: "Especializada em tecnologias estéticas de última geração para remodelação corporal, regeneração da pele e rejuvenescimento facial. Cada tratamento é pensado para você, unindo métodos manuais e aparelhos profissionais para resultados visíveis e naturais.",
    cardAction: (title: string) => `Agendar: ${title}`,
    cards: [
      {
        title: "Rejuvenescimento",
        items: ["Radiofrequência multipolar", "Fotobiomodulação LED", "Oxigenoterapia", "Lifting não invasivo"],
      },
      {
        title: "Pele Saudável",
        items: ["Espátula ultrassônica", "Tratamento antimanchas", "Tratamento para acne", "Eletroporação"],
      },
      {
        title: "Remodelação",
        items: ["Ondas de choque", "Ultrassom e cavitação", "Laser de última geração", "Termo e crioterapia"],
      },
      {
        title: "Drenagem",
        items: ["Método Renata França", "Pressoterapia", "Vacuum endomassagem", "Linfodrenagem manual"],
      },
      {
        title: "Técnicas Manuais",
        items: ["Madeiroterapia", "Massagem modeladora", "Massagem linfodrenante", "Protocolos anticelulite"],
      },
      {
        title: "Podologia",
        items: ["Avaliação podológica", "Unha encravada", "Calos e calosidades", "Cuidado completo dos pés"],
      },
    ],
  },

  /** Lista com linhas que vibram e imagem que acompanha o mouse. */
  specialties: {
    title: ["Formação e", "Especialidades"],
    items: [
      { title: "Podologia", meta: "Formação profissional", image: "podologia" },
      { title: "Método Renata França", meta: "Drenagem linfática brasileira", image: "drenagem" },
      { title: "Estética Avançada", meta: "Tecnologias para rosto e corpo", image: "rosto" },
      { title: "Atendimento Feminino e Masculino", meta: "Protocolos para cada pessoa", image: "marga" },
    ],
  },

  /** Frase central com os benefícios voando em 3D. */
  benefits: {
    title: "Drenagem Linfática Brasileira: Leveza e Bem-Estar Desde a Primeira Sessão.",
    words: [
      "Menos estresse",
      "Menos ansiedade",
      "Alívio muscular",
      "Mais circulação",
      "Imunidade",
      "Pele mais elástica",
      "Menos cansaço",
      "Menos toxinas",
      "Sono melhor",
      "Menos inchaço",
      "Leveza",
      "Bem-estar",
    ],
  },

  /** Carrossel no formato dos depoimentos da referência, com as etapas do atendimento. */
  steps: {
    title: "Como Funciona o Seu Atendimento",
    stepLabel: (n: number, total: number) => `Etapa ${n} de ${total}`,
    showStep: (title: string) => `Mostrar etapa: ${title}`,
    prev: "Etapa anterior",
    next: "Próxima etapa",
    items: [
      {
        title: "Avaliação",
        text: "Conversamos sobre o seu objetivo e analisamos pele, corpo ou pés. É o ponto de partida de todo protocolo.",
      },
      {
        title: "Protocolo Sob Medida",
        text: "Definimos as técnicas, os aparelhos e o número de sessões que fazem sentido para o seu caso.",
      },
      {
        title: "Sessões",
        text: "Tratamentos com hora marcada, no seu ritmo, combinando tecnologia e o cuidado das mãos.",
      },
      {
        title: "Acompanhamento",
        text: "Avaliamos a evolução a cada etapa e ajustamos o protocolo quando for preciso.",
      },
    ],
  },

  faq: {
    title: "Perguntas Frequentes",
    // TODO: confirmar com a cliente a política de remarcação (24 h).
    items: [
      {
        question: "O que é a drenagem linfática Método Renata França?",
        answer:
          "É uma técnica brasileira de drenagem com manobras rápidas, firmes e ritmadas. Ela ajuda a desinchar e devolve a sensação de leveza já na primeira sessão, além de contribuir para o bem-estar geral.",
      },
      {
        question: "Quantas sessões são necessárias?",
        answer:
          "Depende do seu objetivo e do tratamento escolhido. Na avaliação inicial definimos o protocolo e o número de sessões indicado para você.",
      },
      {
        question: "Os tratamentos também são para homens?",
        answer: "Sim. Os tratamentos de rosto, corpo e podologia são oferecidos para mulheres e homens.",
      },
      {
        question: "Como funciona o agendamento online?",
        answer:
          "Você escolhe o tratamento, vê os horários livres em tempo real e confirma em poucos passos. O horário entra direto na agenda da Marga.",
      },
      {
        question: "Posso remarcar ou cancelar um horário?",
        answer: "Sim. Avise com pelo menos 24 horas de antecedência para liberarmos o horário para outra pessoa.",
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
    rights: (year: number) => `Copyright © Marga Beauty ${year}`,
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
      duration: "Duração",
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
    clientEventTitle: (service: string) => `${service} na Marga Beauty`,
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
          "O responsável pelo tratamento é Marga Beauty. Os dados de contato completos (razão social, endereço e Partita IVA) estão no rodapé do site.",
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
          "O agendamento é salvo na agenda Google de Marga Beauty. O Google atua como fornecedor de serviço, com proteções previstas pelo GDPR.",
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

export type SiteContent = typeof pt;
