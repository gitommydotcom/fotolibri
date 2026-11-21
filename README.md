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

Dopo la creazione, una riga in alto dice che il libro è pronto, segnala foto a bassa risoluzione o testi vicini al taglio e porta alla scelta della copertina.

### L'editor

L'interfaccia mostra solo l'essenziale; tutto il resto è a un clic, nelle sezioni richiudibili (▸) di ogni pannello, che restano aperte finché non le chiudi.

- **Barra in alto**: nome del libro, menu *Progetto* (nuovo, apri, schermata iniziale, rifai in automatico, scorciatoie), *Salva*, Annulla/Ripeti, *Anteprima* (il libro sfogliabile) ed *Esporta* (bozza per il cliente o file per la tipografia).
- **Sopra il foglio**: la doppia pagina aperta con le frecce, *+ Pagine* e il menu **⋯** (duplica, unisci/separa le due pagine, svuota, elimina; sulla copertina: rigenera dal tema).
- **In basso a destra sul foglio**: zoom e ⛶ «solo il libro» (tasto F).
- **Pannello destro**: senza selezione propone le azioni utili per quelle pagine; con una foto, un testo o uno sticker selezionato mostra i suoi comandi principali, e i dettagli (colore e tono, inquadratura precisa, forma e bordo, posizione esatta, effetti del testo…) nelle sezioni richiudibili.
- **Spostare e ridimensionare i riquadri**: pulsante «Sposta o ridimensiona il riquadro» nel pannello della foto (o tasto M); sopra il foglio compare «Modifica riquadri · Fine».
- Tasto **?**: tutte le scorciatoie e i gesti.

| Scheda | In vista | Nelle sezioni richiudibili |
|---|---|---|
| Foto | aggiungi foto o cartelle, filtri Tutte / Libere / ★ / Scartate, miniature | capitoli (rinomina, riordina, escludi), scatti simili e doppioni |
| Pagine | impaginazioni della pagina ordinate per adattamento alle foto, «Un’altra», ± riquadri | altre opzioni (al vivo, spazio per titolo, varianti per tutto il libro, riquadri liberi, aggancio), pagine speciali (frase, frase su colore, con cornice, sulla foto, foto e frase, collage con sticker, dedica, titolo), pagina effetto |
| Tema | i 16 temi in un clic | copertina (8 proposte, 7 impaginazioni × 5 sfondi), risguardi (10 varianti più quelli degli altri temi), colori e caratteri, decorazioni del tema, spaziature e cornici, sfondo della doppia pagina |
| Decora | testi nello stile del tema, sticker illustrati del tema (e degli altri temi), scritte modificabili | sticker automatici tra le foto, 43 motivi vettoriali, pulizia delle decorazioni automatiche |
| Formato | profilo di stampa, riepilogo del libro, multiplo di 4 | misure della pagina, copertina (dorso, cartone, risvolto), foglio dei risguardi, abbondanza e zone di sicurezza (con le guide), rilegatura e risoluzione |

Ogni foto può avere forma (rettangolo, arrotondato, ovale, arco, cuore) e bordo propri.

## Pagine speciali

- **Frasi e citazioni** per ogni tema (scritte apposta o di autori classici), inserite in automatico tra i capitoli o a mano.
- **Sticker a tema** illustrati, con bordo bianco fustellato, e scritte ("Ho ho ho!", "Super papà", "Ti amo"…) sugli angoli delle foto.
- **Pagina effetto**: il programma analizza le foto migliori, riconosce persone e animali (modello DeepLab v3 di MediaPipe,
  eseguito nel browser), scontorna il soggetto e crea una doppia pagina con effetto "fuori cornice", sticker del soggetto e
  bianco e nero con soggetto a colori. Al massimo una per libro; se nessuna foto è adatta non viene creata.
- **Le foto non si perdono**: sostituendo, svuotando o eliminando una pagina, le sue foto vengono ridistribuite nelle pagine vicine.

## Sticker illustrati

Ogni tema ha la sua serie di sticker disegnati, con contorno, ombre, lucidi e bordo bianco fustellato (146 in tutto):

