# Carma Medical Wellness

App di gestione palestra. Questa versione contiene la **home** con le sezioni principali, ottimizzata per mobile e tablet.

## Sezioni

| Sezione | Descrizione | Stato |
|---|---|---|
| Utenti | Elenco con anagrafica, ricerca, creazione ed eliminazione | Disponibile |
| Schede allenamento | Elenco utenti; per ogni utente crea ed elimina schede, storico con download e andamento degli esercizi | Disponibile (struttura delle schede provvisoria) |
| Calendario | Viste giorno, settimana, mese e anno; lezioni e accessi con gli utenti assegnati alle fasce orarie | Disponibile |
| Eventi | Open day, workshop e iniziative | Da sviluppare |

## Visualizzazione

- **Mobile:** card su una colonna, barra di navigazione in basso.
- **Tablet:** card su due colonne, menu laterale.
- Nella pagina i pulsanti **Mobile / Tablet** in alto permettono di vedere l'anteprima delle due viste.
- Tema chiaro e scuro automatico in base al dispositivo.

## Login

La schermata di login è già inclusa ma disattivata. Per attivarla a programma finito, in `index.html` cambiare:

```js
var LOGIN_ATTIVO = false;
```

in

```js
var LOGIN_ATTIVO = true;
```

## Come usarlo

Aprire `index.html` nel browser. Non servono dipendenze né installazioni.

Per pubblicarlo online: su GitHub, **Settings → Pages**, scegliere il branch `main` e la cartella `/ (root)`.

## Struttura del repository

```
├── index.html   # home dell'app (HTML, CSS e JavaScript in un unico file)
├── README.md    # questo riepilogo
├── scarica-ocr-offline.js   # prepara i file per la lettura senza internet
├── vendor/tesseract/        # (creata dallo script) motore e lingue di lettura
└── .gitignore
```

## Prossimi passi

- Sviluppare la scheda Utenti
- Sviluppare Eventi
- Salvataggio permanente di utenti, schede e calendario (database)
- Attivare il login

## Documento d'identità (scheda Utenti)

Alla creazione di un utente si può scattare la foto o scegliere un file per fronte e retro del documento. Il sistema legge i dati e compila i campi (da controllare prima di salvare); le foto restano salvate e si scaricano dalla scheda dell'utente (tocco sulla riga).

- Nella versione pubblicata su claude.ai la lettura dei dati, il salvataggio e il database funzionano grazie al runtime della pagina.
- Aprendo `index.html` fuori da claude.ai (per esempio su GitHub Pages) la lettura avviene direttamente nel browser, senza server né API (vedi sotto). Gli utenti e i documenti restano però solo in memoria fino al ricaricamento: per salvarli servono un database e un archivio file protetto.
- I documenti d'identità sono dati personali: servono informativa, consenso, accesso limitato al personale autorizzato e conservazione sicura (GDPR).

## Lettura automatica nel browser (senza API)

Fuori da claude.ai la pagina legge il documento con Tesseract.js, un programma di riconoscimento del testo che gira nel browser. Le foto non lasciano il dispositivo.

- Al primo uso scarica da internet (jsDelivr) il motore e i dati di lingua, qualche MB; poi il browser li tiene in cache. Serve quindi una connessione, ma nessuna chiave e nessun server.
- Sul retro della carta d'identità elettronica legge la riga di caratteri in basso (MRZ), molto affidabile per cognome, nome, data di nascita, scadenza e numero documento. Dal testo stampato ricava anche il codice fiscale e la città di residenza, quando sono leggibili.
- La precisione dipende dalla foto: documento intero, a fuoco, ben illuminato e senza riflessi. I campi vanno sempre controllati prima di salvare.
- I documenti cartacei o le patenti hanno un'impaginazione diversa e vengono letti con meno precisione.
- Per usarla senza internet: installa Node.js, metti `scarica-ocr-offline.js` nella cartella del repository ed esegui `node scarica-ocr-offline.js`. Crea la cartella `vendor/tesseract/` con motore e lingue italiano e inglese. Carica su GitHub la cartella `vendor/` insieme a `index.html`: la pagina usa quei file e, se mancano, ripiega su internet.
- La pagina va aperta da un indirizzo web (GitHub Pages o un server locale), non con doppio clic sul file: i browser bloccano il motore di lettura sui file aperti da disco.

