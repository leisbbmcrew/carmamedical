/* carma-start.js – accesso (Firebase) + collegamento a Telegram + archivio dati per l'app.
   Fa credere all'app di avere il database "db.collection(...)": i dati vanno su Telegram (cifrati) se è configurato,
   altrimenti su Firestore. L'app (index.html) non cambia: aspetta che questo modulo finisca l'accesso. */
import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,signInWithEmailAndPassword,signOut} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getDoc,doc as sdkDoc} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {firebaseConfig} from "./firebase-config.js";
import {getFirestore,collection,doc,onSnapshot,addDoc,setDoc,updateDoc,deleteDoc} from "./fsx.js";
import {tgConfigured,hasSession,clearSession,loadTg,newClient,tgLogin,tgErrText,withTimeout,consoleLog,libSource,shimError} from "./telegram.js";

const app=initializeApp(firebaseConfig),auth=getAuth(app),fdb=getFirestore(app);

/* ---- finestra di accesso ---- */
const S={
  ov:'position:fixed;inset:0;z-index:99999;background:#0f1720;display:flex;align-items:center;justify-content:center;padding:20px;font-family:system-ui,-apple-system,sans-serif;color:#e8eef5',
  card:'width:100%;max-width:380px;background:#17212c;border-radius:16px;padding:24px;box-shadow:0 8px 30px rgba(0,0,0,.4)',
  inp:'width:100%;box-sizing:border-box;margin:0 0 10px;padding:12px;border-radius:10px;border:1px solid #33465a;background:#0f1720;color:inherit;font-size:16px',
  btn:'width:100%;padding:12px;border:0;border-radius:10px;background:#2f8cff;color:#fff;font-size:16px;font-weight:600;cursor:pointer',
  link:'width:100%;margin-top:10px;padding:8px;border:0;background:none;color:#8fb8ff;font-size:14px;cursor:pointer'
};
const ov=document.createElement('div'),card=document.createElement('div');
ov.style.cssText=S.ov;card.style.cssText=S.card;ov.appendChild(card);
const el=(t,txt,css)=>{const e=document.createElement(t);e.textContent=txt;if(css)e.style.cssText=css;return e};
let infoEl=null;
const setInfo=t=>{if(infoEl)infoEl.textContent=t};
function ask(title,msg,fields,sms){
  if(!ov.isConnected)document.body.appendChild(ov);
  card.textContent='';
  card.append(el('h2',title,'margin:0 0 8px;font-size:20px'),el('p',msg,'margin:0 0 16px;font-size:14px;opacity:.8;line-height:1.4'));
  const inputs=fields.map(f=>{const i=document.createElement('input');i.type=f.type||'text';i.placeholder=f.ph;i.autocomplete=f.ac||'off';i.style.cssText=S.inp;card.appendChild(i);return i});
  infoEl=el('div','','color:#ffb4a8;font-size:13px;min-height:18px;margin:2px 0 8px');
  const ok=el('button','Continua',S.btn);card.append(infoEl,ok);
  return new Promise(res=>{
    const go=()=>{const v=inputs.map(i=>i.value);if(!v[0]){setInfo('Compila il campo.');return}res(v)};
    ok.onclick=go;inputs.forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go()}));
    if(sms){const b=el('button','Non arriva? Invia via SMS',S.link);b.onclick=()=>res('__SMS__');card.appendChild(b)}
    inputs[0].focus();
  });
}

/* Schermata di attesa con le ultime operazioni (così si vede se la richiesta parte davvero) */
const righe=[];
function stato(t){
  righe.push(t);if(righe.length>6)righe.shift();
  if(!ov.isConnected)document.body.appendChild(ov);
  card.textContent='';
  card.append(el('h2','Collegamento a Telegram','margin:0 0 8px;font-size:20px'),
    el('p','Attendi, non chiudere la pagina.','margin:0 0 12px;font-size:14px;opacity:.8'),
    el('pre',righe.join('\n'),'font-size:12px;white-space:pre-wrap;opacity:.75;margin:0'));
}
function avviso(title,msg,dett,btn){
  if(!ov.isConnected)document.body.appendChild(ov);
  card.textContent='';
  card.append(el('h2',title,'margin:0 0 8px;font-size:20px'),el('p',msg,'margin:0 0 12px;font-size:14px;line-height:1.4'));
  if(dett)card.appendChild(el('pre',dett,'font-size:11px;white-space:pre-wrap;opacity:.7;margin:0 0 14px;max-height:160px;overflow:auto'));
  const b=el('button',btn||'Riprova',S.btn);card.appendChild(b);
  return new Promise(res=>{b.onclick=()=>res()});
}

