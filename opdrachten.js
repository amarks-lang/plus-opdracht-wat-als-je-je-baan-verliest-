// Overzicht van alle plus-opdrachten, met het nakijkmodel voor de leerkracht.
// Een nieuwe opdracht toevoegen = een nieuw .html-bestand + een blok hieronder.

export const OPDRACHTEN = [
  {
    id: "ww-urk",
    titel: "Wat als je je baan kwijtraakt?",
    bij: "Les over de vissers van Urk (Zuiderzee / Afsluitdijk)",
    bestand: "ww-urk.html",
    onderdelen: [
      { id: "a", kort: "a", vraag: "Hoe heet het geld dat je kunt krijgen als je even geen werk hebt?",
        model: "WW-uitkering (werkloosheidsuitkering). WW = Werkloosheidswet." },
      { id: "b", kort: "b", vraag: "Noem minstens twee eisen om een WW-uitkering te krijgen.",
        model: "Twee van: niet je eigen schuld · minstens 5 werkuren per week kwijt · 26 van de afgelopen 36 weken gewerkt · beschikbaar voor ander werk · alles gedaan om WW te voorkomen." },
      { id: "c", kort: "c", vraag: "Waar moet je een WW-uitkering aanvragen?",
        model: "Bij het UWV (online via werk.nl)." },
      { id: "d", kort: "d", vraag: "Hoelang duurt een WW-uitkering maximaal?",
        model: "Maximaal 24 maanden (minimaal 3 maanden)." },
      { id: "e", kort: "e", vraag: "Hoe hoog is een WW-uitkering?",
        model: "Eerste 2 maanden 75% van je loon, daarna 70%." },
      { id: "f", kort: "f", vraag: "Welke uitkering als je geen recht (meer) hebt op WW?",
        model: "Bijstandsuitkering, aanvragen bij de gemeente." },
      { id: "r1", kort: "75%", reken: true, vraag: "Klaas verdiende € 2.000. Eerste 2 maanden 75%: hoeveel per maand?",
        model: "€ 1.500" },
      { id: "r2", kort: "70%", reken: true, vraag: "Vanaf maand 3 70%: hoeveel per maand?",
        model: "€ 1.400" },
      { id: "r3", kort: "€ tot.", reken: true, vraag: "Totaal in de eerste 3 maanden?",
        model: "€ 4.400 (1.500 + 1.500 + 1.400)" },
      { id: "d1", kort: "denk 1", open: true, vraag: "Waarom krijgt Klaas geen 100% van zijn loon?",
        model: "Eigen mening. Bijv.: zodat werken loont en je weer werk gaat zoeken; het moet betaalbaar blijven voor iedereen." },
      { id: "d2", kort: "denk 2", open: true, vraag: "Jij bent visser op Urk in 1932. Wat zou jij doen en waarom?",
        model: "Eigen mening met een reden (ander werk, Noordzee, verhuizen ...)." }
    ]
  }
];
