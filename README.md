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
└── .gitignore
```

## Prossimi passi

- Sviluppare la scheda Utenti
- Sviluppare Schede allenamento, Calendario ed Eventi
- Attivare il login

## Documento d'identità (scheda Utenti)

Alla creazione di un utente si può scattare la foto o scegliere un file per fronte e retro del documento. Il sistema legge i dati e compila i campi (da controllare prima di salvare); le foto restano salvate e si scaricano dalla scheda dell'utente (tocco sulla riga).

- Nella versione pubblicata su claude.ai la lettura dei dati, il salvataggio e il database funzionano grazie al runtime della pagina.
- Aprendo `index.html` fuori da claude.ai (per esempio su GitHub Pages) la lettura automatica non è disponibile e i dati restano solo in memoria fino al ricaricamento: per un uso reale servono un server con database, archivio file protetto e un servizio di lettura documenti (con la chiave API sul server, mai nella pagina).
- I documenti d'identità sono dati personali: servono informativa, consenso, accesso limitato al personale autorizzato e conservazione sicura (GDPR).
