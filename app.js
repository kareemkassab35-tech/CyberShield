import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// UI elements
const yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();
let currentLang = 'ar';
const langBtn = document.getElementById('toggleLang');
langBtn?.addEventListener('click', ()=>{
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  langBtn.textContent = currentLang === 'ar' ? 'EN' : 'AR';
  renderFromData(cacheData);
});

// Default data
const defaults = {
  siteName: "CyberShield",
  heroTitle_ar: "CyberShield - Kareem El Sayed Tawfek Kassab",
  heroTitle_en: "CyberShield - Kareem El Sayed Tawfek Kassab",
  heroTagline_ar: "حلول وأدوات الأمن السيبراني — بسيطة وفعالة.",
  heroTagline_en: "Cybersecurity tools — simple and effective.",
  heroBgUrl: "",
  tools: [
    {id:"ip", title_ar:"📡 معرفة الـ IP والتفاصيل", title_en:"📡 IP & Geo Lookup",
     desc_ar:"اعرف عنوان الـIP الحالي وبعض المعلومات العامة.", desc_en:"Detect your IP and general info."},
    {id:"pw", title_ar:"🔑 اختبار قوة كلمة المرور", title_en:"🔑 Password Strength",
     desc_ar:"تحليل محلي لقوة كلمة المرور مع نصائح تحسين.", desc_en:"Local password strength meter with tips."}
  ],
  social: { fb:"", tw:"", ln:"" },
  news: [] // optional manual news
};

let cacheData = defaults;

function renderFromData(data){
  if(!data) return;
  document.title = data.siteName || defaults.siteName;
  const brand = document.getElementById('brandName'); if(brand) brand.textContent = data.siteName || defaults.siteName;
  const heroTitle = document.getElementById('heroTitle');
  const heroTag = document.getElementById('heroTagline');
  const heroEl = document.querySelector('.hero');
  if(heroEl && data.heroBgUrl){ heroEl.style.background = `url('${data.heroBgUrl}') center/cover no-repeat, #0a0e10`; }
  if(heroTitle) heroTitle.textContent = currentLang==='ar' ? (data.heroTitle_ar||defaults.heroTitle_ar) : (data.heroTitle_en||defaults.heroTitle_en);
  if(heroTag) heroTag.textContent = currentLang==='ar' ? (data.heroTagline_ar||defaults.heroTagline_ar) : (data.heroTagline_en||defaults.heroTagline_en);

  // Tools
  const grid = document.getElementById('toolsGrid');
  if(grid){
    grid.innerHTML = "";
    (data.tools || defaults.tools).forEach(t=>{
      const card = document.createElement('article'); card.className='card';
      const title = currentLang==='ar' ? t.title_ar : t.title_en;
      const desc = currentLang==='ar' ? t.desc_ar : t.desc_en;
      card.innerHTML = `<h3>${title}</h3><p class="muted">${desc}</p><div class="tool" data-id="${t.id}"></div>`;
      grid.appendChild(card);
    });
    attachTools();
  }

  // News
  const list = document.getElementById('newsList');
  if(list){
    list.innerHTML = "";
    if(data.news && data.news.length){
      data.news.forEach(n=>{
        const li = document.createElement('li');
        li.innerHTML = `<a href="${n.link}" target="_blank" rel="nofollow noopener">${n.title}</a><br><span class="muted small">${n.date||""}</span>`;
        list.appendChild(li);
      });
    }else{
      // RSS fallback via AllOrigins
      const url = 'https://feeds.feedburner.com/TheHackersNews';
      const proxy = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
      fetch(proxy).then(r=>r.json()).then(data=>{
        const xml = new DOMParser().parseFromString(data.contents,'text/xml');
        Array.from(xml.querySelectorAll('item')).slice(0,6).forEach(it=>{
          const title = it.querySelector('title')?.textContent || 'خبر';
          const link = it.querySelector('link')?.textContent || '#';
          const pub = it.querySelector('pubDate')?.textContent || '';
          const li = document.createElement('li');
          li.innerHTML = `<a href="${link}" target="_blank" rel="noopener">${title}</a><br><span class="muted small">${pub}</span>`;
          list.appendChild(li);
        });
      }).catch(()=> list.innerHTML = '<li>تعذر تحميل الأخبار.</li>');
    }
  }

  // Footer
  const copy = document.getElementById('footerCopy');
  if(copy) copy.innerHTML = `© ${new Date().getFullYear()} ${data.siteName || 'CyberShield'}`;
}

