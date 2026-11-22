
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,onAuthStateChanged,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getFirestore,doc,collection,addDoc,setDoc,getDoc,onSnapshot,deleteDoc,serverTimestamp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';
import {getStorage,ref,uploadBytes,getDownloadURL} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js';
import {firebaseConfig} from './firebase-config.js';
const $=id=>document.getElementById(id), money=n=>Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const configured=firebaseConfig.apiKey!=='COLE_AQUI';
let auth,db,storage,uid=null,unsubs=[],data={transactions:[],debts:[],cards:[],vehicles:[]},settings={digital:0,cash:0,dailyFuel:107,workDays:6};
if(configured){const app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
onAuthStateChanged(auth,async user=>{unsubs.forEach(f=>f());unsubs=[];uid=user?.uid||null;$('login').hidden=!!user;$('app').hidden=!user;$('logout').hidden=!user;$('userLabel').textContent=user?.email||'';if(!user)return;
const snap=await getDoc(doc(db,'users',uid));settings={...settings,...(snap.data()||{})};fillSettings();
for(const key of Object.keys(data)){unsubs.push(onSnapshot(collection(db,'users',uid,key),s=>{data[key]=s.docs.map(d=>({id:d.id,...d.data()}));render()},e=>alert('Falha ao carregar '+key+': '+e.message))}render()});
}else{$('authError').textContent='Configure firebase-config.js antes de publicar.'}
$('signIn').onclick=async()=>{try{await signInWithEmailAndPassword(auth,$('email').value,$('password').value)}catch(e){$('authError').textContent=e.message}};
$('signUp').onclick=async()=>{try{await createUserWithEmailAndPassword(auth,$('email').value,$('password').value)}catch(e){$('authError').textContent=e.message}};
$('logout').onclick=()=>signOut(auth);
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(t=>t.hidden=t.id!==b.dataset.tab);document.querySelectorAll('#tabs button').forEach(x=>x.classList.toggle('active',x===b))});
const formData=f=>Object.fromEntries(new FormData(f).entries());
const save=async(key,record)=>{if(!uid)return;await addDoc(collection(db,'users',uid,key),{...record,createdAt:serverTimestamp()})};
function bindForm(id,key,convert){$(id).onsubmit=async e=>{e.preventDefault();const b=e.target.querySelector('button[type=submit],button:not([type])');b.disabled=true;try{await save(key,await convert(formData(e.target),e.target));e.target.reset();e.target.querySelector('[name=date]')?.setAttribute('value',new Date().toLocaleDateString('en-CA'))}catch(err){alert('Erro ao salvar: '+err.message)}finally{b.disabled=false}}}
bindForm('transactionForm','transactions',async v=>({type:v.type,name:v.name,amount:Number(v.amount),date:v.date,account:v.account,category:v.category}));
bindForm('debtForm','debts',async v=>({name:v.name,amount:Number(v.amount),due:v.due,interest:Number(v.interest||0),card:v.card,status:'open'}));
bindForm('vehicleForm','vehicles',async v=>({name:v.name,plate:v.plate,kmL:Number(v.kmL||0),fuelPrice:Number(v.fuelPrice||0)}));
bindForm('cardForm','cards',async(v,f)=>{let image='';const file=f.querySelector('[name=image]').files[0];if(file){if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2097152)throw Error('Use PNG, JPEG ou WebP até 2 MB');const path=ref(storage,`users/${uid}/cards/${crypto.randomUUID()}-${file.name.replace(/[^a-z0-9._-]/gi,'_')}`);await uploadBytes(path,file);image=await getDownloadURL(path)}return {name:v.name,issuer:v.issuer,last4:v.last4,limit:Number(v.limit),dueDay:Number(v.dueDay),image}});
$('settingsForm').onsubmit=async e=>{e.preventDefault();const v=formData(e.target);const obj={digital:Number(v.digital||0),cash:Number(v.cash||0),dailyFuel:Number(v.dailyFuel||0),workDays:Number(v.workDays||0)};try{await setDoc(doc(db,'users',uid),obj,{merge:true});settings=obj;render();alert('Configurações salvas')}catch(err){alert(err.message)}};
function fillSettings(){const f=$('settingsForm');for(const k of Object.keys(settings))f.elements[k].value=settings[k]}
function safe(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function itemHtml(x,detail){return `<div class="item"><div><strong>${safe(x.name)}</strong><small>${detail}</small></div><button class="secondary delete" data-id="${safe(x.id)}">Excluir</button></div>`}
function drawList(id,key,html){$(id).innerHTML=data[key].length?data[key].map(html).join(''):'<p class="hint">Nenhum registro ainda.</p>';$(id).querySelectorAll('.delete').forEach(b=>b.onclick=async()=>{if(confirm('Excluir este registro?'))try{await deleteDoc(doc(db,'users',uid,key,b.dataset.id))}catch(e){alert(e.message)}})}
function render(){if(!uid)return;const tx=data.transactions,debts=data.debts.filter(d=>d.status!=='paid'),today=new Date(),ym=today.toLocaleDateString('en-CA').slice(0,7);
let digital=Number(settings.digital||0),cash=Number(settings.cash||0),income=0,expenses=0;
for(const t of tx){const n=Number(t.amount||0);if(t.type==='transfer'){if(t.account==='digital'){digital-=n;cash+=n}else{cash-=n;digital+=n}}else{const sign=t.type==='income'?1:-1;if(t.account==='cash')cash+=sign*n;else digital+=sign*n;if(t.date?.startsWith(ym)){if(sign===1)income+=n;else expenses+=n}}}
const debtTotal=debts.reduce((s,d)=>s+Number(d.amount||0),0),fuel=Number(settings.dailyFuel||0)*Number(settings.workDays||0);
$('balance').textContent=money(digital+cash);$('debtTotal').textContent=money(debtTotal);$('income').textContent=money(income);$('expenses').textContent=money(expenses);$('fuelReserve').textContent=money(fuel);
const future=new Date(today);future.setDate(future.getDate()+30);const due30=debts.filter(d=>d.due&&new Date(d.due+'T12:00:00')<=future).reduce((s,d)=>s+Number(d.amount||0),0);const projected=digital+cash-due30-fuel;$('projected').textContent=money(projected);
let alerts=[];if(projected<0)alerts.push(`<div class="warning dangerbox">⚠ Risco de caixa: faltam ${money(-projected)} para cobrir as dívidas com vencimento em até 30 dias e a reserva semanal de combustível. Projeção não inclui receitas futuras.</div>`);
for(const d of debts){if(!d.due)continue;const days=Math.ceil((new Date(d.due+'T12:00:00')-today)/86400000);if(days<=7)alerts.push(`<div class="warning">${days<0?'Vencida':days===0?'Vence hoje':`Vence em ${days} dia(s)`}: ${safe(d.name)} — ${money(d.amount)} (${safe(d.due)})</div>`)}
$('alerts').innerHTML=alerts.join('')||'<div class="okbox">Sem vencimentos próximos cadastrados. Continue registrando suas contas.</div>';
drawList('transactionList','transactions',x=>itemHtml(x,`${safe(x.date)} • ${safe(x.type)} • ${safe(x.account)} • ${money(x.amount)}`));
drawList('debtList','debts',x=>itemHtml(x,`${money(x.amount)} • Vence ${safe(x.due)} • Juros ${Number(x.interest||0)}% a.m. • ${safe(x.status)}`));
drawList('vehicleList','vehicles',x=>itemHtml(x,`${safe(x.plate||'Sem placa')} • ${Number(x.kmL||0)} km/L • ${money(x.fuelPrice)}/L`));
drawList('cardList','cards',x=>`<div class="item">${x.image?`<img src="${safe(x.image)}" alt="Imagem do cartão">`:''}<div><strong>${safe(x.name)}</strong><small>${safe(x.issuer)} • **** ${safe(x.last4)} • Limite ${money(x.limit)} • Dia ${Number(x.dueDay)}</small></div><button class="secondary delete" data-id="${safe(x.id)}">Excluir</button></div>`);
$('debtCard').innerHTML='<option value="">Nenhum</option>'+data.cards.map(c=>`<option value="${safe(c.id)}">${safe(c.name)}</option>`).join('');
}
$('transactionForm').elements.date.value=new Date().toLocaleDateString('en-CA');
$('export').onclick=()=>{const blob=new Blob([JSON.stringify({exportedAt:new Date().toISOString(),settings,...data},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sam-financas-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