/* ---- accesso Firebase: solo account abilitati (documento users/<uid>) ---- */
async function accessoFirebase(){
  await auth.authStateReady();
  let msg='Accedi con l’email dello staff.';
  for(;;){
    if(!auth.currentUser){
      const [email,pw]=await ask('Carma Medical Wellness',msg,[{type:'email',ph:'Email',ac:'username'},{type:'password',ph:'Password',ac:'current-password'}]);
      try{await signInWithEmailAndPassword(auth,email.trim(),pw)}catch(e){msg='Email o password non corrette.';continue}
    }
    let abilitato=false;
    try{const me=await getDoc(sdkDoc(fdb,'users',auth.currentUser.uid));abilitato=me.exists()&&me.data().attivo!==false}catch(e){}
    if(abilitato)return;
    await signOut(auth);msg='Questo account non è abilitato: contatta la palestra.';
  }
}

/* ---- accesso Telegram (una volta per dispositivo; la sessione resta nel browser) ---- */
async function accessoTelegram(){
  if(!tgConfigured()||hasSession())return;
  const ui={
    phone:async()=>(await ask('Collega Telegram','Inserisci il numero, con prefisso (es. +39…), dell’account Telegram che fa parte del gruppo dati.',[{type:'tel',ph:'+39…',ac:'tel'}]))[0],
    code:async()=>{const r=await ask('Codice Telegram','Il codice arriva nell’app Telegram (chat “Telegram”) se l’account è già aperto su un altro dispositivo, altrimenti via SMS.',[{ph:'Codice',ac:'one-time-code'}],true);return r==='__SMS__'?r:r[0].trim()},
    password:async()=>(await ask('Password Telegram','Inserisci la password a due fattori di Telegram.',[{type:'password',ph:'Password'}]))[0],
    info:setInfo
  };
  for(;;){
    let client=null;
    try{
      righe.length=0;stato('Carico la libreria Telegram…');
      const tg=await loadTg(stato);
      stato('Connessione a Telegram…');
      client=newClient(tg,'');
      await withTimeout(client.connect(),30000,'TIMEOUT_CONNECT');
      stato('Connesso.');
      await tgLogin(tg,client,ui,stato);
      try{await client.disconnect()}catch(e){}
      return;
    }catch(e){
      try{if(client)await client.disconnect()}catch(_){}
      clearSession();
      const dett=[shimError&&('Buffer: '+shimError),libSource&&('Libreria: '+libSource),...(e&&e.details||[]),...consoleLog.slice(-5)].filter(Boolean).join('\n');
      await avviso('Telegram non collegato',tgErrText(e),dett,'Riprova');
    }
  }
}

/* ---- il "database" che l'app si aspetta: db.collection(nome) ---- */
const SEZ='sections';
function creaDb(){
  return {collection(nome){
    const col=()=>collection(fdb,SEZ,nome,'items'),ref=id=>doc(fdb,SEZ,nome,'items',String(id));
    return {
      onSnapshot:(ok,err)=>onSnapshot(col(),ok,err),
      add:o=>addDoc(col(),o),
      doc:id=>({update:p=>updateDoc(ref(id),p),set:o=>setDoc(ref(id),o),delete:()=>deleteDoc(ref(id))})
    };
  }};
}

window.CARMA={esci:async()=>{clearSession();await signOut(auth);location.reload()}};
(async()=>{
  try{
    await accessoFirebase();
    await accessoTelegram();
    ov.remove();
    window.__carmaResolve(creaDb());
  }catch(e){
    console.error(e);ov.remove();window.__carmaResolve(null);
  }
})();
