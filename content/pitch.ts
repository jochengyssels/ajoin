/**
 * Investor overview at /<locale>/pitch. Every statement must be true today.
 * Facts are facts; anything not yet done is labelled as a plan.
 * Not linked from the navigation and not indexed.
 */
import type { Locale } from "@/i18n/routing";

export interface Slide {
  /** Small label above the title, e.g. "Today" or "Plan". */
  kind: "fact" | "plan" | "open";
  title: string;
  body?: string;
  points?: string[];
  /** Ordered steps (only for real sequences). */
  steps?: string[];
  sources?: { label: string; url: string }[];
}

export interface Pitch {
  title: string;
  subtitle: string;
  date: string;
  honesty: string;
  labels: { fact: string; plan: string; open: string; sources: string; contact: string; contactBody: string };
  slides: Slide[];
  /** TODO_BRAND: the investment ask (amount, instrument, use of funds). Hidden while null. */
  ask: Slide | null;
}

const en: Pitch = {
  title: "Ajoin & Shine",
  subtitle: "An onion shampoo with a carnival soul.",
  date: "Investor overview · October 2026",
  honesty:
    "We're pre-launch. Everything on this page is true today. Where something is a plan, it says so.",
  labels: {
    fact: "Today",
    plan: "Plan",
    open: "Open question",
    sources: "Sources",
    contact: "Talk to us",
    contactBody: "Questions, or want the details behind any slide? Get in touch.",
  },
  slides: [
    {
      kind: "fact",
      title: "The idea",
      body:
        "One product: a shampoo made with onion extract. One brand, built on the carnival culture of Aalst, where the locals have been nicknamed the Ajuinen, the onions, for generations.",
    },
    {
      kind: "fact",
      title: "Why onion, why now",
      points: [
        "Onion shampoo became a social-media trend in 2025 and was picked up by mainstream lifestyle press.",
        "Most onion shampoos are sold on hair-growth promises. The science doesn't support that: there is one small 2002 study on raw onion juice for a medical condition, and nothing on shampoo.",
        "Our angle: loud and fun on the outside, honest on the inside. We sell a good cosmetic shampoo with a story, not a cure.",
      ],
      sources: [
        { label: "NBC Select, Aug 2025", url: "https://www.nbcnews.com/select/shopping/onion-shampoo-for-healthy-hair-rcna222479" },
        { label: "Marie Claire UK", url: "https://www.marieclaire.co.uk/beauty/onion-shampoo" },
      ],
    },
    {
      kind: "fact",
      title: "Where we are today",
      points: [
        "Brand name and logo: done.",
        "Webshop: built and online as a preview, in Dutch, French, English and Italian. Payments and email are built in and switched off until launch.",
        "Manufacturing: a shortlist of three Belgian contract labs. None contracted yet.",
        "Product: not yet formulated.",
        "Sales: none yet.",
      ],
    },
    {
      kind: "fact",
      title: "How it gets made",
      points: [
        "We don't manufacture. A Belgian contract lab develops the formula and produces it.",
        "An EU Responsible Person (the lab or a specialised firm) handles the safety assessment, the product file and the EU notification.",
        "On our shortlist, the smallest custom batches start at 100 to 250 units. First stock is cheap, and we can test demand before scaling.",
      ],
    },
    {
      kind: "plan",
      title: "Going to market",
      points: [
        "Sell direct through our own webshop in Belgium, the Netherlands, France and Italy.",
        "Launch around Aalst carnival, 7 to 9 February 2027, where the brand's story is strongest.",
        "Then local shops and hairdressers in and around Aalst.",
      ],
    },
    {
      kind: "open",
      title: "What we don't know yet",
      points: [
        "Market size: we haven't sized it with reliable data yet.",
        "Unit cost and retail price: these depend on the lab quotes we're collecting now.",
        "Demand: untested until the first batch sells.",
      ],
    },
    {
      kind: "plan",
      title: "The next steps",
      steps: [
        "Collect quotes and choose the contract lab.",
        "Develop the formula; safety assessment and EU notification.",
        "Produce a first small batch and take product photos.",
        "Switch on payments and open the webshop.",
        "Measure sales and repeat purchases, then decide on volume and retail.",
      ],
    },
    {
      kind: "fact",
      title: "Team",
      body:
        "Jochen Gyssels, founder. Freelance IT engineer and AI consultant, co-founder of the Odoo consultancy NexDooo, formerly Belgium unit manager at CTG. Works in Dutch, French, English and Italian, the four languages of our markets.",
    },
  ],
  ask: null,
};

