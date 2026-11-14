/**
 * Tutto il testo del sito in italiano (versione in uso).
 * È anche il modello di `pt.ts` (stesse chiavi). I trattamenti sono in `treatments.ts`.
 */
export const it = {
  locale: "it-IT",
  htmlLang: "it",

  meta: {
    title: "MARGA Brazilian Beauty — Cera brasiliana, viso, corpo, mani e piedi a Uboldo",
    description:
      "Centro estetico brasiliano a Uboldo (VA), per donna e uomo: epilazione con cera brasiliana, trattamenti viso, linfodrenaggio, Miracle Face, manicure e pedicure. Prenota online.",
  },

  header: {
    home: "MARGA Brazilian Beauty, home",
    book: "Prenota",
  },

  visuals: {
    placeholder: "Foto provvisoria",
    labels: { rosto: "Viso", corpo: "Corpo", drenagem: "Linfodrenaggio", podologia: "Mani e piedi", marga: "Marga", margaDivisa: "Marga", margaCamicia: "Marga", margaAbito: "Marga" },
  },

  hero: {
    title: "La Tua Bellezza in Perfetto Equilibrio",
    asideTop: "Donna & Uomo",
    asideBottom: ["Estetica", "Brasiliana"],
    imageAlt: "Marga, fondatrice di MARGA Brazilian Beauty, con la divisa del centro",
    galleryLabel: "Trattamenti di MARGA Brazilian Beauty",
  },

  treatments: {
    title: "I Nostri Trattamenti",
    intro: "Scegli l'area e la categoria per vedere tutti i servizi.",
    areasLabel: "Area",
    categoriesLabel: "Categorie",
    book: "Prenota",
    bookAria: (name: string) => `Prenota ${name}`,
  },

  why: {
    title: "Perché MARGA Brazilian Beauty?",
    subtitle: "Competenza, cura e sensibilità brasiliana",
    items: [
      {
        icon: "sparkles",
        title: "Cura su Misura",
        text: "Ogni servizio viene adattato alla tua pelle e alle tue esigenze, con attenzione ai dettagli e alla rifinitura.",
      },
      {
        icon: "zap",
        title: "Tradizione Brasiliana",
        text: "Cera brasiliana, linfodrenaggio e Miracle Face del metodo Renata França: tecniche manuali che portano a Uboldo il meglio dell'estetica brasiliana.",
      },
      {
        icon: "heart",
        title: "Per Donna e per Uomo",
        text: "Due aree dedicate, con servizi pensati per lei e per lui. Puoi consultarle entrambe e scegliere liberamente.",
      },
    ],
  },

  /**
   * Tecnologie estetiche avanzate: contenuti in arrivo. La sezione non è
   * pubblicata (vedi `page.tsx`); completare qui quando i testi sono confermati.
   */
  technologies: {
    title: ["Tecnologie", "Estetiche Avanzate"],
    text: "",
    cardAction: (title: string) => `Prenota: ${title}`,
    cards: [] as { title: string; items: string[] }[],
  },

  specialties: {
    title: ["Le Nostre", "Specialità"],
    items: [
      { title: "Cera Brasiliana", meta: "Epilazione mirata viso e corpo", image: "margaAbito" },
      { title: "Miracle Face", meta: "Massaggio viso metodo Renata França", image: "margaCamicia" },
      { title: "Linfodrenaggio", meta: "Manualità drenanti per corpo e gambe", image: "margaDivisa" },
      { title: "Mani e Piedi", meta: "Manicure, pedicure e cura delle unghie", image: "marga" },
    ],
  },

  benefits: {
    title: "Linfodrenaggio Brasiliano: una Sensazione di Leggerezza Fin dalla Prima Seduta.",
    words: [
      "Leggerezza",
      "Relax",
      "Gambe leggere",
      "Pelle morbida",
      "Benessere",
      "Cura di sé",
      "Equilibrio",
      "Tempo per te",
      "Dolcezza",
      "Armonia",
      "Pelle liscia",
      "Serenità",
    ],
  },

  steps: {
    title: "Come Funziona il Tuo Appuntamento",
    stepLabel: (n: number, total: number) => `Fase ${n} di ${total}`,
    showStep: (title: string) => `Mostra la fase: ${title}`,
    prev: "Fase precedente",
    next: "Fase successiva",
    items: [
      {
        title: "Scegli",
        text: "Consulta le aree Donna e Uomo e scegli il servizio che desideri.",
      },
      {
        title: "Prenota",
        text: "Scegli giorno e orario online, oppure scrivici su WhatsApp per qualsiasi domanda.",
      },
      {
        title: "Il Tuo Momento",
        text: "Ti accogliamo nel centro di Uboldo e adattiamo il servizio alla tua pelle e alle tue esigenze.",
      },
      {
        title: "Consigli",
        text: "A fine appuntamento ti diamo qualche indicazione per prenderti cura della pelle a casa.",
      },
    ],
  },

  faq: {
    title: "Domande Frequenti",
    // TODO: confermare con la cliente la politica di disdetta (24 ore).
    items: [
      {
        question: "I servizi sono anche per uomini?",
        answer:
          "Sì. Il sito ha due aree, Donna e Uomo, con le stesse categorie: epilazione con cera brasiliana, trattamenti viso, trattamenti corpo, mani e piedi. Puoi consultarle entrambe liberamente.",
      },
      {
        question: "Che cos'è il Miracle Face?",
        answer:
          "È il massaggio viso del metodo Renata França, con manovre drenanti e di modellamento manuale.",
      },
      {
        question: "Che cos'è il linfodrenaggio brasiliano?",
        answer:
          "È una tecnica brasiliana esclusiva, sviluppata da Renata França, caratterizzata da manualità specifiche, pressioni decise e un ritmo sostenuto.",
      },
      {
        question: "Come funziona la prenotazione online?",
        answer:
          "Scegli il servizio, vedi gli orari liberi e confermi in pochi passaggi. L'appuntamento entra direttamente nell'agenda di Marga.",
      },
      {
        question: "Posso spostare o disdire un appuntamento?",
        answer: "Certo. Avvisaci con almeno 24 ore di anticipo, così possiamo liberare l'orario per un'altra persona.",
      },
    ],
  },

  footer: {
    cta: "Prenota il Tuo Momento di Benessere",
    book: "Prenota un appuntamento",
    reachOut: "Contatti",
    hoursTitle: "Orari",
    closed: "Chiuso",
    privacy: "Informativa sulla privacy",
    vat: "P. IVA",
    rights: (year: number) => `Copyright © MARGA Brazilian Beauty ${year}`,
    instagram: "Instagram",
    whatsapp: "WhatsApp",
    whatsappMessage: "Ciao Marga! Ho visto il sito e vorrei qualche informazione.",
    whatsappAria: (phone: string) => `Scrivi su WhatsApp: ${phone}`,
    mapsAria: (address: string) => `Apri in Google Maps: ${address}`,
  },

  booking: {
    title: "Prenota il Tuo Appuntamento",
    intro: "Orari in tempo reale, direttamente dall'agenda di Marga.",
    close: "Chiudi la prenotazione",
    timezoneNote: "Orari in ora italiana.",
    steps: ["Trattamento", "Data e ora", "I tuoi dati"],
    stepsLabel: "Fasi della prenotazione",
    chooseService: "Quale trattamento desideri?",
    areaLabel: "Area",
    chooseDate: "Scegli il giorno e l'orario",
    calendarLabel: "Calendario",
    chooseTime: "Scegli l'orario",
    yourDetails: "I tuoi dati",
    change: "Modifica",
    prevMonth: "Mese precedente",
    nextMonth: "Mese successivo",
    loading: "Controllo l'agenda…",
    slotsCount: (n: number) => (n === 1 ? "1 orario libero" : `${n} orari liberi`),
    noSlots: "nessun orario",
    timesFor: (date: string) => `Orari di ${date}`,
    noSlotsDay: "Non ci sono orari liberi in questo giorno. Scegli un'altra data.",
    noSlotsMonth: "Non ci sono orari liberi questo mese per questo trattamento. Guarda il mese successivo.",
    pickDateFirst: "Scegli un giorno nel calendario per vedere gli orari.",
    morning: "Mattina",
    afternoon: "Pomeriggio",
    fields: {
      name: "Nome e cognome",
      phone: "Telefono / WhatsApp",
      phoneHint: "Con il prefisso internazionale, es. +39 333 123 4567.",
      email: "E-mail",
      notes: "Note (facoltativo)",
      notesPlaceholder: "C'è qualcosa che Marga dovrebbe sapere prima dell'appuntamento?",
      consent: "Ho letto l'informativa sulla privacy e acconsento al trattamento dei miei dati per gestire la prenotazione.",
      privacyLink: "Leggi l'informativa sulla privacy",
    },
    summary: {
      service: "Trattamento",
      date: "Data",
      time: "Orario",
    },
    submit: "Conferma la prenotazione",
    submitting: "Conferma in corso…",
    success: {
      title: "Prenotazione confermata",
      text: "Il tuo appuntamento è registrato nell'agenda di Marga. Per spostarlo o disdirlo, avvisaci con almeno 24 ore di anticipo.",
      addToGoogle: "Aggiungi a Google Calendar",
      downloadIcs: "Scarica per un altro calendario (.ics)",
      whatsapp: "Invia un messaggio su WhatsApp",
      whatsappMessage: (service: string, date: string, time: string, name: string) =>
        `Ciao Marga! Sono ${name} e ho appena prenotato ${service} per ${date} alle ${time}.`,
      again: "Fai un'altra prenotazione",
    },
    errors: {
      required: "Compila questo campo.",
      email: "Inserisci un'e-mail valida, es. nome@email.com.",
      phone: "Inserisci il telefono con il prefisso internazionale, es. +39 333 123 4567.",
      consent: "Per prenotare, accetta l'informativa sulla privacy.",
      slotTaken: "Questo orario è appena stato prenotato. Scegline un altro.",
      loadFailed: "Non è stato possibile caricare l'agenda. Controlla la connessione e riprova.",
      generic: "Non è stato possibile completare la prenotazione. Riprova oppure scrivici su Instagram.",
      retry: "Riprova",
    },
    demoNotice:
      "Modalità dimostrativa: Google Calendar non è ancora collegato. Gli orari occupati sono simulati e le prenotazioni non vengono salvate.",
    eventTitle: (service: string, name: string) => `${service} — ${name}`,
    eventDetails: {
      phone: "Telefono",
      email: "E-mail",
      notes: "Note",
      source: "Prenotato dal sito",
    },
    clientEventTitle: (service: string) => `${service} da MARGA Brazilian Beauty`,
  },

  privacy: {
    title: "Informativa sulla privacy",
    back: "Torna al sito",
    updated: "Ultimo aggiornamento: ottobre 2026",
    // TODO: far rivedere da un professionista prima della pubblicazione (GDPR / Garante Privacy).
    sections: [
      {
        title: "Titolare del trattamento",
        body: [
          "Il titolare del trattamento è MARGA Brazilian Beauty. I dati di contatto completi (ragione sociale, indirizzo e Partita IVA) sono riportati nel piè di pagina del sito.",
        ],
      },
      {
        title: "Quali dati raccogliamo",
        body: [
          "Quando prenoti dal sito ci comunichi nome, telefono, e-mail, il trattamento scelto, la data e l'orario e, se lo desideri, delle note.",
          "Il sito non utilizza cookie pubblicitari né di profilazione.",
        ],
      },
      {
        title: "Per quali finalità",
        body: [
          "Esclusivamente per registrare e gestire la tua prenotazione e per contattarti in merito (conferma, spostamento o disdetta). La base giuridica è l'esecuzione di misure precontrattuali adottate su tua richiesta (art. 6, par. 1, lett. b del GDPR).",
        ],
      },
      {
        title: "Dove vengono conservati",
        body: [
          "La prenotazione viene salvata nel Google Calendar di MARGA Brazilian Beauty. Google opera come fornitore di servizi, con le garanzie previste dal GDPR.",
        ],
      },
      {
        title: "Per quanto tempo",
        body: [
          "Conserviamo i dati per il tempo necessario a fornire il servizio e per adempiere agli obblighi di legge e fiscali applicabili.",
        ],
      },
      {
        title: "I tuoi diritti",
        body: [
          "Puoi chiedere l'accesso, la rettifica, la cancellazione o la limitazione dei tuoi dati e opporti al trattamento scrivendo al contatto indicato nel piè di pagina. Puoi inoltre presentare reclamo al Garante per la protezione dei dati personali.",
        ],
      },
    ],
  },
};

export type SiteContent = typeof it;
