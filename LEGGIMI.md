# Carma Medical Wellness – Telegram + Firebase (senza Cloudflare)

Modello di ProFile Manager: Firebase per account e permessi, Telegram come archivio cifrato.
L'app (`index.html`) è quella che hai caricato, con due sole aggiunte: un piccolo blocco all'inizio e `carma-start.js` in fondo.

## Passi (nell'ordine)

### A. Prima prova, solo con Firebase (Telegram ancora spento)
1. **Repository**: carica TUTTI i file di questa cartella nella radice del repository (sostituisci `index.html`). Non servono cartelle nascoste.
2. **Firebase → Authentication**: attiva "Email/password" e crea il tuo utente (Aggiungi utente). Copia il suo **UID** dalla lista.
3. **Firebase → Firestore → Regole**: incolla `firestore.rules` e pubblica.
4. **Firestore → Dati**: crea la collezione `users` con un documento il cui ID è il tuo UID e i campi `admin` = true (booleano), `attivo` = true (booleano).
5. Apri l'app: compare l'accesso. Entra con email e password. Finché `telegram-config.js` contiene "INSERISCI", i dati vanno su Firestore e tutto funziona già.

### B. Attiva Telegram
6. **my.telegram.org** → API development tools → crea una NUOVA applicazione. Scrivi `api_id` e `api_hash` in `telegram-config.js` (non condividere questo file con altri progetti).
7. **Gruppo Telegram**: l'account che userai nell'app (meglio un numero dedicato alla palestra) deve far parte di "CarmaMedical Database" ed esserne amministratore. Gli argomenti mancanti li crea da solo (Utenti, Schede allenamento, Calendario, Eventi, Ingressi, Pacchetti).
8. Ricarica l'app: dopo l'email chiede il numero Telegram e il codice (una volta per dispositivo). Da lì i dati nuovi vanno su Telegram, cifrati.

## Cosa NON è ancora collegato
- **Foto dei documenti** (carta d'identità, certificato): nell'app c'è ancora il blocco "Archivio documenti non disponibile". Va collegato come passo successivo (invio file cifrati su Telegram).
- **Dati già inseriti** prima del passaggio: restano dove sono (nell'anteprima di Claude). Se ne hai, esportali prima.
- **Backup automatici alle 13 e alle 23**: da decidere. Senza server serve un'azione GitHub programmata con una sessione Telegram dedicata nei Secrets; ne parliamo dopo.
- **Account dello staff**: per ora si creano a mano dalla console Firebase (passi 2 e 4). Una pagina di gestione account si può aggiungere dopo.

## Da sapere
- La sessione Telegram resta nel browser e dà accesso a quell'account: usa un numero dedicato e non lasciarla su computer condivisi. `window.CARMA.esci()` la cancella ed esce.
- Il file `telegram-lib.js` è grande (3,6 MB): la prima apertura è più lenta, poi resta in cache.
- Chi perde l'accesso conserva la chiave di cifratura già letta; cambiarla significa ricifrare i dati.
