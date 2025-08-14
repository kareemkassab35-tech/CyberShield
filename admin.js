import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { firebaseConfig } from "./firebase-config.js";

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// UI refs
const authSection = document.getElementById('authSection');
const dashSection = document.getElementById('dashSection');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');

const siteName = document.getElementById('siteName');
const heroTitle_ar = document.getElementById('heroTitle_ar');
const heroTagline_ar = document.getElementById('heroTagline_ar');
const heroTitle_en = document.getElementById('heroTitle_en');
const heroTagline_en = document.getElementById('heroTagline_en');
const heroBgUrl = document.getElementById('heroBgUrl');
const bgFile = document.getElementById('bgFile');
const uploadBg = document.getElementById('uploadBg');
const toolsJson = document.getElementById('toolsJson');
const fb = document.getElementById('fb');
const tw = document.getElementById('tw');
const ln = document.getElementById('ln');
const customNewsJson = document.getElementById('customNewsJson');

const saveGeneral = document.getElementById('saveGeneral');
const saveTools = document.getElementById('saveTools');
const saveSocial = document.getElementById('saveSocial');
const saveNews = document.getElementById('saveNews');
const publishAll = document.getElementById('publishAll');

// Auth
loginForm?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  try{
    await signInWithEmailAndPassword(auth, email, pass);
  }catch(err){
    alert('فشل تسجيل الدخول: '+ (err?.message||''));
  }
});
logoutBtn?.addEventListener('click', ()=> signOut(auth));

onAuthStateChanged(auth, async (user)=>{
  if(user){
    authSection.classList.add('hidden');
    dashSection.classList.remove('hidden');
    await loadData();
  }else{
    dashSection.classList.add('hidden');
    authSection.classList.remove('hidden');
  }
});

async function loadData(){
  const ref = doc(db, 'site', 'settings');
  const snap = await getDoc(ref);
  const data = snap.exists()? snap.data() : {};
  siteName.value = data.siteName || 'CyberShield';
  heroTitle_ar.value = data.heroTitle_ar || 'CyberShield - Kareem El Sayed Tawfek Kassab';
  heroTagline_ar.value = data.heroTagline_ar || 'حلول وأدوات الأمن السيبراني — بسيطة وفعالة.';
  heroTitle_en.value = data.heroTitle_en || 'CyberShield - Kareem El Sayed Tawfek Kassab';
  heroTagline_en.value = data.heroTagline_en || 'Cybersecurity tools — simple and effective.';
  heroBgUrl.value = data.heroBgUrl || '';
  toolsJson.value = JSON.stringify(data.tools || [
    {id:'ip',title_ar:'📡 معرفة الـ IP والتفاصيل',title_en:'📡 IP & Geo Lookup',desc_ar:'اعرف عنوان الـIP الحالي وبعض المعلومات العامة.',desc_en:'Detect your IP and general info.'},
    {id:'pw',title_ar:'🔑 اختبار قوة كلمة المرور',title_en:'🔑 Password Strength',desc_ar:'تحليل محلي لقوة كلمة المرور مع نصائح تحسين.',desc_en:'Local password strength meter with tips.'}
  ], null, 2);
  fb.value = (data.social?.fb)||'';
  tw.value = (data.social?.tw)||'';
  ln.value = (data.social?.ln)||'';
  customNewsJson.value = JSON.stringify(data.news||[], null, 2);
}

async function save(partial){
  const ref = doc(db, 'site', 'settings');
  await setDoc(ref, partial, { merge:true });
  alert('تم الحفظ ✅');
}

saveGeneral?.addEventListener('click', async ()=>{
  await save({
    siteName: siteName.value.trim() || 'CyberShield',
    heroTitle_ar: heroTitle_ar.value.trim(),
    heroTagline_ar: heroTagline_ar.value.trim(),
    heroTitle_en: heroTitle_en.value.trim(),
    heroTagline_en: heroTagline_en.value.trim(),
    heroBgUrl: heroBgUrl.value.trim()
  });
});

uploadBg?.addEventListener('click', async ()=>{
  const file = bgFile.files?.[0];
  if(!file){ alert('اختر صورة أولاً'); return; }
  const path = `media/hero/${Date.now()}_${file.name}`;
  const r = sRef(storage, path);
  await uploadBytes(r, file);
  const url = await getDownloadURL(r);
  heroBgUrl.value = url;
  alert('تم الرفع ✅ — تم وضع الرابط في الحقل.');
});

saveTools?.addEventListener('click', async ()=>{
  try{
    const arr = JSON.parse(toolsJson.value);
    await save({ tools: arr });
  }catch(e){ alert('صيغة JSON غير صحيحة'); }
});

saveSocial?.addEventListener('click', async ()=>{
  await save({ social: { fb: fb.value.trim(), tw: tw.value.trim(), ln: ln.value.trim() } });
});

saveNews?.addEventListener('click', async ()=>{
  try{
    const arr = JSON.parse(customNewsJson.value);
    await save({ news: arr });
  }catch(e){ alert('صيغة JSON غير صحيحة'); }
});

publishAll?.addEventListener('click', async ()=>{
  await save({
    siteName: siteName.value.trim() || 'CyberShield',
    heroTitle_ar: heroTitle_ar.value.trim(),
    heroTagline_ar: heroTagline_ar.value.trim(),
    heroTitle_en: heroTitle_en.value.trim(),
    heroTagline_en: heroTagline_en.value.trim(),
    heroBgUrl: heroBgUrl.value.trim(),
    tools: JSON.parse(toolsJson.value||'[]'),
    social: { fb: fb.value.trim(), tw: tw.value.trim(), ln: ln.value.trim() },
    news: JSON.parse(customNewsJson.value||'[]')
  });
});
