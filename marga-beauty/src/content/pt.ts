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

  preloader: {
    label: "Carregando",
  },

  nav: {
    home: "Marga Beauty, início",
    links: [
      { href: "#servicos", label: "Serviços" },
      { href: "#tecnologias", label: "Tecnologias" },
      { href: "#drenagem", label: "Drenagem brasileira" },
      { href: "#sobre", label: "Sobre" },
    ],
    book: "Agendar",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
  },

  hero: {
    statement: "Estética avançada para rosto e corpo, drenagem linfática brasileira e podologia.",
    cta: "Agendar horário",
    imageAlt: "Marga, fundadora da Marga Beauty, de blazer preto",
    aside: "Tratamentos femininos e masculinos",
    scroll: "Role para conhecer",
  },

  manifesto: {
    text:
      "Cada tratamento é pensado para você. Unimos técnicas manuais e aparelhos profissionais de alta performance para chegar a resultados visíveis e naturais, sempre respeitando o equilíbrio da pele e da silhueta.",
  },

  services: {
    title: "Serviços",
    intro:
      "Escolha uma área para ver os tratamentos. Todos começam com uma avaliação e seguem um protocolo feito para o seu objetivo.",
    treatmentsCount: (n: number) => (n === 1 ? "1 tratamento" : `${n} tratamentos`),
    book: "Agendar",
    bookAria: (name: string) => `Agendar ${name}`,
    minutes: (n: number) => `${n} min`,
    expand: "Ver tratamentos",
    collapse: "Fechar tratamentos",
    categories: [
      {
        id: "rosto",
        name: "Rosto",
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
        name: "Drenagem linfática brasileira",
        summary: "Método Renata França: leveza, menos inchaço e bem-estar desde a primeira sessão.",
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

  technologies: {
    title: "Tecnologias e métodos",
    intro:
      "Aparelhos profissionais de última geração e técnicas manuais, combinados em cada protocolo conforme a necessidade da sua pele e do seu corpo.",
    items: [
      { name: "Laser de última geração", description: "Energia de luz precisa para tratar a pele com segurança." },
      { name: "Radiofrequência multipolar", description: "Aquece as camadas profundas e estimula o colágeno." },
      { name: "Ondas de choque estéticas", description: "Impulsos acústicos contra celulite e gordura localizada." },
      { name: "Ultrassom e cavitação", description: "Ondas de ultrassom focadas na redução de medidas." },
      { name: "Eletroporação", description: "Abre caminho para os ativos penetrarem, sem agulhas." },
      { name: "Pressoterapia", description: "Compressão em sequência que ativa a circulação." },
      { name: "Vacuum endomassagem", description: "Sucção e rolos que drenam e suavizam a pele." },
      { name: "Oxigenoterapia e LED", description: "Oxigênio e fotobiomodulação para regenerar a pele." },
      { name: "Termoterapia e crioterapia", description: "Calor e frio para tonificar, drenar e firmar." },
      { name: "Espátula ultrassônica", description: "Limpeza profunda do rosto sem agredir a pele." },
      { name: "Madeiroterapia", description: "Instrumentos de madeira que modelam e ativam." },
      { name: "Massagem linfodrenante e modeladora", description: "As mãos da terapeuta, onde a tecnologia não chega." },
    ],
  },

  drainage: {
    title: "Drenagem linfática brasileira",
    method: "Método Renata França",
    text:
      "Marga é terapeuta especializada no Método Renata França, a drenagem linfática brasileira conhecida pelo resultado imediato. Manobras rápidas, firmes e ritmadas que desincham e devolvem a sensação de leveza já na primeira sessão.",
    benefitsTitle: "O que a massagem faz por você",
    benefits: [
      "Ajuda a controlar o estresse",
      "Ajuda a reduzir a ansiedade",
      "Alivia a tensão e as dores musculares",
      "Melhora a circulação sanguínea",
      "Contribui para fortalecer a imunidade",
      "Aumenta a elasticidade da pele",
      "Reduz o cansaço",
      "Ajuda a eliminar toxinas",
      "Contribui para reduzir a insônia",
    ],
    cta: "Agendar drenagem",
    ctaServiceId: "drenagem-renata-franca",
    imageAlt: "Sessão de drenagem linfática",
  },

  about: {
    title: "Quem cuida de você",
    paragraphs: [
      "Formada em podologia e especializada em estética avançada, Marga une a sensibilidade das técnicas manuais à precisão da tecnologia.",
      "Cada atendimento começa com uma conversa e uma avaliação. A partir dela, o protocolo é montado para você: as técnicas, os aparelhos e o número de sessões que fazem sentido para o seu objetivo.",
    ],
    credentialsTitle: "Formação e especialidades",
    credentials: [
      "Formada em podologia",
      "Terapeuta especializada no Método Renata França",
      "Tecnologias estéticas de última geração para rosto e corpo",
      "Atendimento feminino e masculino",
    ],
    imageAlt: "Marga no estúdio",
  },

  process: {
    title: "Como funciona",
    steps: [
      { title: "Avaliação", text: "Conversamos sobre o seu objetivo e analisamos pele, corpo ou pés." },
      { title: "Protocolo sob medida", text: "Definimos técnicas, aparelhos e o número de sessões para o seu caso." },
      { title: "Sessões", text: "Tratamentos com hora marcada, no seu ritmo." },
      { title: "Acompanhamento", text: "Avaliamos a evolução e ajustamos o protocolo quando for preciso." },
    ],
  },

  booking: {
    title: "Agende seu horário",
    intro:
      "Os horários vêm direto da agenda da Marga e mostram só o que está livre. Escolha o tratamento, o dia e a hora.",
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

  footer: {
    contactTitle: "Contato",
    hoursTitle: "Horários",
    followTitle: "Instagram",
    addressPending: "Endereço em breve",
    closed: "Fechado",
    backToTop: "Voltar ao topo",
    privacy: "Política de privacidade",
    vat: "P. IVA",
    rights: (year: number) => `© ${year} Marga Beauty`,
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