const fr: Pitch = {
  title: "Ajoin & Shine",
  subtitle: "Un shampooing à l'oignon avec une âme de carnaval.",
  date: "Présentation investisseurs · octobre 2026",
  honesty:
    "Nous n'avons pas encore lancé. Tout ce qui figure sur cette page est vrai aujourd'hui. Quand il s'agit d'un projet, c'est indiqué.",
  labels: {
    fact: "Aujourd'hui",
    plan: "Projet",
    open: "Question ouverte",
    sources: "Sources",
    contact: "Parlons-en",
    contactBody: "Des questions, ou envie de connaître les détails derrière une diapositive ? Contactez-nous.",
  },
  slides: [
    {
      kind: "fact",
      title: "L'idée",
      body:
        "Un seul produit : un shampooing à l'extrait d'oignon. Une seule marque, construite sur la culture du carnaval d'Alost, dont les habitants sont surnommés les Ajuinen, les oignons, depuis des générations.",
    },
    {
      kind: "fact",
      title: "Pourquoi l'oignon, pourquoi maintenant",
      points: [
        "Le shampooing à l'oignon est devenu une tendance sur les réseaux sociaux en 2025 et a été repris par la presse lifestyle grand public.",
        "La plupart des shampooings à l'oignon sont vendus sur des promesses de pousse des cheveux. La science ne le confirme pas : il existe une seule petite étude de 2002 sur le jus d'oignon cru pour une affection médicale, et rien sur le shampooing.",
        "Notre angle : bruyant et festif à l'extérieur, honnête à l'intérieur. Nous vendons un bon shampooing cosmétique avec une histoire, pas un remède.",
      ],
      sources: [
        { label: "NBC Select, août 2025", url: "https://www.nbcnews.com/select/shopping/onion-shampoo-for-healthy-hair-rcna222479" },
        { label: "Marie Claire UK", url: "https://www.marieclaire.co.uk/beauty/onion-shampoo" },
      ],
    },
    {
      kind: "fact",
      title: "Où nous en sommes aujourd'hui",
      points: [
        "Nom de marque et logo : faits.",
        "Boutique en ligne : construite et en ligne sous forme d’aperçu, en néerlandais, français, anglais et italien. Les paiements et les e-mails sont intégrés et désactivés jusqu'au lancement.",
        "Fabrication : une liste restreinte de trois laboratoires belges de sous-traitance. Aucun contrat signé pour l'instant.",
        "Produit : pas encore formulé.",
        "Ventes : aucune pour l'instant.",
      ],
    },
    {
      kind: "fact",
      title: "Comment il est fabriqué",
      points: [
        "Nous ne fabriquons pas nous-mêmes. Un laboratoire belge de sous-traitance développe la formule et la produit.",
        "Une personne responsable dans l'UE (le laboratoire ou une société spécialisée) se charge de l'évaluation de la sécurité, du dossier produit et de la notification européenne.",
        "Sur notre liste restreinte, les plus petits lots sur mesure commencent à 100 à 250 unités. Le premier stock coûte peu, et nous pouvons tester la demande avant de monter en volume.",
      ],
    },
    {
      kind: "plan",
      title: "La mise sur le marché",
      points: [
        "Vendre en direct via notre propre boutique en ligne en Belgique, aux Pays-Bas, en France et en Italie.",
        "Lancer autour du carnaval d'Alost, du 7 au 9 février 2027, là où l'histoire de la marque est la plus forte.",
        "Ensuite, les commerces locaux et les coiffeurs à Alost et dans les environs.",
      ],
    },
    {
      kind: "open",
      title: "Ce que nous ne savons pas encore",
      points: [
        "Taille du marché : nous ne l'avons pas encore évaluée avec des données fiables.",
        "Coût unitaire et prix de vente : ils dépendent des devis de laboratoires que nous rassemblons en ce moment.",
        "Demande : non testée tant que le premier lot n'est pas vendu.",
      ],
    },
    {
      kind: "plan",
      title: "Les prochaines étapes",
      steps: [
        "Rassembler les devis et choisir le laboratoire de sous-traitance.",
        "Développer la formule ; évaluation de la sécurité et notification européenne.",
        "Produire un premier petit lot et réaliser les photos du produit.",
        "Activer les paiements et ouvrir la boutique en ligne.",
        "Mesurer les ventes et les achats répétés, puis décider des volumes et de la distribution en magasin.",
      ],
    },
    {
      kind: "fact",
      title: "Équipe",
      body:
        "Jochen Gyssels, fondateur. Ingénieur IT freelance et consultant en IA, cofondateur du cabinet de conseil Odoo NexDooo, ancien unit manager Belgique chez CTG. Travaille en néerlandais, français, anglais et italien, les quatre langues de nos marchés.",
    },
  ],
  ask: null,
};

