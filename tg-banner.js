/* Avviso nelle pagine Documenti, Archivio e Cestino quando Telegram non è collegato su questo dispositivo:
   senza Telegram i file, il Cestino e l'archivio completo non sono raggiungibili (le eliminazioni restano in attesa). */
import {tgConfigured,hasSession} from "./telegram.js";
if(tgConfigured()&&!hasSession()){
  const b=document.createElement('div');
  b.setAttribute('role','status');
  b.style.cssText='position:sticky;top:0;z-index:70;background:#fef3c7;color:#78350f;border-bottom:1px solid #f59e0b;padding:10px 14px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:14px';
  b.innerHTML='<span style="flex:1;min-width:210px">Telegram non è collegato su questo dispositivo: file, Cestino e archivio non sono completi.</span><button type="button" style="font:inherit;padding:7px 14px;border-radius:10px;border:1px solid #92400e;background:#fff;color:#78350f;cursor:pointer;font-weight:600">Collega Telegram</button>';
  document.body.prepend(b);
  b.querySelector('button').onclick=()=>{b.querySelector('button').disabled=true;window.__carmaSoloTg=true;import('./carma-start.js').catch(e=>{console.error(e);b.querySelector('button').disabled=false})};
}