// Attach built-in tools
function attachTools(){
  document.querySelectorAll('.tool').forEach(el=>{
    const id = el.dataset.id;
    if(id==='ip'){
      const btn = document.createElement('button'); btn.className='btn small'; btn.textContent = currentLang==='ar'?'اعرض بياناتي':'Show my data';
      const box = document.createElement('div'); box.className='card'; box.style.marginTop='8px';
      btn.onclick = ()=>{
        box.textContent = currentLang==='ar'?'جارٍ الجلب...':'Fetching...';
        fetch('https://api.ipify.org?format=json').then(r=>r.json()).then(({ip})=>{
          return Promise.all([ip, fetch('https://ipapi.co/'+ip+'/json/').then(r=>r.json()).catch(()=>({}))]);
        }).then(([ip,geo])=>{
          const where = [geo.city, geo.country_name].filter(Boolean).join(currentLang==='ar'?'، ':', ');
          const isp = geo.org || geo.org_name || '';
          box.innerHTML = `<div><strong>IP:</strong> ${ip}</div>
                           ${where?`<div><strong>${currentLang==='ar'?'الموقع':'Location'}:</strong> ${where}</div>`:''}
                           ${isp?`<div><strong>ISP:</strong> ${isp}</div>`:''}`;
        }).catch(()=> box.textContent = currentLang==='ar'?'فشل الجلب':'Failed to fetch');
      };
      el.append(btn, box);
    }
    if(id==='pw'){
      const input = document.createElement('input'); input.type='password'; input.placeholder = currentLang==='ar'?'أدخل كلمة المرور':'Enter password';
      const meter = document.createElement('div'); meter.className='card'; meter.style.marginTop='8px';
      input.oninput = ()=>{
        const v = input.value; let score=0;
        if(v.length>=8) score++; if(/[A-Z]/.test(v)&&/[a-z]/.test(v)) score++; if(/\d/.test(v)) score++; if(/[^\w]/.test(v)) score++;
        const levels = currentLang==='ar'?['ضعيفة','قابلة للتحسين','جيدة','قوية']:['Weak','Improve','Good','Strong'];
        const tips = [];
        if(v.length<12) tips.push(currentLang==='ar'?'زود الطول ≥ 12':'Use ≥ 12 chars');
        if(!/[A-Z]/.test(v)) tips.push(currentLang==='ar'?'أضف حرفًا كبيرًا':'Add uppercase');
        if(!/[a-z]/.test(v)) tips.push(currentLang==='ar'?'أضف حرفًا صغيرًا':'Add lowercase');
        if(!/\d/.test(v)) tips.push(currentLang==='ar'?'أضف رقمًا':'Add a number');
        if(!/[^\w]/.test(v)) tips.push(currentLang==='ar'?'أضف رمزًا':'Add a symbol');
        meter.innerHTML = `<strong>${currentLang==='ar'?'القوة':'Strength'}:</strong> ${levels[Math.max(0,score-1)]}
          ${tips.length?`<br><span class="muted small">${(currentLang==='ar'?'نصائح: ':'Tips: ')+tips.join(currentLang==='ar'?'، ':', ')}</span>`:''}`;
      };
      el.append(input, meter);
    }
  });
}

// Firestore live data
const ref = doc(db, 'site', 'settings');
onSnapshot(ref, (snap)=>{
  cacheData = snap.exists()? {...defaults, ...snap.data()} : defaults;
  renderFromData(cacheData);
}, (e)=>{
  console.error('Firestore error', e);
  renderFromData(defaults);
});