const nl: Pitch = {
  title: "Ajoin & Shine",
  subtitle: "Een ajuinshampoo met een carnavalsziel.",
  date: "Investeerdersoverzicht · oktober 2026",
  honesty:
    "We zijn nog niet gelanceerd. Alles op deze pagina is vandaag waar. Waar iets een plan is, staat dat erbij.",
  labels: {
    fact: "Vandaag",
    plan: "Plan",
    open: "Open vraag",
    sources: "Bronnen",
    contact: "Praat met ons",
    contactBody: "Vragen, of wil je de details achter een slide? Neem contact op.",
  },
  slides: [
    {
      kind: "fact",
      title: "Het idee",
      body:
        "Eén product: een shampoo met ajuinextract. Eén merk, gebouwd op de carnavalscultuur van Aalst, waar de inwoners al generaties lang de Ajuinen worden genoemd.",
    },
    {
      kind: "fact",
      title: "Waarom ajuin, waarom nu",
      points: [
        "Ajuinshampoo werd in 2025 een trend op sociale media en werd opgepikt door de mainstream lifestylepers.",
        "De meeste ajuinshampoos worden verkocht met beloftes over haargroei. De wetenschap ondersteunt dat niet: er is één kleine studie uit 2002 over rauw ajuinsap voor een medische aandoening, en niets over shampoo.",
        "Onze invalshoek: luid en leuk aan de buitenkant, eerlijk aan de binnenkant. We verkopen een goede cosmetische shampoo met een verhaal, geen wondermiddel.",
      ],
      sources: [
        { label: "NBC Select, aug. 2025", url: "https://www.nbcnews.com/select/shopping/onion-shampoo-for-healthy-hair-rcna222479" },
        { label: "Marie Claire UK", url: "https://www.marieclaire.co.uk/beauty/onion-shampoo" },
      ],
    },
    {
      kind: "fact",
      title: "Waar we vandaag staan",
      points: [
        "Merknaam en logo: klaar.",
        "Webshop: gebouwd en online als preview, in het Nederlands, Frans, Engels en Italiaans. Betalingen en e-mail zijn ingebouwd en staan uit tot de lancering.",
        "Productie: een shortlist van drie Belgische contractlabs. Nog met geen enkel een contract.",
        "Product: nog niet geformuleerd.",
        "Verkoop: nog geen.",
      ],
    },
    {
      kind: "fact",
      title: "Hoe het gemaakt wordt",
      points: [
        "We produceren niet zelf. Een Belgisch contractlab ontwikkelt de formule en produceert ze.",
        "Een verantwoordelijke persoon in de EU (het lab of een gespecialiseerd bedrijf) zorgt voor de veiligheidsbeoordeling, het productdossier en de EU-notificatie.",
        "Op onze shortlist beginnen de kleinste batches op maat bij 100 tot 250 stuks. De eerste voorraad is goedkoop, en we kunnen de vraag testen voor we opschalen.",
      ],
    },
    {
      kind: "plan",
      title: "Naar de markt",
      points: [
        "Rechtstreeks verkopen via onze eigen webshop in België, Nederland, Frankrijk en Italië.",
        "Lanceren rond Aalst carnaval, 7 tot 9 februari 2027, waar het verhaal van het merk het sterkst is.",
        "Daarna lokale winkels en kappers in en rond Aalst.",
      ],
    },
    {
      kind: "open",
      title: "Wat we nog niet weten",
      points: [
        "Marktomvang: die hebben we nog niet met betrouwbare data ingeschat.",
        "Kostprijs per stuk en verkoopprijs: die hangen af van de offertes van labs die we nu verzamelen.",
        "Vraag: niet getest tot de eerste batch verkocht is.",
      ],
    },
    {
      kind: "plan",
      title: "De volgende stappen",
      steps: [
        "Offertes verzamelen en het contractlab kiezen.",
        "De formule ontwikkelen; veiligheidsbeoordeling en EU-notificatie.",
        "Een eerste kleine batch produceren en productfoto's maken.",
        "Betalingen aanzetten en de webshop openen.",
        "Verkoop en herhaalaankopen meten, dan beslissen over volume en verkoop via winkels.",
      ],
    },
    {
      kind: "fact",
      title: "Team",
      body:
        "Jochen Gyssels, oprichter. Freelance IT-engineer en AI-consultant, medeoprichter van het Odoo-consultancybedrijf NexDooo, voormalig unit manager België bij CTG. Werkt in het Nederlands, Frans, Engels en Italiaans, de vier talen van onze markten.",
    },
  ],
  ask: null,
};

