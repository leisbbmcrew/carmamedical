# Carma Medical Wellness

App di gestione palestra. Questa versione contiene la **home** con le sezioni principali, ottimizzata per mobile e tablet.

## Sezioni

| Sezione | Descrizione | Stato |
|---|---|---|
| Utenti | Elenco con anagrafica, ricerca, creazione ed eliminazione | Disponibile |
| Schede allenamento | Creazione e assegnazione dei programmi | Da sviluppare |
| Calendario | Corsi, appuntamenti e prenotazioni | Da sviluppare |
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
- Sviluppare Schede allenamento, Calendario ed Eventi
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
