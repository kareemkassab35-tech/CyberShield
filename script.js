// ===== Navbar Toggle =====
const toggleBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
toggleBtn?.addEventListener('click', ()=> nav.classList.toggle('show'));

// ===== Smooth scroll (native behavior is fine on modern browsers) =====

// ===== IP Tool =====
function getIP(){
  const box = document.getElementById('ipBox');
  box.textContent = 'جارٍ جلب البيانات...';
  fetch('https://api.ipify.org?format=json')
    .then(r=>r.json())
    .then(({ip})=>{
      return Promise.all([
        ip,
        fetch('https://ipapi.co/'+ip+'/json/').then(r=>r.json()).catch(()=>({}))
      ]);
    })
    .then(([ip, geo])=>{
      const where = [geo.city, geo.country_name].filter(Boolean).join('، ');
      const isp = geo.org || geo.org_name || '';
      box.innerHTML = `
        <div><strong>IP:</strong> ${ip}</div>
        ${where ? `<div><strong>الموقع:</strong> ${where}</div>`:''}
        ${isp ? `<div><strong>مزود الخدمة:</strong> ${isp}</div>`:''}
        <div class="muted small">يتم الجلب من ipify + ipapi (مجانًا).</div>
      `;
    })
    .catch(()=> box.textContent = 'تعذر الحصول على البيانات.');
}

// ===== Password Strength =====
function checkPasswordStrength(value){
  const bars = [document.getElementById('m1'), document.getElementById('m2'), document.getElementById('m3'), document.getElementById('m4')];
  bars.forEach(b=>b.classList.remove('on'));
  const out = document.getElementById('pwText');
  if(!value){ out.textContent=''; return; }

  let score = 0;
  if(value.length >= 8) score++;
  if(/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if(/\d/.test(value)) score++;
  if(/[^\w]/.test(value)) score++;

  for(let i=0;i<score;i++) bars[i].classList.add('on');

  const levels = ['ضعيفة','قابلة للتحسين','جيدة','قوية'];
  const tips = [];
  if(value.length < 12) tips.push('زود الطول ≥ 12');
  if(!/[A-Z]/.test(value)) tips.push('أضف حرفًا كبيرًا');
  if(!/[a-z]/.test(value)) tips.push('أضف حرفًا صغيرًا');
  if(!/\d/.test(value)) tips.push('أضف رقمًا');
  if(!/[^\w]/.test(value)) tips.push('أضف رمزًا');

  out.innerHTML = '<strong>القوة:</strong> ' + levels[Math.max(0, score-1)] +
    (tips.length ? '<br><span class="muted small">نصائح: ' + tips.join('، ') + '</span>' : '');
}

// ===== Cybersecurity News (RSS via AllOrigins proxy) =====
function loadNews(){
  const url = 'https://feeds.feedburner.com/TheHackersNews';
  const proxy = 'https://api.allorigins.win/get?url=' + encodeURIComponent(url);
  fetch(proxy)
    .then(r=>r.json())
    .then(data=>{
      const xml = new DOMParser().parseFromString(data.contents, 'text/xml');
      const items = Array.from(xml.querySelectorAll('item')).slice(0,6);
      const list = document.getElementById('newsList');
      list.innerHTML = '';
      items.forEach(it=>{
        const title = it.querySelector('title')?.textContent || 'خبر';
        const link = it.querySelector('link')?.textContent || '#';
        const pub = it.querySelector('pubDate')?.textContent || '';
        const li = document.createElement('li');
        li.innerHTML = `<a href="${link}" target="_blank" rel="noopener">${title}</a><br><span class="muted small">${pub}</span>`;
        list.appendChild(li);
      });
    })
    .catch(()=>{
      document.getElementById('newsList').innerHTML = '<li>تعذر تحميل الأخبار الآن.</li>';
    });
}
document.addEventListener('DOMContentLoaded', loadNews);