const it: Pitch = {
  title: "Ajoin & Shine",
  subtitle: "Uno shampoo alla cipolla con un'anima di carnevale.",
  date: "Presentazione per investitori · ottobre 2026",
  honesty:
    "Non abbiamo ancora lanciato. Tutto ciò che c'è in questa pagina è vero oggi. Quando qualcosa è un piano, lo diciamo.",
  labels: {
    fact: "Oggi",
    plan: "Piano",
    open: "Domanda aperta",
    sources: "Fonti",
    contact: "Parliamone",
    contactBody: "Domande, o vuoi i dettagli dietro una slide? Contattaci.",
  },
  slides: [
    {
      kind: "fact",
      title: "L'idea",
      body:
        "Un solo prodotto: uno shampoo con estratto di cipolla. Un solo marchio, costruito sulla cultura del carnevale di Aalst, dove gli abitanti sono soprannominati da generazioni gli Ajuinen, le cipolle.",
    },
    {
      kind: "fact",
      title: "Perché la cipolla, perché adesso",
      points: [
        "Nel 2025 lo shampoo alla cipolla è diventato una tendenza sui social ed è stato ripreso dalla stampa lifestyle generalista.",
        "La maggior parte degli shampoo alla cipolla viene venduta con promesse di crescita dei capelli. La scienza non lo conferma: esiste un solo piccolo studio del 2002 sul succo di cipolla crudo per una condizione medica, e nulla sullo shampoo.",
        "Il nostro approccio: chiassoso e divertente fuori, onesto dentro. Vendiamo un buon shampoo cosmetico con una storia, non una cura.",
      ],
      sources: [
        { label: "NBC Select, ago 2025", url: "https://www.nbcnews.com/select/shopping/onion-shampoo-for-healthy-hair-rcna222479" },
        { label: "Marie Claire UK", url: "https://www.marieclaire.co.uk/beauty/onion-shampoo" },
      ],
    },
    {
      kind: "fact",
      title: "A che punto siamo oggi",
      points: [
        "Nome del marchio e logo: fatti.",
        "Negozio online: realizzato e online in anteprima, in olandese, francese, inglese e italiano. Pagamenti ed e-mail sono integrati e disattivati fino al lancio.",
        "Produzione: una rosa di tre laboratori conto terzi belgi. Nessun contratto ancora firmato.",
        "Prodotto: non ancora formulato.",
        "Vendite: ancora nessuna.",
      ],
    },
    {
      kind: "fact",
      title: "Come viene prodotto",
      points: [
        "Non produciamo noi. Un laboratorio conto terzi belga sviluppa la formula e la produce.",
        "Una persona responsabile nell'UE (il laboratorio o una società specializzata) si occupa della valutazione della sicurezza, del fascicolo del prodotto e della notifica UE.",
        "Nella nostra rosa, i lotti personalizzati più piccoli partono da 100-250 unità. Il primo stock costa poco e possiamo testare la domanda prima di aumentare i volumi.",
      ],
    },
    {
      kind: "plan",
      title: "Andare sul mercato",
      points: [
        "Vendere direttamente tramite il nostro negozio online in Belgio, Paesi Bassi, Francia e Italia.",
        "Lanciare in occasione del carnevale di Aalst, dal 7 al 9 febbraio 2027, quando la storia del marchio è più forte.",
        "Poi negozi locali e parrucchieri ad Aalst e dintorni.",
      ],
    },
    {
      kind: "open",
      title: "Cosa non sappiamo ancora",
      points: [
        "Dimensione del mercato: non l'abbiamo ancora stimata con dati affidabili.",
        "Costo unitario e prezzo al pubblico: dipendono dai preventivi dei laboratori che stiamo raccogliendo ora.",
        "Domanda: non verificata finché il primo lotto non sarà venduto.",
      ],
    },
    {
      kind: "plan",
      title: "I prossimi passi",
      steps: [
        "Raccogliere i preventivi e scegliere il laboratorio conto terzi.",
        "Sviluppare la formula; valutazione della sicurezza e notifica UE.",
        "Produrre un primo piccolo lotto e scattare le foto del prodotto.",
        "Attivare i pagamenti e aprire il negozio online.",
        "Misurare vendite e riacquisti, poi decidere su volumi e vendita al dettaglio.",
      ],
    },
    {
      kind: "fact",
      title: "Team",
      body:
        "Jochen Gyssels, fondatore. Ingegnere IT freelance e consulente di intelligenza artificiale, cofondatore della società di consulenza Odoo NexDooo, già unit manager per il Belgio presso CTG. Lavora in olandese, francese, inglese e italiano, le quattro lingue dei nostri mercati.",
    },
  ],
  ask: null,
};

export const pitch: Partial<Record<Locale, Pitch>> & { en: Pitch } = { en, fr, nl, it };
