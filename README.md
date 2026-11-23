# Plus-opdrachten

Webpaden met plus-opdrachten voor groep 5/6 (De Linde). Leerlingen typen een **klascode** in en maken zelf een login aan met **hun voornaam en een geheime code van 4 cijfers**. Hun werk wordt automatisch bewaard in Firebase, zodat ze later verder kunnen. De leerkracht kijkt na in `leerkracht.html`.

| Bestand | Wat |
|---|---|
| `index.html` | Menu met alle plus-opdrachten |
| `ww-urk.html` | Opdracht "Wat als je je baan kwijtraakt?" (Nibud, WW-uitkering) |
| `leerkracht.html` | Nakijkoverzicht, feedback geven en klassen beheren (Google-login) |
| `firebase.js` | Koppeling met Firebase: **hier komt de config in** |
| `opdrachten.js` | Lijst met opdrachten + het nakijkmodel |
| `firestore.rules` | Beveiliging van de database |
| `stijl.css` | Opmaak in De Linde-kleuren |

Zolang er geen config in `firebase.js` staat, draait alles in **demo-modus** (klascode `demo`, alleen in je eigen browser).

## Koppelen aan Firebase

1. **Firebase-project**: maak op console.firebase.google.com een nieuw project aan, bijv. `plusopdrachten`. Google Analytics mag uit.
2. **Firestore**: ga naar Build → Firestore Database → Database maken. Kies de locatie `eur3 (europe-west)` en de productiemodus.
3. **Regels**: open het tabblad Rules en plak `firestore.rules` erin. Vervang `jouw.naam@levwn.nl` door je eigen schoolaccount. Klik op Publiceren.
4. **Authentication**: ga naar Build → Authentication → Aan de slag en zet bij Sign-in method **Anoniem** en **Google** aan.
5. **Geautoriseerde domeinen**: voeg bij Authentication → Settings → Authorized domains `amarks-lang.github.io` toe.
6. **Web-app**: kies Projectinstellingen → Je apps → Web (`</>`). Kopieer de `firebaseConfig` naar `firebase.js` en zet daar ook je e-mailadres in `LEERKRACHTEN`.
7. **GitHub Pages**: zet in de repo Settings → Pages op `main` / `root`.
8. **Klas aanmaken**: open `…/leerkracht.html`, log in en ga naar Klassen → Nieuwe klas. Je hoeft alleen een naam te geven, dan krijg je de klascode te zien. Leerlingen maken daarna zelf hun login aan.
9. **Delen**: zet de link naar `ww-urk.html` in Yurls en geef de klas de klascode.

## Privacy (AVG)
- Er worden alleen voornamen en antwoorden opgeslagen, in de EU-regio.
- Leerlingen hebben geen account en geen e-mailadres nodig.
- Leerlingen kunnen geen klassenlijsten, namen of codes opvragen en geen feedback van de leerkracht aanpassen.
- Werk opslaan gebeurt onder een hash van klas + naam + code. Zonder de code van een klasgenoot kun je diens werk dus niet openen.
- Elke naam kan maar één keer per klas bestaan. Zijn er twee kinderen met dezelfde naam, dan zet de tweede er een letter achter (bijv. "Sem B").
- Code vergeten? De leerkracht ziet alle codes bij Klassen → (klas) → Leerlingen. Verwijder je daar een leerling, dan worden ook diens antwoorden verwijderd en is de naam weer vrij.

## Nieuwe plus-opdracht toevoegen
Kopieer `ww-urk.html` naar een nieuw bestand, pas de vragen en de `OPDRACHT`-id aan en voeg een blok toe aan `opdrachten.js`. Database, login en leerkrachtpagina werken dan meteen mee.