| Cartella | Temi | Sticker |
|---|---|---|
| `stickers natale/` | Natale, Natale nordico | 12 «Cartoon» + 12 «Disegnati a mano» |
| `stickers amore/` | San Valentino | cuore, due cuori, lettera, rosa, cuore con freccia, lucchetto, cioccolatini, palloncino, bacio, orsetto |
| `stickers papa/` | Festa del papà | cravatta, baffi, papillon, tazza, attrezzi, coppa n° 1, cappello, occhiali e baffi, pallone, super papà |
| `stickers mamma/` | Festa della mamma | tulipani, mazzo di fiori, farfalla, margherita, tè, cupcake, girasole, coccinella, vaso, borsetta |
| `stickers compleanno/` | Compleanno | torta, palloncini, cappellino, regalo, trombetta, cupcake, gelato, lecca-lecca, ciambella, coriandoli |
| `stickers matrimonio/` | Matrimonio | fedi, torta nuziale, colomba, bouquet, brindisi, campane, partecipazione, champagne, cuore con ali, diamante |
| `stickers nascita azzurro/` · `nascita rosa/` | Nascita | biberon, ciuccio, sonaglio, tutina, orsetto, luna, carrozzina, scarpine, paperella, nuvoletta |
| `stickers estate/` | Estate e viaggi | sole, palma, anguria, occhiali, aereo, valigia, salvagente, ombrellone, infradito, stella marina, conchiglia, ghiacciolo |
| `stickers pasqua/` | Pasqua | uova decorate, coniglietto, pulcino, cestino, carota, uovo di cioccolato, narcisi, nido, agnellino |
| `stickers laurea/` | Laurea | tocco, diploma, alloro, libri, gufo, medaglia, mappamondo, lampadina, razzo, stella |
| `stickers autunno/` | Autunno | foglie, ghianda, zucca, funghetto, castagne, mela, cioccolata calda, ombrello, riccio |
| `stickers ricordi/` | Neutro, Avorio, Nero galleria | macchina fotografica, polaroid, cuore, stella, aeroplanino, mongolfiera, caffè, arcobaleno, fiori, segnaposto |

- **Automatici**: gli sticker tra le foto sono questi disegni, con qualche scritta ogni tanto. Con più serie (Natale) ogni doppia pagina ne usa una sola, a turno; nella scheda Decora (Sticker automatici) si può sceglierne una. «Rimescola gli sticker» cambia la disposizione e lascia quelli messi a mano.
- **Scheda Decora**: gli sticker del tema, e dal menu «Sticker di un altro tema» quelli di tutti gli altri. Clic per aggiungerne uno, oppure trascinalo sul foglio. Uno sticker selezionato si ingrandisce, ruota, specchia o sostituisce con un altro della stessa serie.
- **Sticker con scritta** («Ho ho ho!», «Ti amo», «Super papà»…): stesso stile degli illustrati. Si aggiungono dalla scheda Decora (anche con una scritta propria); selezionandoli, il pannello a destra permette di cambiare **testo** (anche su più righe), **forma** (etichetta, nastro, timbro, fumetto, cartellino, esplosione, cuore, nuvola), **colori**, **carattere**, misura e rotazione. Doppio clic sullo sticker per scrivere subito.
- **Libri salvati prima**: nel progetto è salvato solo il riferimento allo sticker, il disegno sta nell'app. Riaprendo un libro fatto prima di questi sticker, l'app propone una sola volta di inserirli: «Metti gli sticker» sostituisce solo quelli automatici, «Li scelgo io» apre la scheda Decora, «No, grazie» non lo chiede più. Con Ctrl+Z si annulla tutto.
- **Nuovi disegni**: gli sticker delle cartelle (tranne Natale, che sono file forniti) sono generati da `tools/stickers/sets/*.mjs` con `node tools/stickers/make.mjs` (forme, ombre e bordo fustellato in `tools/stickers/lib.mjs`). Si possono anche aggiungere SVG a mano in una cartella `stickers <tema>`; a quali temi appartiene una cartella si indica in `src/js/48-art.js`. Poi si rifà la build (Netlify la rifà a ogni push).

## Struttura del libro

`Copertina (pag. 1 e ultima)` → `Risguardo anteriore (pag. 2–3)` → `pag. 4 (retro del risguardo)` → `Interno` → `terzultima (retro del risguardo)` → `Risguardo posteriore (penultime due)`

I risguardi sono fogli a parte, di default **650 × 330 mm**, con piega al centro. Nella scheda *Formato* si impostano
larghezza, altezza, posizione della piega, abbondanza e la zona visibile a libro finito (riquadro verde nell'editor).

## Esportazione

**1 · Bozza per il cliente** (*Esporta › Bozza per il cliente*)
- PDF leggero (doppie pagine o pagine singole) con filigrana "BOZZA" facoltativa
- Flipbook sfogliabile: un unico file `.html` da inviare, si apre offline su computer, tablet e telefono, con pagine che si girano, indice e schermo intero
- *Anteprima* mostra subito il flipbook dentro l'app

**2 · File per la stampa** (*Esporta › File per la tipografia*, Ctrl+E)
- `…_copertina_CMYK-FOGRA39.jpg` – JPEG CMYK 300 dpi, profilo ISO Coated v2 (ECI) per FOGRA39 incorporato
  (conversione con littleCMS, colorimetrico relativo + compensazione del punto nero), retro + dorso + fronte con risvolto e abbondanza
- `…_risguardi.pdf` – 4 pagine sul foglio dei risguardi: 1) pag. 2–3 · 2) pag. 4 sul lato sinistro · 3) terzultima sul lato destro · 4) penultime due
  (i lati delle pagine singole si possono cambiare)
- `…_interno.pdf` – tutto il resto, 300 dpi
- in alternativa JPEG RGB/PDF per la copertina e JPEG per gli altri file; crocini; zip con scheda tecnica
- a fine esportazione tutti i file vengono scaricati, uno dopo l’altro (Chrome può chiedere una volta di consentire più download); nella finestra restano anche i pulsanti per riscaricarli

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
