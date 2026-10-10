import type { SiteContent } from "./pt";

/**
 * Tutto il testo del sito in italiano (versione in uso).
 * Stessa struttura di `pt.ts`: le chiavi e gli `id` dei servizi restano uguali.
 */
export const it: SiteContent = {
  locale: "it-IT",
  htmlLang: "it",

  meta: {
    title: "Marga Beauty — Estetica avanzata, linfodrenaggio brasiliano e podologia",
    description:
      "Trattamenti viso e corpo con tecnologie di ultima generazione, linfodrenaggio Metodo Renata França e podologia a Rovello Porro (CO). Prenota online con gli orari disponibili in tempo reale.",
  },

  header: {
    home: "Marga Beauty, home",
    book: "Prenota",
  },

  visuals: {
    placeholder: "Foto provvisoria",
    labels: { rosto: "Viso", corpo: "Corpo", drenagem: "Linfodrenaggio", podologia: "Podologia", marga: "Marga" },
  },

  hero: {
    title: "La Tua Bellezza in Perfetto Equilibrio",
    asideTop: "Estetica Avanzata",
    asideBottom: ["Podologia &", "Linfodrenaggio Brasiliano"],
    imageAlt: "Marga, fondatrice di Marga Beauty, in tailleur chiaro",
    galleryLabel: "Trattamenti di Marga Beauty",
  },

  showcase: {
    title: "I Nostri Trattamenti",
    book: "Prenota",
    bookAria: (name: string) => `Prenota ${name}`,
    minutes: (n: number) => `${n} min`,
  },

  services: {
    categories: [
      {
        id: "rosto",
        name: "Viso",
        tags: ["Anti-age", "Pelle rinnovata"],
        summary: "Ringiovanimento, pulizia profonda e rigenerazione della pelle.",
        image: "rosto",
        items: [
          {
            id: "limpeza-profunda",
            name: "Pulizia viso profonda",
            description: "Spatola a ultrasuoni, estrazione delicata e maschera lenitiva.",
            duration: 60,
          },
          {
            id: "anti-idade",
            name: "Trattamento anti-age",
            description: "Radiofrequenza multipolare e LED per compattezza e luminosità.",
            duration: 60,
          },
          {
            id: "antimanchas",
            name: "Trattamento antimacchie",
            description: "Protocollo per uniformare l'incarnato e ridare luminosità.",
            duration: 60,
          },
          {
            id: "acne",
            name: "Trattamento per l'acne",
            description: "Pulizia, controllo del sebo e LED per pelli acneiche.",
            duration: 60,
          },
          {
            id: "lifting",
            name: "Lifting non invasivo",
            description: "Effetto lifting senza aghi, con tecnologia e massaggio viso.",
            duration: 75,
          },
          {
            id: "oxigenoterapia",
            name: "Ossigenoterapia viso",
            description: "Ossigeno e principi attivi per una pelle riposata e luminosa.",
            duration: 45,
          },
        ],
      },
      {
        id: "corpo",
        name: "Corpo",
        tags: ["Rimodellamento", "Anticellulite"],
        summary: "Rimodellamento, drenaggio e tonificazione con tecnologia e tecniche manuali.",
        image: "corpo",
        items: [
          {
            id: "radiofrequencia-corpo",
            name: "Rimodellamento con radiofrequenza",
            description: "Calore controllato per rassodare la pelle e definire la silhouette.",
            duration: 60,
          },
          {
            id: "ondas-de-choque",
            name: "Onde d'urto estetiche",
            description: "Trattamento mirato per cellulite e adiposità localizzate.",
            duration: 45,
          },
          {
            id: "cavitacao",
            name: "Ultrasuoni e cavitazione",
            description: "Ultrasuoni focalizzati per ridurre i centimetri.",
            duration: 45,
          },
          {
            id: "pressoterapia",
            name: "Pressoterapia",
            description: "Compressione sequenziale che attiva la circolazione e sgonfia.",
            duration: 45,
          },
          {
            id: "vacuum",
            name: "Vacuum endomassaggio",
            description: "Aspirazione e rulli per drenare, tonificare e levigare la cellulite.",
            duration: 45,
          },
          {
            id: "madeiroterapia",
            name: "Maderoterapia",
            description: "Strumenti in legno per modellare il corpo e attivare la circolazione.",
            duration: 60,
          },
          {
            id: "eletroporacao",
            name: "Elettroporazione",
            description: "Veicola i principi attivi negli strati profondi della pelle, senza aghi.",
            duration: 45,
          },
          {
            id: "termo-crio",
            name: "Termoterapia e crioterapia",
            description: "Caldo e freddo alternati per tonificare e drenare.",
            duration: 60,
          },
        ],
      },
      {
        id: "drenagem",
        name: "Linfodrenaggio",
        tags: ["Metodo Renata França", "Benessere"],
        summary: "Leggerezza, meno gonfiore e benessere fin dalla prima seduta.",
        image: "drenagem",
        items: [
          {
            id: "drenagem-renata-franca",
            name: "Linfodrenaggio Metodo Renata França",
            description: "Manovre rapide e ritmate su tutto il corpo. Risultato visibile subito dopo la seduta.",
            duration: 60,
          },
          {
            id: "modeladora",
            name: "Massaggio modellante",
            description: "Manovre decise e profonde per modellare la silhouette e tonificare.",
            duration: 60,
          },
        ],
      },
      {
        id: "podologia",
        name: "Podologia",
        tags: ["Salute del piede", "Cura completa"],
        summary: "Cura specializzata per la salute e la bellezza dei piedi.",
        image: "podologia",
        items: [
          {
            id: "avaliacao-podologica",
            name: "Valutazione podologica",
            description: "Analisi di piedi, unghie e appoggio, con consigli per la cura.",
            duration: 45,
          },
          {
            id: "unha-encravada",
            name: "Unghia incarnita",
            description: "Trattamento accurato dell'unghia incarnita, con strumenti sterilizzati.",
            duration: 45,
          },
          {
            id: "calosidades",
            name: "Calli e callosità",
            description: "Rimozione di calli e ispessimenti della pelle dei piedi.",
            duration: 45,
          },
          {
            id: "pes-completo",
            name: "Trattamento completo dei piedi",
            description: "Unghie, pelle, idratazione e massaggio rilassante.",
            duration: 60,
          },
        ],
      },
    ],
  },

  why: {
    title: "Perché Marga Beauty?",
    subtitle: "Tecnologia, competenza e sensibilità estetica",
    items: [
      {
        icon: "sparkles",
        title: "Protocolli Personalizzati",
        text: "Ogni trattamento è studiato per te, unendo tecniche manuali e apparecchiature professionali ad alte prestazioni.",
      },
      {
        icon: "zap",
        title: "Tecnologia di Ultima Generazione",
        text: "Laser, radiofrequenza multipolare, onde d'urto, cavitazione e molto altro: apparecchiature all'avanguardia per viso e corpo.",
      },
      {
        icon: "heart",
        title: "Risultati Visibili e Naturali",
        text: "Massimo rispetto per l'equilibrio della pelle e della silhouette, con trattamenti per donna e per uomo.",
      },
    ],
  },

  technologies: {
    title: ["Tecnologia che", "Rispetta la Tua Pelle"],
    text: "Specializzata in tecnologie estetiche di ultima generazione per il rimodellamento corporeo, la rigenerazione della pelle e il ringiovanimento del viso. Ogni trattamento è pensato per te, unendo metodi manuali e apparecchiature professionali per risultati visibili e naturali.",
    cardAction: (title: string) => `Prenota: ${title}`,
    cards: [
      {
        title: "Ringiovanimento",
        items: ["Radiofrequenza multipolare", "Fotobiomodulazione LED", "Ossigenoterapia", "Lifting non invasivo"],
      },
      {
        title: "Pelle Sana",
        items: ["Spatola a ultrasuoni", "Trattamento antimacchie", "Trattamento per l'acne", "Elettroporazione"],
      },
      {
        title: "Rimodellamento",
        items: ["Onde d'urto", "Ultrasuoni e cavitazione", "Laser di ultima generazione", "Termo e crioterapia"],
      },
      {
        title: "Drenaggio",
        items: ["Metodo Renata França", "Pressoterapia", "Vacuum endomassaggio", "Linfodrenaggio manuale"],
      },
      {
        title: "Tecniche Manuali",
        items: ["Maderoterapia", "Massaggio modellante", "Massaggio drenante", "Protocolli anticellulite"],
      },
      {
        title: "Podologia",
        items: ["Valutazione podologica", "Unghia incarnita", "Calli e callosità", "Cura completa del piede"],
      },
    ],
  },

  specialties: {
    title: ["Formazione e", "Specializzazioni"],
    items: [
      { title: "Podologia", meta: "Formazione professionale", image: "podologia" },
      { title: "Metodo Renata França", meta: "Linfodrenaggio brasiliano", image: "drenagem" },
      { title: "Estetica Avanzata", meta: "Tecnologie per viso e corpo", image: "rosto" },
      { title: "Trattamenti Donna e Uomo", meta: "Protocolli su misura per ogni persona", image: "marga" },
    ],
  },

  benefits: {
    title: "Linfodrenaggio Brasiliano: Leggerezza e Benessere Fin dalla Prima Seduta.",
    words: [
      "Meno stress",
      "Meno ansia",
      "Sollievo muscolare",
      "Più circolazione",
      "Difese immunitarie",
      "Pelle più elastica",
      "Meno stanchezza",
      "Meno tossine",
      "Sonno migliore",
      "Meno gonfiore",
      "Leggerezza",
      "Benessere",
    ],
  },

  steps: {
    title: "Come Funziona il Tuo Percorso",
    stepLabel: (n: number, total: number) => `Fase ${n} di ${total}`,
    showStep: (title: string) => `Mostra la fase: ${title}`,
    prev: "Fase precedente",
    next: "Fase successiva",
    items: [
      {
        title: "Valutazione",
        text: "Parliamo del tuo obiettivo e analizziamo pelle, corpo o piedi. È il punto di partenza di ogni protocollo.",
      },
      {
        title: "Protocollo su Misura",
        text: "Definiamo le tecniche, le apparecchiature e il numero di sedute più adatti al tuo caso.",
      },
      {
        title: "Sedute",
        text: "Trattamenti su appuntamento, con i tuoi tempi, unendo tecnologia e la cura delle mani.",
      },
      {
        title: "Monitoraggio",
        text: "Valutiamo i progressi a ogni fase e adattiamo il protocollo quando serve.",
      },
    ],
  },

  faq: {
    title: "Domande Frequenti",
    // TODO: confermare con la cliente la politica di disdetta (24 ore).
    items: [
      {
        question: "Che cos'è il linfodrenaggio Metodo Renata França?",
        answer:
          "È una tecnica brasiliana di drenaggio con manovre rapide, decise e ritmate. Aiuta a sgonfiare e restituisce una sensazione di leggerezza già dalla prima seduta, contribuendo al benessere generale.",
      },
      {
        question: "Quante sedute servono?",
        answer:
          "Dipende dal tuo obiettivo e dal trattamento scelto. Nella valutazione iniziale definiamo il protocollo e il numero di sedute più indicato per te.",
      },
      {
        question: "I trattamenti sono anche per uomini?",
        answer: "Sì. I trattamenti viso, corpo e podologia sono proposti sia alle donne sia agli uomini.",
      },
      {
        question: "Come funziona la prenotazione online?",
        answer:
          "Scegli il trattamento, vedi gli orari liberi in tempo reale e confermi in pochi passaggi. L'appuntamento entra direttamente nell'agenda di Marga.",
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
    rights: (year: number) => `Copyright © Marga Beauty ${year}`,
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
      duration: "Durata",
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
    clientEventTitle: (service: string) => `${service} da Marga Beauty`,
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
          "Il titolare del trattamento è Marga Beauty. I dati di contatto completi (ragione sociale, indirizzo e Partita IVA) sono riportati nel piè di pagina del sito.",
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
          "La prenotazione viene salvata nel Google Calendar di Marga Beauty. Google opera come fornitore di servizi, con le garanzie previste dal GDPR.",
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
