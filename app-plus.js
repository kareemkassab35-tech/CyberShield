
const siteDocRef = db.collection('site').doc('main');
document.getElementById('year').textContent = new Date().getFullYear();

async function loadSite(){
  const snap = await siteDocRef.get();
  const data = snap.exists ? snap.data() : {};
  document.getElementById('siteName').textContent = data.name || 'CyberShield';
  document.getElementById('heroTitle').textContent = data.heroTitle || 'تعلم الأمن السيبراني والبرمجة بسهولة';
  document.getElementById('heroDesc').textContent = data.heroDesc || 'دروس وأدوات عملية ومحتوى محدث.';
  if(data.siteLogoUrl){
    const el = document.getElementById('siteLogo');
    el.style.backgroundImage = `url(${data.siteLogoUrl})`; el.style.backgroundSize='cover';
  }
  // articles
  const arts = await db.collection('content').doc('main').collection('articles').orderBy('createdAt','desc').limit(6).get();
  const aBox = document.getElementById('articlesList'); aBox.innerHTML='';
  arts.forEach(doc=>{
    const a=doc.data();
    const div=document.createElement('div'); div.className='card';
    div.innerHTML=`<strong>${a.title||'بدون عنوان'}</strong><br>${a.coverUrl?`<img src="${a.coverUrl}" style="width:100%;border-radius:12px;margin:8px 0">`:''}<p>${(a.body||'').slice(0,220)}...</p>`;
    aBox.appendChild(div);
  });
  // videos
  const vids = await db.collection('content').doc('main').collection('videos').orderBy('createdAt','desc').limit(6).get();
  const vBox=document.getElementById('videosList'); vBox.innerHTML='';
  vids.forEach(doc=>{
    const v=doc.data(); const d=document.createElement('div'); d.className='card';
    d.innerHTML=`<strong>${v.title||'فيديو'}</strong><br>${v.thumbUrl?`<img src="${v.thumbUrl}" style="width:100%;border-radius:12px;margin:8px 0">`:''}${v.url?`<a class="btn" target="_blank" href="${v.url}">مشاهدة</a>`:''}`;
    vBox.appendChild(d);
  });
  // news placeholders
  const news = data.news || [
    {title:"أفضل ممارسات كلمات المرور 2025", link:"#"},
    {title:"ثغرات شائعة في تطبيقات الويب", link:"#"},
    {title:"كيف تحمي بريدك من التصيد", link:"#"}
  ];
  const nbox = document.getElementById('newsBox'); nbox.innerHTML='';
  news.forEach(n=>{ const d=document.createElement('div'); d.className='card'; d.innerHTML=`<a target="_blank" href="${n.link}">${n.title}</a>`; nbox.appendChild(d); });
}
loadSite();

// ---------- Tools ----------
async function getIP(){
  try{
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipRes.json();
    const geoRes = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
    const geo = await geoRes.json();
    document.getElementById('ipResult').textContent = JSON.stringify({ip:ipData.ip,country:geo.country_name,city:geo.city,org:geo.org},null,2);
  }catch(e){ document.getElementById('ipResult').textContent='تعذر الجلب (CORS/شبكة)'; }
}
function checkStrength(){
  const v=document.getElementById('pwd').value||''; let s=0;
  if(v.length>=12) s++; if(/[A-Z]/.test(v)) s++; if(/[a-z]/.test(v)) s++; if(/[0-9]/.test(v)) s++; if(/[^A-Za-z0-9]/.test(v)) s++;
  const levels=['ضعيفة جداً','ضعيفة','متوسطة','جيدة','قوية']; document.getElementById('pwdResult').textContent='القوة: '+levels[Math.min(s,4)];
}
function genPass(){
  const len=Math.max(8,Math.min(64,parseInt(document.getElementById('len').value||'16')));
  const set=document.getElementById('charset').value==='all'
    ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{};:,.?/'
    : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out=''; for(let i=0;i<len;i++) out+=set[Math.floor(Math.random()*set.length)];
  document.getElementById('genResult').textContent=out;
}
function b64encode(){ const t=document.getElementById('txt').value||''; document.getElementById('cryptoOut').textContent=btoa(unescape(encodeURIComponent(t))); }
function b64decode(){ const t=document.getElementById('txt').value||''; try{document.getElementById('cryptoOut').textContent=decodeURIComponent(escape(atob(t)));}catch(e){document.getElementById('cryptoOut').textContent='نص غير صالح Base64';} }
async function sha256(){
  const t=document.getElementById('txt').value||''; const enc=new TextEncoder().encode(t);
  const buf=await crypto.subtle.digest('SHA-256',enc);
  document.getElementById('cryptoOut').textContent=Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function decodeJWT(){
  const token=(document.getElementById('jwt').value||'').trim();
  const out = document.getElementById('jwtOut');
  if(!token.includes('.')) return out.textContent='توكن غير صالح';
  const [h,p,s] = token.split('.'); try{
    const header=JSON.parse(atob(h.replace(/-/g,'+').replace(/_/g,'/')));
    const payload=JSON.parse(atob(p.replace(/-/g,'+').replace(/_/g,'/')));
    out.textContent=JSON.stringify({header,payload,signature:s},null,2);
  }catch(e){ out.textContent='لا يمكن فك التوكن'; }
}
function testRegex(){
  const pattern=document.getElementById('rePattern').value||'';
  const text=document.getElementById('reText').value||''; try{
    const re=new RegExp(pattern,'g'); const m=text.match(re);
    document.getElementById('reOut').textContent = m? JSON.stringify(m,null,2) : 'لا توجد مطابقات';
  }catch(e){ document.getElementById('reOut').textContent='نمط غير صالح'; }
}
function formatJSON(){
  const t=document.getElementById('jsonText').value||''; try{
    const obj=JSON.parse(t); document.getElementById('jsonOut').textContent=JSON.stringify(obj,null,2);
  }catch(e){ document.getElementById('jsonOut').textContent='JSON غير صالح'; }
}
function makeQR(){
  const t=encodeURIComponent(document.getElementById('qrText').value||''); const url=`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${t}`;
  document.getElementById('qrOut').innerHTML=`<img src="${url}" width="220" height="220" style="border-radius:12px;border:1px solid #1b2836">`;
}
function genUUID(){
  const buf = crypto.getRandomValues(new Uint8Array(16));
  buf[6] = (buf[6] & 0x0f) | 0x40; buf[8] = (buf[8] & 0x3f) | 0x80;
  const hex = [...buf].map(b=>b.toString(16).padStart(2,'0'));
  const uuid = `${hex.slice(0,4).join('')}${hex.slice(4,6).join('')}-${hex.slice(6,8).join('')}-${hex.slice(8,10).join('')}-${hex.slice(10,12).join('')}-${hex.slice(12,16).join('')}`;
  document.getElementById('uuidOut').textContent = uuid;
}
async function hashFile(){
  const f=document.getElementById('fileHash').files[0]; const out=document.getElementById('fileHashOut'); if(!f) return out.textContent='اختر ملفاً';
  const buf=await f.arrayBuffer(); const h=await crypto.subtle.digest('SHA-256',buf);
  const hex=Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join(''); out.textContent=hex;
}
