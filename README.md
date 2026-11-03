# Fotolibro Studio

Strumento per creare fotolibri in modo automatico e veloce partendo dalle cartelle del computer.
Gira interamente nel browser (Chrome o Edge su desktop): le foto non vengono caricate da nessuna parte.

**Per usarlo:** online su Netlify, oppure in locale con `node build.mjs` e poi doppio clic su `dist/fotolibro-studio.html`.
Accanto all'app devono stare `fotolibro-effetti.js` (pagina effetto) e `fotolibro-cmyk.js` (copertina CMYK): si caricano solo quando servono.
(Serve internet solo per scaricare i caratteri tipografici la prima volta.)

## Come si lavora

1. **Le foto** – scegli o trascina una cartella. Le sottocartelle diventano capitoli, le foto si ordinano per data di scatto (EXIF), i doppioni e le raffiche vengono riconosciuti.
2. **Il tema** – Neutro bianco, Avorio elegante, Nero galleria, Natale, Natale nordico, San Valentino, Festa del papà, Festa della mamma, Compleanno, Pasqua, Matrimonio, Nascita (azzurro / rosa), Estate e viaggi, Laurea, Autunno.
3. **Formato e testi** – profilo di stampa, titolo, sottotitolo, dedica → **Crea il fotolibro**.

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
```
Durante lo sviluppo si può aprire direttamente `src/index.html`.

## Licenze di terze parti

- Profilo ICC ISO Coated v2 (ECI) – © Heidelberger Druckmaschinen AG, distribuito senza modifiche con la sua licenza (`vendor/icc/`, `dist/LICENZE.txt`)
- @mediapipe/tasks-vision e modello DeepLab v3 – Apache License 2.0 (`vendor/mediapipe/`)
- Encoder JPEG derivato da jpeg-js / Adobe as3corelib – licenza BSD (vedi `src/js/81-cmyk.js`)