Se un dato viene letto male, sotto le foto c'è **Mostra testo letto** con quello che il programma ha riconosciuto: serve per capire dove sbaglia. Per cognome, nome, date, numero documento e codice fiscale la lettura si controlla da sola con i caratteri di controllo (riga in basso del documento e ultima lettera del codice fiscale): i valori che non tornano vengono scartati o segnalati.

## Schede allenamento

Tutti gli utenti creati nella sezione Utenti compaiono nell'elenco di Schede allenamento. Toccando un utente si aprono le sue schede:

- **+ / Crea** aggiunge una scheda (nome, data, note, esercizi con serie, ripetizioni e carico in kg).
- Nel modulo, il pulsante **SS** davanti a un esercizio lo mette in **superserie** con quello sopra; si possono collegare due o più esercizi. Nel dettaglio e nel download le superserie sono segnate con SS A, SS B…
- **− / Elimina** attiva la selezione e, dopo conferma, elimina le schede scelte.
- Toccando una scheda si vede il dettaglio e si può **scaricare** come pagina HTML (apribile e stampabile come PDF). La più recente è segnata come "attuale", le altre sono lo storico.
- Sotto le schede c'è il campo di ricerca esercizi: si scelgono fino a 4 esercizi e il grafico mostra come cambia il carico massimo scheda dopo scheda.

La struttura delle schede è provvisoria e da definire. Cancellando un utente si cancellano anche le sue schede.

## Calendario

Quattro viste, che si cambiano dai pulsanti **Giorno / Settimana / Mese / Anno**; con ‹ e › si scorre, con **Oggi** si torna a oggi. La settimana inizia di lunedì.

- **Giorno:** timeline oraria sulle 24 ore come nel calendario Apple, con la striscia dei giorni della settimana in alto e la linea rossa dell'ora attuale. Le voci che si sovrappongono sono affiancate.
- **Settimana:** sette colonne con la stessa timeline; toccando il numero di un giorno si apre la vista Giorno.
- **Mese:** griglia del mese con i punti colorati delle voci (su tablet i titoli); toccando un giorno si vede l'elenco sotto, toccandolo ancora (o con **Apri giorno**) si apre la vista Giorno.
- **Anno:** i dodici mesi; i giorni con voci sono evidenziati. Toccando il nome del mese si apre il mese, toccando un giorno si apre il giorno.

**Voci del calendario.** Ogni voce ha tipo (*Lezione / evento* oppure *Accesso libero in palestra*), titolo, data, ora di inizio e fine, colore, note e **gli utenti assegnati**. Nella stessa fascia possono esserci più utenti e più voci insieme. Si crea con **+ / Crea** oppure toccando una fascia vuota della timeline; toccando una voce si modifica o si elimina. Nel modulo c'è un elenco degli utenti caricati, con ricerca; se un utente è già assegnato a un'altra voce nello stesso orario compare un avviso (si può salvare comunque).

**Spostare le voci (giorno e settimana).**

- **Touch:** tieni premuta la voce per un attimo (il telefono vibra) e trascinala; l'orario si aggiorna mentre ti muovi, con scatti di 15 minuti. Se scorri senza tenere premuto, la pagina scorre normalmente e la voce resta ferma.
- **Mouse:** trascina direttamente la voce.
- Nella settimana si può trascinare anche su un altro giorno.
- Il trattino in fondo alla voce permette di cambiare la durata.
- Vicino al bordo alto o basso della timeline, la pagina scorre da sola durante il trascinamento.
- Gli utenti assegnati si spostano insieme alla voce.

Se si elimina un utente, viene tolto anche da tutte le voci del calendario. Come per utenti e schede, fuori da claude.ai le voci restano in memoria fino al ricaricamento della pagina: all'apertura compaiono alcune voci di esempio, da cancellare quando non servono più.
