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
let nota='';
const setInfo=t=>{nota=t;if(infoEl)infoEl.textContent=t};
function ask(title,msg,fields,sms,skip){
  if(!ov.isConnected)document.body.appendChild(ov);
  card.textContent='';
  card.append(el('h2',title,'margin:0 0 8px;font-size:20px'),el('p',msg,'margin:0 0 16px;font-size:14px;opacity:.8;line-height:1.4'));
  const inputs=fields.map(f=>{const i=document.createElement('input');i.type=f.type||'text';i.placeholder=f.ph;i.autocomplete=f.ac||'off';i.style.cssText=S.inp;card.appendChild(i);return i});
  infoEl=el('div','','color:#ffb4a8;font-size:13px;min-height:18px;margin:2px 0 8px');
  infoEl.textContent=nota;nota='';
  const ok=el('button','Continua',S.btn);card.append(infoEl,ok);
  return new Promise(res=>{
    const go=()=>{const v=inputs.map(i=>i.value);if(!v[0]){setInfo('Compila il campo.');return}res(v)};
    ok.onclick=go;inputs.forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go()}));
    if(sms){const b=el('button','Non arriva? Invia via SMS',S.link);b.onclick=()=>res('__SMS__');card.appendChild(b)}
    if(skip){const b=el('button','Continua senza Telegram',S.link);b.onclick=()=>res('__SKIP__');card.appendChild(b)}
    inputs[0].focus();
  });
}

/* Schermata di attesa con le ultime operazioni (così si vede se la richiesta parte davvero) */
const righe=[];
let skipRes=null;
const skipP=()=>new Promise(r=>{skipRes=()=>r('__SKIP__')});
function stato(t){
  righe.push(t);if(righe.length>6)righe.shift();
  if(!ov.isConnected)document.body.appendChild(ov);
  card.textContent='';
  card.append(el('h2','Collegamento a Telegram','margin:0 0 8px;font-size:20px'),
    el('p','Attendi, non chiudere la pagina.','margin:0 0 12px;font-size:14px;opacity:.8'),
    el('pre',righe.join('\n'),'font-size:12px;white-space:pre-wrap;opacity:.75;margin:0'));
  const k=el('button','Continua senza Telegram',S.link);k.onclick=()=>{if(skipRes)skipRes()};card.appendChild(k);
}
function avviso(title,msg,dett,btn,skip){
  if(!ov.isConnected)document.body.appendChild(ov);
  card.textContent='';
  card.append(el('h2',title,'margin:0 0 8px;font-size:20px'),el('p',msg,'margin:0 0 12px;font-size:14px;line-height:1.4'));
  if(dett)card.appendChild(el('pre',dett,'font-size:11px;white-space:pre-wrap;opacity:.7;margin:0 0 14px;max-height:160px;overflow:auto'));
  const b=el('button',btn||'Riprova',S.btn);card.appendChild(b);
  return new Promise(res=>{b.onclick=()=>res('retry');if(skip){const k=el('button','Continua senza Telegram',S.link);k.onclick=()=>res('skip');card.appendChild(k)}});
}

/* ---- accesso Firebase: solo account abilitati (documento users/<uid>) ---- */
let chi='';
async function accessoFirebase(){
  await auth.authStateReady();
  let msg='Accedi con l’email dello staff.';
  for(;;){
    if(!auth.currentUser){
      const [email,pw]=await ask('Carma Medical Wellness',msg,[{type:'email',ph:'Email',ac:'username'},{type:'password',ph:'Password',ac:'current-password'}]);
      try{await signInWithEmailAndPassword(auth,email.trim(),pw)}catch(e){msg='Email o password non corrette.';continue}
    }
    let abilitato=false;
    try{const me=await getDoc(sdkDoc(fdb,'users',auth.currentUser.uid));abilitato=me.exists()&&me.data().attivo!==false;if(abilitato)chi=String(me.data().name||me.data().nome||me.data().email||'')}catch(e){}
    if(abilitato){if(!chi)chi=auth.currentUser.email||'';return}
    await signOut(auth);msg='Questo account non è abilitato: contatta la palestra.';
  }
}

/* ---- accesso Telegram (una volta per dispositivo; la sessione resta nel browser) ---- */
const SKIP=new Error('SKIP');
/* restituisce true se la sessione Telegram è attiva, false se si prosegue senza */
async function accessoTelegram(){
  if(!tgConfigured())return false;
  if(hasSession())return true;
  const ui={
    phone:async()=>{const r=await ask('Collega Telegram','Inserisci il numero, con prefisso (es. +39…), dell’account Telegram che fa parte del gruppo dati. Se hai fretta puoi continuare senza: i dati nuovi restano al sicuro su Firebase e passano a Telegram al collegamento successivo.',[{type:'tel',ph:'+39…',ac:'tel'}],false,true);if(r==='__SKIP__')throw SKIP;return r[0]},
    code:async()=>{const r=await ask('Codice Telegram','Il codice arriva nell’app Telegram (chat “Telegram”) se l’account è già aperto su un altro dispositivo, altrimenti via SMS.',[{ph:'Codice',ac:'one-time-code'}],true,true);if(r==='__SKIP__')throw SKIP;return r==='__SMS__'?r:r[0].trim()},
    password:async()=>(await ask('Password Telegram','Inserisci la password a due fattori di Telegram.',[{type:'password',ph:'Password'}]))[0],
    info:setInfo
  };
  for(;;){
    let client=null;
    try{
      righe.length=0;stato('Carico la libreria Telegram…');
      const sp=skipP(),lp=loadTg(stato);lp.catch(()=>{});
      const tg=await Promise.race([lp,sp]);if(tg==='__SKIP__')throw SKIP;
      const reg=t=>{stato(t);if(/non valido|non riuscito|reinviato|Reinvio/i.test(t))nota=t};
      stato('Connessione a Telegram…');
      client=newClient(tg,'');
      const cp=withTimeout(client.connect(),30000,'TIMEOUT_CONNECT');cp.catch(()=>{});
      if(await Promise.race([cp.then(()=>'ok'),sp])==='__SKIP__')throw SKIP;
      stato('Connesso.');
      await tgLogin(tg,client,ui,reg);
      try{await client.disconnect()}catch(e){}
      return true;
    }catch(e){
      try{if(client)await client.disconnect()}catch(_){}
      if(e===SKIP){clearSession();return false}
      clearSession();
      const dett=[shimError&&('Buffer: '+shimError),libSource&&('Libreria: '+libSource),...(e&&e.details||[]),...consoleLog.slice(-5)].filter(Boolean).join('\n');
      const sc=await avviso('Telegram non collegato',tgErrText(e),dett,'Riprova',true);
      if(sc==='skip')return false;
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

window.CARMA={get chi(){return chi||(auth.currentUser&&auth.currentUser.email)||''},esci:async()=>{clearSession();await signOut(auth);location.reload()},
  /* collega Telegram in un secondo momento (tocca il pallino grigio in alto): poi si ricarica e i dati salvati senza Telegram passano da soli */
  collega:async()=>{try{const ok=await accessoTelegram();ov.remove();if(ok&&hasSession())location.reload()}catch(e){console.error(e);ov.remove()}}};
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
