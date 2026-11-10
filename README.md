# Fotolibro Studio

Strumento per creare fotolibri in modo automatico e veloce partendo dalle cartelle del computer.
Gira interamente nel browser (Chrome o Edge su desktop): le foto non vengono caricate da nessuna parte.

**Per usarlo:** online su Netlify, oppure in locale con `node build.mjs` e poi doppio clic su `dist/fotolibro-studio.html`.
Accanto all'app devono stare `fotolibro-effetti.js` (pagina effetto) e `fotolibro-cmyk.js` (copertina CMYK): si caricano solo quando servono.
(Serve internet solo per scaricare i caratteri tipografici la prima volta.)

## Come si lavora

1. **Le foto** – scegli o trascina una cartella. Le sottocartelle diventano capitoli, le foto si ordinano per data di scatto (EXIF), i doppioni e le raffiche vengono riconosciuti.
2. **Il tema** – Neutro bianco, Avorio elegante, Nero galleria, Natale, Natale nordico, San Valentino, Festa del papà, Festa della mamma, Compleanno, Pasqua, Matrimonio, Nascita (azzurro / rosa), Estate e viaggi, Laurea, Autunno.
3. **Formato e testi** – profilo di stampa, titolo, sottotitolo, dedica → **Crea il fotolibro** (o Ctrl+Invio).

Mentre importi, l'app propone da sola, senza mai sovrascrivere quello che scegli o scrivi tu:
- **il tema**, dal nome delle cartelle («Matrimonio…», «Natale 2025», «Mare 2024», «Battesimo di Sofia»…) oppure dalle date di scatto (dicembre, San Valentino, Pasqua, estate…). Il tema consigliato ha l'etichetta «Consigliato»;
- **il titolo**, dal nome della cartella principale, se non è generico («DCIM», «Foto», «Download»…);
- **il sottotitolo**, dalle date: «14 giugno 2025», «Giugno 2025», «2024 – 2025».

La barra in basso resta sempre visibile e mostra il riepilogo (foto, capitoli, tema, pagine stimate, formato) con il pulsante per creare il libro. Durante l'importazione indica l'avanzamento.

Dopo la creazione, una barra in alto suggerisce i passi successivi: scegliere la copertina, sfogliare il libro, preparare la bozza per il cliente o i file per la stampa. Se ci sono foto a bassa risoluzione o testi vicini al taglio, lo segnala lì.

Poi tutto è modificabile nell'editor:

| Pannello | Cosa fa |
|---|---|
| Foto | libreria, capitoli, preferite ★, scatti simili |
| Tema | cambia tema in un clic; per ogni tema 8 proposte di copertina (7 impaginazioni × 5 sfondi: motivo, tinta, chiaro, motivo fitto, foto sfocata); 10 varianti di risguardi più quelli di tutti gli altri temi, anche diversi davanti e dietro; colori, caratteri, decorazioni, spaziature |
| Pagine | pagine speciali (frase, frase su colore, frase con cornice, frase sulla foto, foto e frase, collage con sticker, dedica, titolo), pagina effetto, sticker tra le foto |
| Layout | layout per pagina ordinati per adattamento alle foto, riquadri liberi |
| Testo | titoli, dediche, didascalie già nello stile del tema |
| Decori | 43 motivi vettoriali (fiocchi, agrifoglio, cuori, cravatte, baffi, fiori, palloncini…) da aggiungere, spostare, colorare |
| Libro | profili tipografia, formato, copertina (dorso, cartone, risvolto), **risguardi**, abbondanza e zone di sicurezza |

Ogni foto può avere forma (rettangolo, arrotondato, ovale, arco, cuore) e bordo propri.

## Pagine speciali

- **Frasi e citazioni** per ogni tema (scritte apposta o di autori classici), inserite in automatico tra i capitoli o a mano.
- **Sticker a tema** con bordo bianco fustellato e scritte ("Ho ho ho!", "Super papà", "Ti amo"…), sugli angoli delle foto.
- **Pagina effetto**: il programma analizza le foto migliori, riconosce persone e animali (modello DeepLab v3 di MediaPipe,
  eseguito nel browser), scontorna il soggetto e crea una doppia pagina con effetto "fuori cornice", sticker del soggetto e
  bianco e nero con soggetto a colori. Al massimo una per libro; se nessuna foto è adatta non viene creata.
- **Le foto non si perdono**: sostituendo, svuotando o eliminando una pagina, le sue foto vengono ridistribuite nelle pagine vicine.

## Sticker illustrati

Gli SVG nelle cartelle `stickers <tema>` (per ora `stickers natale/`: 12 «Cartoon» e 12 «Disegnati a mano») entrano nell'app con la build, già ripuliti.
- **Temi Natale e Natale nordico**: gli sticker automatici tra le foto sono questi disegni, con qualche scritta ogni tanto. Con «Tutti» ogni doppia pagina usa una sola serie, a turno; nel pannello Pagine si può scegliere una serie sola. «Rimescola gli sticker» cambia la disposizione e lascia quelli messi a mano.
- **Pannello Decori**: tutti gli sticker, filtrabili per serie. Clic per aggiungerne uno, oppure trascinalo sul foglio. Uno sticker selezionato si ingrandisce, ruota, specchia o sostituisce con un altro.
- **Libri salvati prima**: nel progetto è salvato solo il riferimento allo sticker, il disegno sta nell'app. Riaprendo un libro di Natale fatto prima di questi sticker, l'app propone una sola volta di inserirli: «Metti gli sticker» sostituisce solo quelli automatici, «Li scelgo io» apre il pannello Decori, «No, grazie» non lo chiede più. Con Ctrl+Z si annulla tutto.
- **Nuove serie**: basta aggiungere SVG in `stickers natale/`, oppure una cartella `stickers <tema>`, e rifare la build (anche Netlify la rifà a ogni push). I nomi italiani si danno in `src/js/48-art.js`, dove si indica anche a quali temi appartiene una cartella.

