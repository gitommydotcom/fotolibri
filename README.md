# Fotolibro Studio

Strumento per creare fotolibri in modo automatico e veloce partendo dalle cartelle del computer.
Gira interamente nel browser (Chrome o Edge su desktop): le foto non vengono caricate da nessuna parte.

**Per usarlo:** apri `dist/fotolibro-studio.html` con doppio clic.
(Serve internet solo per scaricare i caratteri tipografici la prima volta.)

## Come si lavora

1. **Le foto** – scegli o trascina una cartella. Le sottocartelle diventano capitoli, le foto si ordinano per data di scatto (EXIF), i doppioni e le raffiche vengono riconosciuti.
2. **Il tema** – Neutro bianco, Avorio elegante, Nero galleria, Natale, Natale nordico, San Valentino, Festa del papà, Festa della mamma, Compleanno, Pasqua, Matrimonio, Nascita (azzurro / rosa), Estate e viaggi, Laurea, Autunno.
3. **Formato e testi** – profilo di stampa, titolo, sottotitolo, dedica → **Crea il fotolibro**.

Poi tutto è modificabile nell'editor:

| Pannello | Cosa fa |
|---|---|
| Foto | libreria, capitoli, preferite ★, scatti simili |
| Tema | cambia tema in un clic, stile di copertina (foto piena, incorniciata, arco, cerchio, cuore, collage, solo titolo), colori, caratteri, livello decorazioni, spaziature e cornici, sfondo per singola doppia pagina |
| Layout | layout per pagina ordinati per adattamento alle foto, riquadri liberi |
| Testo | titoli, dediche, didascalie già nello stile del tema |
| Decori | 43 motivi vettoriali (fiocchi, agrifoglio, cuori, cravatte, baffi, fiori, palloncini…) da aggiungere, spostare, colorare |
| Libro | profili tipografia, formato, copertina (dorso, cartone, risvolto), **risguardi**, abbondanza e zone di sicurezza |

Ogni foto può avere forma (rettangolo, arrotondato, ovale, arco, cuore) e bordo propri.

## Struttura del libro

`Copertina (retro · dorso · fronte)` → `Risguardo anteriore (pag. 2)` → `Interno` → `Risguardo posteriore (penultima)`

I risguardi sono fogli a parte, di default **650 × 330 mm**, con piega al centro. Nel pannello *Libro* si impostano
larghezza, altezza, posizione della piega, abbondanza e la zona visibile a libro finito (riquadro verde nell'editor).

## Esportazione

**1 · Bozza per il cliente** (pulsante *Bozza cliente*)
- PDF leggero (doppie pagine o pagine singole) con filigrana "BOZZA" facoltativa
- Flipbook sfogliabile: un unico file `.html` da inviare, si apre offline su computer, tablet e telefono, con pagine che si girano, indice e schermo intero
- *Sfoglia* mostra subito l'anteprima del flipbook dentro l'app

**2 · File per la stampa** (pulsante *Stampa*)
- `…_copertina.pdf` – retro + dorso + fronte con risvolto e abbondanza
- `…_risguardi.pdf` – 2 fogli (anteriore e posteriore)
- `…_interno.pdf` – pagine singole o doppie, anche solo un intervallo
- PDF con TrimBox/BleedBox, oppure JPEG in `.zip`; 200/300/400 dpi; crocini di taglio e piega; zip unico con scheda tecnica

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
```
Durante lo sviluppo si può aprire direttamente `src/index.html`.