## Struttura del libro

`Copertina (pag. 1 e ultima)` → `Risguardo anteriore (pag. 2–3)` → `pag. 4 (retro del risguardo)` → `Interno` → `terzultima (retro del risguardo)` → `Risguardo posteriore (penultime due)`

I risguardi sono fogli a parte, di default **650 × 330 mm**, con piega al centro. Nel pannello *Libro* si impostano
larghezza, altezza, posizione della piega, abbondanza e la zona visibile a libro finito (riquadro verde nell'editor).

## Esportazione

**1 · Bozza per il cliente** (pulsante *Bozza cliente*)
- PDF leggero (doppie pagine o pagine singole) con filigrana "BOZZA" facoltativa
- Flipbook sfogliabile: un unico file `.html` da inviare, si apre offline su computer, tablet e telefono, con pagine che si girano, indice e schermo intero
- *Sfoglia* mostra subito l'anteprima del flipbook dentro l'app

**2 · File per la stampa** (pulsante *Stampa*)
- `…_copertina_CMYK-FOGRA39.jpg` – JPEG CMYK 300 dpi, profilo ISO Coated v2 (ECI) per FOGRA39 incorporato
  (conversione con littleCMS, colorimetrico relativo + compensazione del punto nero), retro + dorso + fronte con risvolto e abbondanza
- `…_risguardi.pdf` – 4 pagine sul foglio dei risguardi: 1) pag. 2–3 · 2) pag. 4 sul lato sinistro · 3) terzultima sul lato destro · 4) penultime due
  (i lati delle pagine singole si possono cambiare)
- `…_interno.pdf` – tutto il resto, 300 dpi
- in alternativa JPEG RGB/PDF per la copertina e JPEG per gli altri file; crocini; zip con scheda tecnica

Prima dell'export vengono segnalati: testi a rischio taglio, foto sotto i 200 dpi, riquadri vuoti, foto da ricollegare, pagine non multiple di 4.

## Progetti

Il lavoro si salva da solo nel browser. *Salva* scarica un file `.fotolibro.json`: riaprendolo basta riselezionare la cartella
per ricollegare gli originali (riconosciuti dal nome).

## Sviluppo

```
src/index.html        markup
src/css/app.css       stile
src/js/*.js           moduli (caricati in ordine)
  10-motifs.js        motivi decorativi vettoriali e pattern
  11-themes.js        temi
  20-state.js         modello del libro e geometria (copertina, risguardi, interno)
  45-auto.js          impaginazione automatica, copertine e decorazioni a tema
  82-export.js        bozza e file di stampa
  85-flipbook.js      flipbook HTML
node build.mjs        → dist/fotolibro-studio.html (file unico)
node tests/smoke.mjs  prova automatica (temi + tutte le esportazioni)
node tests/flow.mjs <out> <cartella>   prova con una cartella vera
node tests/flow2.mjs <out> <cartella>  pagine speciali, effetto, export di stampa
node tests/stickers.mjs <out> <cartella> sticker SVG: creazione, pannello, libri salvati prima, export
node tests/full.mjs <out> <cartella>   controllo completo: creazione guidata, 16 temi, pagine speciali senza perdita di foto,
                                       conferma e annullamento, tastiera, export, salva/riapri, finestre da 1024 a 1920 px
```
Durante lo sviluppo si può aprire direttamente `src/index.html`.

## Licenze di terze parti

- Profilo ICC ISO Coated v2 (ECI) – © Heidelberger Druckmaschinen AG, distribuito senza modifiche con la sua licenza (`vendor/icc/`, `dist/LICENZE.txt`)
- @mediapipe/tasks-vision e modello DeepLab v3 – Apache License 2.0 (`vendor/mediapipe/`)
- Encoder JPEG derivato da jpeg-js / Adobe as3corelib – licenza BSD (vedi `src/js/81-cmyk.js`)

## Design e MCP UI/UX

Nel file `.mcp.json` è registrato il server MCP **ui-ux-pro-mcp** (`npx -y ui-ux-pro-mcp@1.5.0 --stdio`), costruito sul database di *ui-ux-pro-max*: stili, palette, abbinamenti di caratteri e linee guida UX. Claude Code lo propone all'apertura del progetto.

Dalle sue raccomandazioni arrivano:
- la palette "gallery neutral" per i prodotti fotografici, con contrasti AA verificati anche in modalità scura;
- i titoli in Playfair Display con il testo in Inter;
- i bersagli cliccabili di almeno 24 px;
- gli stati di hover, focus e disabilitato;
- i toast con il pulsante "Annulla";
- il rispetto di `prefers-reduced-motion`.
